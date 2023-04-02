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

    getContainers() {
        return []
    }

    get replicas() {
        return {
            web: this.psScale.web || 0,
            worker: this.psScale.worker || 0,
        };
    }

    async toJson() {
        return {
            name: this.name,
            proxyPorts: this.proxyPorts,
            replicas: this.replicas,
        }
    }
}