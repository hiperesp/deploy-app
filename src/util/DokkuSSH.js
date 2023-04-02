import { exec } from 'child_process';

export default class DokkuSSH {

    #host;
    #port;
    #username;
    #privateKey;

    static create(serverConnectionInfo) {
        const dokkuSSH = new DokkuSSH();

        dokkuSSH.#host = serverConnectionInfo.host;
        dokkuSSH.#port = Number(serverConnectionInfo.port);
        dokkuSSH.#username = serverConnectionInfo.username;
        dokkuSSH.#privateKey = serverConnectionInfo.privateKey;

        return dokkuSSH;
    }

    execCommand(command) {
        return new Promise(resolve => {
            exec(`
            TMP_FILE=$(mktemp)
            echo "${this.#privateKey.replace(/\r?\n/g, '\\\\n')}" >> $TMP_FILE
            chmod 600 $TMP_FILE
            ssh ${this.#username}@${this.#host} -p ${this.#port} -i $TMP_FILE ${command}
            `, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        code: error.code,
                        stdout,
                        stderr,
                    });
                } else {
                    resolve({
                        code: 0,
                        stdout,
                        stderr,
                    });
                }
            });
        });
    }

    async appsList() {
        const appsResult = await this.execCommand('apps:list');
        
        if (appsResult.code !== 0) {
            throw new Error(appsResult.stderr);
        }
        
        const apps = appsResult.stdout.split('\n');
        apps.shift();// Remove the first line "=====> My Apps"
        apps.pop();// Remove the last line ""
        return apps;
    }

    async proxyPorts(appName) {
        const proxyPortsResult = await this.execCommand(`dokku proxy:ports ${appName}`);
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