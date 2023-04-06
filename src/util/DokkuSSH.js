import { exec } from 'child_process';

const kHost = Symbol('host');
const kPort = Symbol('port');
const kUsername = Symbol('username');
const kPrivateKey = Symbol('privateKey');

const kExecCommand = Symbol('execCommand');
const kExecAppCommands = Symbol('execAppCommands');
const kNormalizeAppNames = Symbol('normalizeAppNames');
const kExecMultipleCommands = Symbol('execMultipleCommands');
const kCreateCommand = Symbol('kCreateCommand');

export default class DokkuSSH {

    [kHost];
    [kPort];
    [kUsername];
    [kPrivateKey];

    async ping() {
        await this[kExecCommand]('version');
    }

    async domainsReport(appOrApps) {
        const domainsResult = await this[kExecAppCommands](appOrApps, 'domains:report %app%');
        const output = {};
        for(const app in domainsResult) {

            const domainsConfigs = domainsResult[app].split('\n');
            domainsConfigs.shift(); // remove header
            domainsConfigs.pop(); // remove last empty line

            const configs = {
                app: {
                    enabled: false,
                    vhosts: [],
                },
                global: {
                    enabled: false,
                    vhosts: [],
                },
            };
            for(const domainConfig of domainsConfigs) {
                const [type, config, configValue] = domainConfig.trim().replace(/Domains (app|global) (enabled|vhosts):\s+/g, '$1,$2,').split(',');
                if(config === 'vhosts') {
                    configs[type][config] = configValue.split(' ');
                } else {
                    configs[type][config] = configValue === 'true';
                }
            }
            const appOutput = {
                app: [],
                global: [],
            };
            if(configs.app.enabled) {
                appOutput.app.push(...configs.app.vhosts);
            }
            if(configs.global.enabled) {
                for(const vhost of configs.global.vhosts) {
                    appOutput.global.push(`${app}.${vhost}`);
                }
            }
            output[app] = appOutput;
        }
        return output;
    }

    async appsList() {
        const appsResult = await this[kExecCommand]('apps:list');
        const apps = appsResult.split('\n');
        apps.shift(); // remove header
        apps.pop(); // remove last empty line
        apps.pop(); // remove last empty line
        return apps;
    }

    async proxyPorts(appOrApps) {
        const output = {};
        const proxyPortsResult = await this[kExecAppCommands](appOrApps, 'proxy:ports %app%');
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
        const psScaleResult = await this[kExecAppCommands](appOrApps, 'ps:scale %app%');
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

    async [kExecAppCommands](appOrApps, command, appNameVar = '%app%') {
        const apps = this[kNormalizeAppNames](appOrApps);
        const responses = await this[kExecMultipleCommands](this[kCreateCommand](apps, command, appNameVar));

        const output = {};
        for (let i = 0; i < apps.length; i++) {
            output[apps[i]] = responses[i];
        }

        return output;
    }

    [kNormalizeAppNames](appOrApps) {
        if(typeof appOrApps === 'string') {
            return this[kNormalizeAppNames]([appOrApps]);
        }
        if(appOrApps && appOrApps?.name) {
            return this[kNormalizeAppNames](appOrApps.name);
        }
        return appOrApps.map(app => app.trim()).filter(app => !!app);
    }

    [kCreateCommand](apps, command, appNameVar = '%app%') {
        return apps.map(app => app.trim()).filter(app => !!app).map(app => command.replace(appNameVar, app));
    }

    async [kExecMultipleCommands](commands) {
        const newCommands = [];
        for (const command of commands) {
            newCommands.push(command);
            newCommands.push('version');
        }
        let response = await this[kExecCommand](newCommands.join('\n'));
        response = response.split(/^dokku version \d+\.\d+\.\d+\n/gm);
        response.pop();// remove the last empty line
        return response;
    }

    [kExecCommand](command) {
        return new Promise((resolve, reject) => {
            exec(`
TMP_FILE=$(mktemp)
echo "${this[kPrivateKey].replace(/\r?\n/g, '\\\\n')}" >> $TMP_FILE
chmod 600 $TMP_FILE
ssh -o StrictHostKeyChecking=no ${this[kUsername]}@${this[kHost]} -p ${this[kPort]} -i $TMP_FILE 'shell' <<EOF
${command}
EOF
            `.trim(), (error, stdout, stderr) => {
                if (error) {
                    reject(error.code, stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    static create(serverConnectionInfo) {
        const dokkuSSH = new DokkuSSH();

        dokkuSSH[kHost] = serverConnectionInfo.host;
        dokkuSSH[kPort] = Number(serverConnectionInfo.port);
        dokkuSSH[kUsername] = serverConnectionInfo.username;
        dokkuSSH[kPrivateKey] = serverConnectionInfo.privateKey;

        return dokkuSSH;
    }
}