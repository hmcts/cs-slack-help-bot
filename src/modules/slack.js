const { App, LogLevel } = require('@slack/bolt');
const config = require('config')

const app = new App({
    token: config.get('slack.bot_token'), //disable this if enabling OAuth in socketModeReceiver
    // logLevel: LogLevel.DEBUG,
    appToken: config.get('slack.app_token'),
    socketMode: true,
});

(async () => {
    await app.start();
    console.log('⚡️ Bolt app started');
})();

app.event('app_home_opened', async ({ event, client }) => {
    await reopenAppHome(client, event.user);
});

const reopenAppHome = async (client, userId) => {
    await client.views.publish({
        user_id: userId,
        view: {
            type: "home",
            blocks: []
        },
    });
}

const getSlackClient = () => app.client;

const getReceiverClient = () => app.receiver.client;

const addWorkflowStep = (callbackId, fn) => app.function(callbackId, fn);

module.exports = { getSlackClient, addWorkflowStep, getReceiverClient };
