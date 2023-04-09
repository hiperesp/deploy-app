import Model from "./Model.js";

export default class App extends Model {

    #namespace;

    #name;

    #proxyPorts;
    #domains;
    #psScale;

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

    async refresh({proxyPorts, domains, psScale}) {
        this.#proxyPorts = proxyPorts;
        this.#domains = domains;
        this.#psScale = psScale;
        this.#lastRefreshTime = Date.now();
    }

    async getLogs(type) {
        return (await this.#namespace.getAppLogs(this.name, type))[this.name];
    }

    async scale(options, onLog = null) {
        await this.#namespace.scaleApp(this.name, options, onLog);
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

            _lastRefreshTime: this.lastRefreshTime,
        }
    }
}