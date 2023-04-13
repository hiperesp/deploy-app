import Model from "./Model.js";

export default class App extends Model {

    #namespace;

    #name;

    #proxyPorts;
    #domains;
    #psScale;
    #ssl;

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

    async refresh({proxyPorts, domains, psScale, ssl}) {
        this.#proxyPorts = proxyPorts;
        this.#domains = domains;
        this.#psScale = psScale;
        this.#ssl = ssl;
        this.#lastRefreshTime = Date.now();
    }

    async scale(options, onStdout = null, onStderr) {
        await this.#namespace.scaleApp(this.name, options, onStdout, onStderr);
    }

    getContainers() {
        return []
    }

    toJson() {
        return {
            name: this.name,
            online: this.online,

            proxyPorts: this.proxyPorts,
            replicas: this.replicas,
            domains: this.domains,
            ssl: this.ssl,

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