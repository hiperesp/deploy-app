import Model from "./Model.js";

export default class App extends Model {

    #namespace;

    #name;

    #proxyPorts;
    #domains;
    #psScale;
    #ssl;
    #config;
    #psInspect;

    #lastRefreshTime = 0;

    constructor(namespace, options) {
        super()
        this.#namespace = namespace
        this.#name = options.name
    }

    get namespace() {
        return this.#namespace;
    }

    get name() {
        return this.#name;
    }

    get proxyPorts() {
        return this.#proxyPorts;
    }
    get domains() {
        return this.#domains;
    }
    get ssl() {
        return this.#ssl;
    }
    get config() {
        const typesPrefixes = {
            deployApp: ["DEPLOY_APP_"],
            dokku: ["DOKKU_", "GIT_REV"],
            userDefined: [""],
        };
        const output = {
            all: this.#config
        };

        loopKey: for(const key in output.all) {
            for(const type in typesPrefixes) {
                for(const prefix of typesPrefixes[type]) {
                    if(key.startsWith(prefix)) {
                        if(!output[type]) {
                            output[type] = {};
                        }
                        output[type][key] = output.all[key];
                        continue loopKey;
                    }
                }
            }
        }
        return output;
    }
    get psInspect() {
        return this.#psInspect;
    }

    get replicas() {
        return this.#psScale;
    }

    get online() {
        let replicas = 0;
        for(const key in this.replicas) {
            replicas += this.replicas[key];
        }
        return replicas > 0;
    }

    get lastRefreshTime() {
        return this.#lastRefreshTime;
    }

    async refresh({ proxyPorts, domains, psScale, ssl, config, psInspect }) {
        this.#proxyPorts = proxyPorts;
        this.#domains = domains;
        this.#psScale = psScale;
        this.#ssl = ssl;
        this.#config = config;
        this.#psInspect = psInspect;
        this.#lastRefreshTime = Date.now();
    }

    async scale(options, onStdout = null, onStderr) {
        await this.#namespace.scaleApp(this.name, options, onStdout, onStderr);
    }

    async generateSSL(onStdout = null, onStderr) {
        await this.#namespace.generateAppSSL(this.name, onStdout, onStderr);
    }
    async removeSSL(onStdout = null, onStderr) {
        await this.#namespace.removeAppSSL(this.name, onStdout, onStderr);
    }

    async configSet(options, onStdout = null, onStderr) {
        await this.#namespace.configSetApp(this.name, options, onStdout, onStderr);
    }
    async configUnset(options, onStdout = null, onStderr) {
        await this.#namespace.configUnsetApp(this.name, options, onStdout, onStderr);
    }

    async deploy(ref, onStdout = null, onStderr) {
        try {
            const remote = JSON.parse(this.config.deployApp.DEPLOY_APP_GIT).REPO;
            await this.#namespace.deployApp(this.name, remote, ref, onStdout, onStderr);
        } catch (e) {
            throw new Error(`Invalid deploy configuration: ${e.message}`);
        }
    }
    async restart(onStdout = null, onStderr) {
        await this.#namespace.restartApp(this.name, onStdout, onStderr);
    }

    async setPorts(ports, onStdout = null, onStderr) {
        await this.#namespace.setAppPorts(this.name, ports, onStdout, onStderr);
    }
    async setExposeAllPorts(exposeAllPorts, onStdout = null, onStderr) {
        await this.#namespace.setExposeAllAppPorts(this.name, exposeAllPorts, onStdout, onStderr);
    }

    toJson() {
        return {
            name: this.name,
            online: this.online,

            proxyPorts: this.proxyPorts,
            replicas: this.replicas,
            domains: this.domains,
            ssl: this.ssl,
            config: this.config,
            psInspect: this.psInspect,

            _lastRefreshTime: this.lastRefreshTime,
        }
    }


    async realTimeAppLogs(onStdout, onStderr) {
        return this.namespace.getAppLogs(this.name, onStdout, onStderr);
    }
    async realTimeAccessLogs(onStdout, onStderr) {
        return this.namespace.getNginxAccessLogs(this.name, onStdout, onStderr);
    }
    async realTimeErrorLogs(onStdout, onStderr) {
        return this.namespace.getNginxErrorLogs(this.name, onStdout, onStderr);
    }

}