import { exec } from 'child_process';

export default class DokkuSSH {

    #host;
    #port;
    #username;
    #privateKey;

    async appsList() {
        const appsResult = await this.#execCommand('apps:list');
        const apps = appsResult.split('\n');
        apps.shift(); // remove header
        apps.pop(); // remove last empty line
        apps.pop(); // remove last empty line
        return apps;
    }

    async proxyPorts(appOrApps) {
        const output = {};
        const proxyPortsResult = await this.#execAppCommands(appOrApps, 'proxy:ports %app%');
        for(const app in proxyPortsResult) {
            const proxyPorts = proxyPortsResult[app].split('\n');
            proxyPorts.shift(); // remove header
            proxyPorts.shift(); // remove second header
            proxyPorts.pop(); // remove last empty line

            const proxyPortsApp = [];
            for(const proxyPort of proxyPorts) {
                const [protocol, acessiblePort, exposedPort] = proxyPort.trim().replace(/\s+/g, ':').split(':');
                proxyPortsApp.push(`${protocol}:${acessiblePort}:${exposedPort}`);
            }
            output[app] = proxyPortsApp;
        }
        return output;
    }

    async psScale(appOrApps) {
        const output = {};
        const psScaleResult = await this.#execAppCommands(appOrApps, 'ps:scale %app%');
        for(const app in psScaleResult) {
            const psScaleLines = psScaleResult[app].split('\n');
            psScaleLines.shift(); // remove header
            psScaleLines.shift(); // remove table header
            psScaleLines.shift(); // remove table header separator
            psScaleLines.pop(); // remove last empty line
            const psScaleApp = {};
            for(const psScaleLine of psScaleLines) {
                const [process, quantity] = psScaleLine.trim().split(':').map(value => value.trim());
                psScaleApp[process] = Number(quantity);
            }
            output[app] = psScaleApp;
        }
        return output;
    }

    async #execAppCommands(appOrApps, command, appNameVar = '%app%') {
        const apps = this.#normalizeAppNames(appOrApps);
        const responses = await this.#execMultipleCommands(this.#createCommand(apps, command, appNameVar));

        const output = {};
        for (let i = 0; i < apps.length; i++) {
            output[apps[i]] = responses[i];
        }

        return output;
    }

    #normalizeAppNames(appOrApps) {
        if(typeof appOrApps === 'string') {
            return this.#normalizeAppNames([appOrApps]);
        }
        if(appOrApps && appOrApps?.name) {
            return this.#normalizeAppNames(appOrApps.name);
        }
        return appOrApps.map(app => app.trim()).filter(app => !!app);
    }

    #createCommand(apps, command, appNameVar = '%app%') {
        return apps.map(app => app.trim()).filter(app => !!app).map(app => command.replace(appNameVar, app));
    }

    async #execMultipleCommands(commands) {
        const newCommands = [];
        for (const command of commands) {
            newCommands.push(command);
            newCommands.push('version');
        }
        let response = await this.#execCommand(newCommands.join('\n'));
        response = response.split(/^dokku version \d+\.\d+\.\d+\n/gm);
        response.pop();// remove the last empty line
        return response;
    }

    #execCommand(command) {
        return new Promise(resolve => {
            exec(`
            TMP_FILE=$(mktemp)
            echo "${this.#privateKey.replace(/\r?\n/g, '\\\\n')}" >> $TMP_FILE
            chmod 600 $TMP_FILE
            ssh ${this.#username}@${this.#host} -p ${this.#port} -i $TMP_FILE 'shell' <<EOF
${command}
EOF
            `, (error, stdout, stderr) => {
                if (error) {
                    rejects(error.code, stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    static create(serverConnectionInfo) {
        const dokkuSSH = new DokkuSSH();

        dokkuSSH.#host = serverConnectionInfo.host;
        dokkuSSH.#port = Number(serverConnectionInfo.port);
        dokkuSSH.#username = serverConnectionInfo.username;
        dokkuSSH.#privateKey = serverConnectionInfo.privateKey;

        return dokkuSSH;
    }
}