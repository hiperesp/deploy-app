export default class App {

    namespace;
    constructor(namespace) {
        this.namespace = namespace
    }

    name;

    async getProxyPorts() {
        const proxyPorts = await this.namespace.dokkuSSH.proxyPorts(this.name);
        return proxyPorts;
    }

    scaleWeb;
    scaleWorker;

    get containers() {
        return []
    }

}