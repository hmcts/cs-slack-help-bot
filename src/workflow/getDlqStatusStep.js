const {getDlqStats} = require('../service/dlqStatus');

const getDlqStatusWorkflowStep = async ({ client, inputs, fail }) => {
    try {
        console.log('executed step with inputs', JSON.stringify(inputs));
        const blocks = [];

        const stats = await getDlqStats();
        stats.forEach((value, key) => {
            console.log(`Case type ${key} has ${value} DLQ messages`);
        });
        const totalDlq = Array.from(stats.values()).reduce((acc, val) => acc + val, 0);
        console.log(`Total DLQ messages: ${totalDlq}`);

        blocks.push({
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "DLQ Status",
            }
        });

        stats.forEach((value, key) => {
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Case type ${key} has ${value} DLQ messages`
                }
            });
        });

        console.log(JSON.stringify(blocks));
        const channel = inputs.channel;
        console.log(`publishing to channel ${channel}`);
        await client.chat.postEphemeral({
            channel: channel,
            user: inputs.user,
            username: 'Elasticsearch DLQ Status',
            blocks: blocks,
            text: 'DLQ Status'
        });
    } catch (error) {
        console.error(error);
        fail({ error: `Failed to handle function request: ${error}` });
    }
};

module.exports = { getDlqStatusWorkflowStep };
