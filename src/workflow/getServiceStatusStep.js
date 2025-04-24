const {WorkflowStep} = require("@slack/bolt");
const {getAllProducts} = require("../service/serviceStatus");
const Environment = require('../model/Environment');

const getServiceStatusWorkflowStep = async ({ client, inputs, fail }) => {
    console.log('executed step with inputs', JSON.stringify(inputs));
    const blocks = [];
    const products = getAllProducts();
    
    const env = inputs.env.value.value;

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
    const channel = inputs.channel.value;
    console.log(`publishing to channel ${channel}`);
    try {
        await client.chat.postEphemeral({
            channel: channel,
            user: inputs.user.value,
            username: 'Common Services Environments',
            blocks: blocks,
            text: 'Service status'
        });
    } catch (error) {
        console.error(error);
    }
};

module.exports = { getServiceStatusWorkflowStep };
