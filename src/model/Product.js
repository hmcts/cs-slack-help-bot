const Service = require("./Service");
const config = require('config');
const Environment = require('./Environment');

const reportingStartHour = config.get('slack.reporting.start_hour');
const reportingEndHour = config.get('slack.reporting.end_hour');

class Product {
    constructor(id, desc, serviceTemplates, isReportingEnabled) {
        this.id = id;
        this.desc = desc;
        this.services = getServicesFromTemplates(serviceTemplates);
        this.internalChannel = getInternalChannel(id);
        this.supportChannel = getSupportChannel(id);
        this.isReportingEnabled = isReportingEnabled;
    }

    getMarkdown(env) {
        const strings = [];
        const ticks = [];
        const crosses = [];

        this.services[env].forEach(service => {
            if (service.isAvailable()) {
                ticks.push(service);
            } else {
                crosses.push(service);
            }
        });

        strings.push(`:white_check_mark: *Services Up:* ${ticks.length == 0 ? 'None :crycat:' : ticks.map(service => service.getMarkdownLink()).join(', ')}\n\n`);
        if (crosses.length > 0) {
            strings.push(`:x: *Services Down:* ${crosses.map(service => service.getMarkdownLink()).join(', ')}\n\n`);
        }
        if (this.supportChannel) {
            strings.push(`:raising_hand: *Support Channel:* <#${this.supportChannel}>`);
        }
        strings.push(`\n\n`);

        return strings.join('');
    }

    shouldReport() {
        console.log(`product ${this.id} - reporting enabled: ${this.isReportingEnabled}`);
        if (!this.isReportingEnabled) {
            return false;
        }
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        console.log(`current day ${currentDay} (${1 <= currentDay && currentDay <= 5}); current hour ${currentHour} (${reportingStartHour <= currentHour && currentHour <= reportingEndHour}); start hour ${reportingStartHour}; end hour ${reportingEndHour}`);
        return (1 <= currentDay && currentDay <= 5) && (reportingStartHour <= currentHour && currentHour <= reportingEndHour); 
    }
}

function getServicesFromTemplates(serviceTemplates) {
    const services = {
        [Environment.AAT]: getServices(Environment.AAT, serviceTemplates),
        [Environment.PERFTEST]: getServices(Environment.PERFTEST, serviceTemplates),
        [Environment.ITHC]: getServices(Environment.ITHC, serviceTemplates),
        [Environment.DEMO]: getServices(Environment.DEMO, serviceTemplates),
        [Environment.PROD]: getServices(Environment.PROD, serviceTemplates),
    }

    return services;
}

function getServices(env, serviceTemplates) {
    const services = [];
    
    serviceTemplates.forEach(template => {
        if (template.existsInEnv(env)){
            services.push(new Service(template.name, template.getUrl(env), env));
        }
    });

    return services;
}

function getInternalChannel(id) {
    return config.get(`slack.product_internal_channel.${id}`);
}

function getSupportChannel(id) {
    const secret = `slack.product_support_channel.${id}`;
    if (config.has(secret)) {
        return config.get(secret);
    }
    return null;
}

module.exports = Product;
