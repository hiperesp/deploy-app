import { NodeSSH } from "node-ssh";

export default class DokkuSSH {

    #ssh;

    static fromNamespace(namespace) {
        if(namespace.dokkuSSH) return namespace.dokkuSSH;
        const dokkuSSH = new DokkuSSH();

        try {
            dokkuSSH.#ssh = new NodeSSH();
            dokkuSSH.#ssh.connect({
                host: namespace.serverHost,
                port: Number(namespace.serverPort),
                username: namespace.serverUsername,
                privateKey: namespace.serverPrivateKey,
                debug: console.log
            })
        } catch (error) {
            console.error(error);
        }
        return dokkuSSH;
    }

    async appsList() {
        const appsResult = await this.#ssh.execCommand('dokku apps:list');
        if (appsResult.code === 1) {
            throw new Error(appsResult.stderr);
        }
        
        const apps = appsResult.stdout.split('\n');
        // Remove the first line "=====> My Apps"
        apps.shift();
        return apps;
    }

    async proxyPorts(appName) {
        const proxyPortsResult = await this.#ssh.execCommand(`dokku proxy:ports ${appName}`);
        if (proxyPortsResult.code === 1) {
            throw new Error(proxyPortsResult.stderr);
        }
        const proxyPorts = proxyPortsResult.stdout.split('\n');
        // Remove the first line "-----> Port mappings for og-preview"
        proxyPorts.shift();
        // Remove the second line "    -----> scheme  host port  container port"
        proxyPorts.shift();

        const output = [];
        for (const proxyPort of proxyPorts) {
            const proxyPortParts = proxyPort.trim().split(/\s+/);
            const scheme = proxyPortParts[0];
            const hostPort = proxyPortParts[1];
            const containerPort = proxyPortParts[2];
            output.push(`${scheme}:${hostPort}:${containerPort}`);
        }
        return output;
    }
}