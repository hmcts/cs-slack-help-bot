const fetch = require('node-fetch-retry');
const ServiceTemplate = require("../model/ServiceTemplate");
const Product = require("../model/Product");
const {getSlackClient} = require("../modules/slack");
const Environment = require('../model/Environment');
const config = require('config');

const reportingAfterFailedAttempts = config.get('slack.reporting.after_failed_attempts');

const slack = getSlackClient();

const prodOverride = (env, prodUrl, defaultTemplateUrl) => {
    return env === Environment.PROD ? prodUrl : defaultTemplateUrl;
}

const refreshDelay = 60;
const products = [
    new Product("am", "Access Management", [
        new ServiceTemplate("am-judicial-booking-service", env => `http://am-judicial-booking-service-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("am-org-role-mapping-service", env => `http://am-org-role-mapping-service-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("am-role-assignment-service", env => `http://am-role-assignment-service-${env}.service.core-compute-${env}.internal`),
    ], false),
    new Product("ccd", "Core Case Data", [
        new ServiceTemplate("manage-case-assignment", env => `http://aac-manage-case-assignment-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccd-admin-web", env => prodOverride(env, `https://ccd-admin-web.platform.hmcts.net`, `https://ccd-admin-web.${env}.platform.hmcts.net`)),
        new ServiceTemplate("ccd-api-gateway-web", env => prodOverride(env, `https://gateway.ccd.platform.hmcts.net`, `https://gateway-ccd.${env}.platform.hmcts.net`)),
        new ServiceTemplate("ccd-case-activity-api", env => `http://ccd-case-activity-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccd-case-document-am-api", env => `http://ccd-case-document-am-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccd-case-print-service", env => prodOverride(env, `https://return-case-doc.ccd.platform.hmcts.net`, `https://return-case-doc-ccd.${env}.platform.hmcts.net`)),
        new ServiceTemplate("ccd-data-store-api", env => `http://ccd-data-store-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccd-definition-store-api", env => `http://ccd-definition-store-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccd-message-publisher", env => `http://ccd-message-publisher-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccd-test-stubs-service", env => `http://ccd-test-stubs-service-${env}.service.core-compute-${env}.internal`, [ Environment.DEMO, Environment.AAT ]),
        new ServiceTemplate("ccd-user-profile-api", env => `http://ccd-user-profile-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("case-payment-orders-api", env => `http://cpo-case-payment-orders-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ts-translation-service", env => `http://ts-translation-service-${env}.service.core-compute-${env}.internal`),
    ], true),
    new Product("cui", "CUI Reasonable Adjustments", [
        new ServiceTemplate("cui-ra", env => `https://cui-ra.${env}.platform.hmcts.net`, [ Environment.AAT ]),
    ], false),
    new Product("em", "Evidence Management", [
        new ServiceTemplate("dg-docassembly", env => `http://dg-docassembly-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("dm-store", env => `http://dm-store-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("em-anno", env => `http://em-anno-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("em-ccd-orchestrator", env => `http://em-ccd-orchestrator-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("em-hrs-api", env => `http://em-hrs-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("em-npa", env => `http://em-npa-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("em-stitching", env => `http://em-stitching-${env}.service.core-compute-${env}.internal`),
    ], false),
    new Product("xui", "Expert UI", [
        new ServiceTemplate("xui-ao-webapp", env => prodOverride(env, `https://administer-orgs.platform.hmcts.net`, `https://administer-orgs.${env}.platform.hmcts.net`)),
        new ServiceTemplate("xui-mo-webapp", env => prodOverride(env, `https://manage-org.platform.hmcts.net`, `https://manage-org.${env}.platform.hmcts.net`)),
        new ServiceTemplate("xui-webapp", env => prodOverride(env, `https://manage-case.platform.hmcts.net`, `https://manage-case.${env}.platform.hmcts.net`)),
        new ServiceTemplate("xui-webapp-ac-integration", () => `https://manage-case-ac-int.demo.platform.hmcts.net`, [ Environment.DEMO ]),
        new ServiceTemplate("xui-webapp-caa-assigned-case-view", () => `https://manage-case-caa-assigned-case-view.demo.platform.hmcts.net`, [ Environment.DEMO ]),
        new ServiceTemplate("xui-webapp-hearings-integration", () => `https://manage-case-hearings-int.demo.platform.hmcts.net`, [ Environment.DEMO ]),
        new ServiceTemplate("xui-webapp-integration", () => `https://manage-case-int.demo.platform.hmcts.net`, [ Environment.DEMO ]),
        new ServiceTemplate("xui-webapp-integration1", () => `https://manage-case-int1.demo.platform.hmcts.net`, [ Environment.DEMO ]),
        new ServiceTemplate("xui-webapp-integration2", () => `https://manage-case-int2.demo.platform.hmcts.net`, [ Environment.DEMO ]),
        new ServiceTemplate("xui-webapp-wa-integration", () => `https://manage-case-wa-int.demo.platform.hmcts.net`, [ Environment.DEMO ]),
    ], true),
    new Product("fees-pay", "Fee & Payments", [
        new ServiceTemplate("bar-api", env => `http://bar-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("bar-web", env => prodOverride(env, `https://manage-payments.platform.hmcts.net`, `https://bar.${env}.platform.hmcts.net`)),
        new ServiceTemplate("ccpay-bubble-frontend", env => prodOverride(env, `https://paybubble.platform.hmcts.net`, `https://paybubble.${env}.platform.hmcts.net`)),
        new ServiceTemplate("ccpay-bulkscanning-api", env => `http://ccpay-bulkscanning-api-${env}.service.core-compute-${env}.internal`),
        // new ServiceTemplate("ccpay-cpo-update-service", env => `http://ccpay-cpo-update-service-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccpay-notifications-service", env => `http://ccpay-notifications-service-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("ccpay-payment-api", env => `http://payment-api-${env}.service.core-compute-${env}.internal`),
        // new ServiceTemplate("ccpay-paymentoutcome-web", env => prodOverride(env, `https://paymentoutcome-web.platform.hmcts.net`, `https://paymentoutcome-web.${env}.platform.hmcts.net`)),
        new ServiceTemplate("ccpay-refunds-api", env => `http://ccpay-refunds-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("fees-register-api", env => `http://fees-register-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("fees-register-frontend", env => prodOverride(env, `https://fees-register.platform.hmcts.net`, `https://fees-register-api-${env}.service.core-compute-${env}.internal`)),
    ], false),
    new Product("hmc", "Hearings Management Component", [
        new ServiceTemplate("hmc-cft-hearing-service", env => `http://hmc-cft-hearing-service-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("hmc-hmi-inbound-adapter", env => `http://hmc-hmi-inbound-adapter-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("hmc-hmi-outbound-adapter", env => `http://hmc-hmi-outbound-adapter-${env}.service.core-compute-${env}.internal`),
    ], false),
    new Product("idam", "IDAM", [
        new ServiceTemplate("idam-api", env => prodOverride(env, `https://idam-api.platform.hmcts.net`, `https://idam-api.${env}.platform.hmcts.net`)),
        // new ServiceTemplate("idam-hmcts-access", env => `https://hmcts-access.${env}.platform.hmcts.net`),
        new ServiceTemplate("idam-user-dashboard", env => prodOverride(env, `https://idam-user-dashboard.platform.hmcts.net`, `https://idam-user-dashboard.${env}.platform.hmcts.net`)),
        // new ServiceTemplate("idam-web-admin", env => prodOverride(env, `https://idam-web-admin.platform.hmcts.net`, `https://idam-web-admin.${env}.platform.hmcts.net`)),
        new ServiceTemplate("idam-web-public", env => prodOverride(env, `https://hmcts-access.service.gov.uk`, `https://idam-web-public.${env}.platform.hmcts.net`)),
    ], false),
    new Product("jps", "Judicial Payments Service", [
        // To be deployed
    ], false),
    new Product("lau", "Log & Audit", [
        new ServiceTemplate("lau-case-backend", env => `http://lau-case-backend-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("lau-frontend", env => prodOverride(env, `https://log-and-audit.platform.hmcts.net`, `https://lau.${env}.platform.hmcts.net`)),
        new ServiceTemplate("lau-idam-backend", env => `http://lau-idam-backend-${env}.service.core-compute-${env}.internal`),
    ], false),
    new Product("pcq", "Protected Characteristics Questionnaire", [
        new ServiceTemplate("pcq-backend", env => `http://pcq-backend-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("pcq-frontend", env => prodOverride(env, `https://equality-and-diversity.platform.hmcts.net`, `https://pcq.${env}.platform.hmcts.net`)),
    ], false),
    new Product("rd", "Reference Data", [
        new ServiceTemplate("rd-caseworker-ref-api", env => `http://rd-caseworker-ref-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("rd-commondata-api", env => `http://rd-commondata-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("rd-judicial-api", env => `http://rd-judicial-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("rd-location-ref-api", env => `http://rd-location-ref-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("rd-professional-api", env => `http://rd-professional-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("rd-profile-sync", env => `http://rd-profile-sync-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("rd-user-profile-api", env => `http://rd-user-profile-api-${env}.service.core-compute-${env}.internal`),
    ], false),
    new Product("tm", "Task Management", [
        new ServiceTemplate("wa-case-event-handler-java", env => `http://wa-case-event-handler-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("wa-task-management-api-java", env => `http://wa-task-management-api-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("wa-task-monitor-java", env => `http://wa-task-monitor-${env}.service.core-compute-${env}.internal`),
        new ServiceTemplate("wa-workflow-api-java", env => `http://wa-workflow-api-${env}.service.core-compute-${env}.internal`),
    ], false)
];

const getAllProducts = () => products;

const monitorProductStatus = () => { 
    products.forEach(product => {
        Object.entries(product.services).forEach(([env, services]) => {
            services.forEach(service => {
                const controller = new AbortController();
                const signal = controller.signal;
    
                new Promise((resolve, reject) => {
                    fetch(service.url + '/health', { signal, retry: 3, pause: 1500, silent: true })
                        .then(response => {
                            if(response.ok) {
                                resolve(response.json())
                            } else {
                                reject(`${response.status} - ${response.statusText}`)
                            }
                        })
                        .catch(reject);
    
                    setTimeout(() => {
                        controller.abort();
                        reject();
                    }, refreshDelay * 1000);
                })
                    .then(data => {
                        if (data.status === 'UP') {
                            service.setLastSeen((Date.now()));
                            if (service.reportedDown && product.shouldReport()) {
                                postUpMessage(service, product);
                            }
                        }
                    })
                    .catch((e) => {
                        service.failedChecks++;
                        console.log(`service ${service.url} is down - checks: ${service.failedChecks}, reported already: ${service.reportedDown}`);
                        if (service.failedChecks >= reportingAfterFailedAttempts && !service.reportedDown && product.shouldReport()) {
                            postDownMessage(service, product);
                        }
                    });
            })
        });
    })
}

const postUpMessage = async (service, product) => {
    try {
        await slack.chat.postMessage({
            channel: product.internalChannel,
            thread_ts: service.reportedDownSlackThread,
            text: `Service Restored - ${service.url} in ${service.env.toUpperCase()}`,
            blocks: [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Service Restored :tada:"
                    }
                }
            ]
        });
        await slack.reactions.add({
            channel: product.internalChannel,
            timestamp: service.reportedDownSlackThread,
            name: 'up'
        });
    } catch(e) {
        console.log(e);
    } finally {
        service.resetReportedDown();
    }
}

const postDownMessage = async (service, product) => {
    let result = {};
    try {
        console.log(`publishing down for ${service.url} to ${product.internalChannel}`);
        result = await slack.chat.postMessage({
            channel: product.internalChannel,
            text: `Service Down - ${service.url} in ${service.env.toUpperCase()}`,
            blocks: [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Service Down :rotating_light:"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Service:* ${service.getMarkdownLink()}\n*Environment:* ${service.env.toUpperCase()}`
                    }
                }
            ]
        });
    } catch(e) {
        console.log(e);
    } finally {
        service.setReportedDown(result?.ts);
    }
}

monitorProductStatus();
setInterval(monitorProductStatus, refreshDelay * 1000)

module.exports = { getAllProducts };
