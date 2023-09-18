class ServiceTemplate {
    constructor(name, urlFunction, exclusiveEnvs = []) {
        this.name = name;
        this.urlFunction = urlFunction;
        this.exclusiveEnvs = exclusiveEnvs;
    }

    getUrl(env) {
        return this.urlFunction(env);
    }

    existsInEnv(env) {
        return this.exclusiveEnvs.length === 0 || this.exclusiveEnvs.includes(env);
    }
}

module.exports = ServiceTemplate;
