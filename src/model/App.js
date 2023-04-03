import Model from "./Model.js";

export default class App extends Model {

    namespace;
    name;

    proxyPorts;
    psScale;

    constructor(namespace) {
        super()
        this.namespace = namespace
    }

    get replicas() {
        return {
            web: this.psScale.web,
            worker: this.psScale.worker,
        };
    }

    get online() {
        let replicas = 0;
        for(const key in this.replicas) {
            replicas += this.replicas[key];
        }
        return replicas > 0;
    }

    async refresh({proxyPorts, psScale}) {
        this.proxyPorts = proxyPorts;
        this.psScale = {
            web: psScale.web || 0,
            worker: psScale.worker || 0,
        };
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
        }
    }
}