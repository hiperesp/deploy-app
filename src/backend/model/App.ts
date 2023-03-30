import DokkuSSH from "../DokkuSSH";
import Namespace from "./Namespace";

export default class App {

    namespace: Namespace;
    constructor(namespace: Namespace) {
        this.namespace = namespace
    }

    name: string;

    async getProxyPorts(): Promise<string[]> {
        const proxyPorts = await this.namespace.dokkuSSH.proxyPorts(this.name);
        return proxyPorts;
    }

    scaleWeb: number;
    scaleWorker: number;

    get containers(): string[] {
        return []
    }

}