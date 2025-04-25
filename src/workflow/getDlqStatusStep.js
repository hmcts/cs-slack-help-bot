const {getDlqStats, getDlqCount} = require('../service/dlqStatus');

const getDlqStatusWorkflowStep = async ({ client, inputs, fail }) => {
    try {
        console.log('executed step with inputs', JSON.stringify(inputs));

        const stats = await getDlqStats();
        stats.forEach((value, key) => {
            console.log(`Case type ${key} has ${value} DLQ messages`);
        });
        const totalDlq = Array.from(stats.values()).reduce((acc, val) => acc + val, 0);
        console.log(`Total DLQ messages: ${totalDlq}`);

        const dlqCount = await getDlqCount();

        const blocks = createDlqSlackBlocks(stats, dlqCount);

        console.log(JSON.stringify(blocks));
        const channel = inputs.channel;
        console.log(`publishing to channel ${channel}`);
        await client.chat.postEphemeral({
            channel: channel,
            user: inputs.user,
            username: 'Elasticsearch DLQ Status',
            blocks: blocks,
            text: ':rotating_light: DLQ Status'
        });
    } catch (error) {
        console.error(error);
        fail({ error: `Failed to handle function request: ${error}` });
    }
};

function createDlqSlackBlocks(resultsMap, dlqCount) {
    const now = new Date().toLocaleString();
  
    const headerLine = '`Case Type             | Count`';
    const dividerLine = '`----------------------|------`';
  
    const lines = [...resultsMap.entries()].map(([caseType, count]) => {
      const paddedType = caseType.padEnd(22);
      const paddedCount = String(count).padStart(5);
      return `\`${paddedType}| ${paddedCount}\``;
    });
  
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':clipboard: Dead Letter Queue Status',
          emoji: true
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Generated: ${now}`
          }
        ]
      },
      {
        type: 'divider'
      }
    ];
  
    if (lines.length === 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':white_check_mark: No DLQ messages found. All clear!'
        }
      });
    } else {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [headerLine, dividerLine, ...lines].join('\n')
        }
      });
    }

    blocks.push({ "type": "divider" });
    blocks.push({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `\n>Total DLQ size: \`${dlqCount}\`\n`
        }
    });
  
    return blocks;
}

module.exports = { getDlqStatusWorkflowStep };
