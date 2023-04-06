import Model from "./Model.js";

export default class App extends Model {

    #namespace;

    #name;

    #proxyPorts;
    #domains;
    #psScale;

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
        return {
            web: this.#psScale.web,
            worker: this.#psScale.worker,
        };
    }

    get online() {
        let replicas = 0;
        for(const key in this.replicas) {
            replicas += this.replicas[key];
        }
        return replicas > 0;
    }

    async refresh({proxyPorts, domains, psScale}) {
        this.#proxyPorts = proxyPorts;
        this.#domains = domains;
        this.#psScale = {
            web: psScale.web || 0,
            worker: psScale.worker || 0,
        };
    }

    async getLogs(type) {
        return (await this.#namespace.getAppLogs(this.name, type))[this.name];
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
        }
    }
}