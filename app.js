const config = require('@hmcts/properties-volume').addTo(require('config'))
const setupSecrets = require('./src/setupSecrets');
// must be called before any config.get calls
setupSecrets.setup();

const {getServiceStatusWorkflowStep} = require("./src/workflow/getServiceStatusStep");
const appInsights = require('./src/modules/appInsights')
const {addWorkflowStep, getReceiverClient} = require("./src/modules/slack");
const {getAllProducts} = require("./src/service/serviceStatus");

appInsights.enableAppInsights()

const http = require('http');
const port = process.env.PORT || 3000

// Set up healthcheck page
const server = http.createServer((req, res) => {
    const slackReceiver = getReceiverClient();
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end("error")
    } else if (req.url === '/health') {
        const connectionError = slackReceiver.badConnection;
        if (connectionError) {
            res.statusCode = 500;
        } else {
            res.statusCode = 200;
        }
        const myResponse = {
            status: "UP",
            slack: {
                connection: connectionError ? "DOWN" : "UP",
            },
            node: {
                uptime: process.uptime(),
                time: new Date().toString(),
            }
        };
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(myResponse))
    } else if (req.url === '/health/liveness') {
        if (slackReceiver.badConnection) {
            res.statusCode = 500
            res.end('Internal Server Error');
            return;
        }
        res.end('OK');
    } else if (req.url === '/health/readiness') {
        res.end(`<h1>cs-slack-help-bot</h1>`)
    } else if (req.url === '/health/error') {
        // Dummy error page
        res.statusCode = 500;
        res.end(`{"error": "${http.STATUS_CODES[500]}"}`)
    } else if (req.url === '/api/products') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(getAllProducts()))
    } else {
        res.statusCode = 404;
        res.end(`{"error": "${http.STATUS_CODES[404]}"}`)
    }
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

addWorkflowStep(getServiceStatusWorkflowStep());
