const {WorkflowStep} = require("@slack/bolt");
const {getAllProducts} = require("../service/serviceStatus");
const config = require("config");
const reportChannelId = config.get('slack.report_channel_id');
const Environment = require('../model/Environment');

function getServiceStatusWorkflowStep() {
    return new WorkflowStep('get_service_status_step', {
        edit: async ({ ack, step, configure, client }) => {
            await ack();
            console.log('edit workflow started', JSON.stringify(step));

            const blocks = workflowStepBlocks(step.inputs);
            console.log(JSON.stringify(blocks));
            await configure({ blocks });
        },
        save: async ({ ack, step, view, update, client }) => {
            await ack();

            const { values } = view.state;
            console.log('view', view.state);
            console.log('values', values);
            const inputs = workflowStepView(values);
            const outputs = [];
            await update({ inputs, outputs });
        },
        execute: async ({ step, complete, fail, client }) => {
            const blocks = [];
            const products = getAllProducts();
            const env = step.inputs.env.value.value;
    
            blocks.push({
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Common Services " + env.toUpperCase(),
                }
            });

            products.forEach(product => {
                if (product.services[env].length > 0) {
                    blocks.push({
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": product.desc
                        }
                    });
                    blocks.push({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": product.getMarkdown(env)
                        }
                    });
                }
            });

            blocks.push({ "type": "divider" });
            
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `\n>This is up to date as of ${new Date().toLocaleString()} UTC \n`
                }
            });

            console.log(JSON.stringify(blocks));
            const channel = step.inputs.channel.value;
            console.log(`publishing to channel ${channel}`);
            try {
                await client.chat.postEphemeral({
                    channel: channel,
                    user: step.inputs.user.value,
                    username: 'Common Services Environments',
                    blocks: blocks,
                    text: 'Service status'
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
}

function workflowStepBlocks(inputs) {
    return [
        {
            "type": "input",
            "block_id": "user",
            "label": {
                "type": "plain_text",
                "text": "Ticket raiser"
            },
            "element": {
                "type": "users_select",
                "action_id": "user",
                "initial_user": inputs?.user?.value ?? " ",
            }
        },
        {
            "type": "input",
            "block_id": "channel",
            "label": {
                "type": "plain_text",
                "text": "Channel"
            },
            "element": {
                "type": "conversations_select",
                "action_id": "channel",
                "initial_conversation": inputs?.channel?.value ?? " ",
            }
        },
        {
            "type": "input",
            "block_id": "env",
            "label": {
                "type": "plain_text",
                "text": "Environment"
            },
            "element": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an environment",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "Production",
							"emoji": true
						},
						"value": Environment.PROD
					},
					{
						"text": {
							"type": "plain_text",
							"text": "AAT",
							"emoji": true
						},
						"value": Environment.AAT
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Demo",
							"emoji": true
						},
						"value": Environment.DEMO
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Perftest",
							"emoji": true
						},
						"value": Environment.PERFTEST
					},
					{
						"text": {
							"type": "plain_text",
							"text": "ITHC",
							"emoji": true
						},
						"value": Environment.ITHC
					}
				],
				"action_id": "env"
			}
        }
    ];
}

function workflowStepView(values) {
    return {
        user: {
            value: values.user.user.selected_user
        },
        channel: {
            value: values.channel.channel.selected_conversation
        },
        env: {
            value: values.env.env.selected_option
        }
    }
}

module.exports = { getServiceStatusWorkflowStep };
