const config = require('config');
const { get, set } = require('lodash');

const setSecret = (secretPath, configPath) => {
    // Only overwrite the value if the secretPath is defined
    if (config.has(secretPath)) {
        set(config, configPath, get(config, secretPath));
    }
};

const setup = () => {
    if (config.has('secrets.cftptl-intsvc')) {
        setSecret('secrets.cftptl-intsvc.cs-slack-bot-token', 'slack.bot_token');
        setSecret('secrets.cftptl-intsvc.cs-slack-app-token', 'slack.app_token');
        setSecret('secrets.cftptl-intsvc.app-insights-instrumentation-key', 'app_insights.instrumentation_key');
        setSecret('secrets.cftptl-intsvc.cs-elastic-url', 'elastic.url');
    }
};

module.exports = { setup };
