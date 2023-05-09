import { exec } from 'child_process';

const kHost = Symbol('host');
const kPort = Symbol('port');
const kUsername = Symbol('username');
const kPrivateKey = Symbol('privateKey');

const kExecCommandRealTimeOutput = Symbol('execCommandRealTimeOutput');
const kExecCommand = Symbol('execCommand');
const kExecAppCommands = Symbol('execAppCommands');
const kNormalizeAppNames = Symbol('normalizeAppNames');
const kExecMultipleCommands = Symbol('execMultipleCommands');
const kCreateAppCommand = Symbol('createAppCommand');

export default class DokkuSSH {

    [kHost];
    [kPort];
    [kUsername];
    [kPrivateKey];

    async actionGitSync(appName, remote, ref, onStdout = null, onStderr = null) {
        this.mustBeValidResourceName(appName);
        this.mustBeValidRemote(remote);
        this.mustBeValidRef(ref);
        await this[kExecCommand](`git:sync --build ${appName} ${remote} ${ref}`, onStdout, onStderr);
    }

    async actionAppsCreate(newAppName, onStdout = null, onStderr = null) {
        this.mustBeValidResourceName(newAppName);
        await this[kExecCommand](`apps:create ${newAppName}`, onStdout, onStderr);
    }
    async actionAppsDestroy(appName, onStdout = null, onStderr = null) {
        this.mustBeValidResourceName(appName);
        await this[kExecCommand](`apps:destroy ${appName}\n${appName}`, onStdout, onStderr);
    }

    async letsEncryptList(appOrApps) {
        const output = {};

        const appsNames = this[kNormalizeAppNames](appOrApps);
        const letsEncryptListResult = await this[kExecCommand]('letsencrypt:list');
        const letsEncryptListLines = letsEncryptListResult.split(/\r?\n/);
        letsEncryptListLines.shift(); // remove header

        for(const letsEncryptListLine of letsEncryptListLines) {
            const [ appName, expirationDate, _remainingTimeToExpire, remainingTimeToRenew ] = letsEncryptListLine.split(/\s\s+/);

            if(!appsNames.includes(appName)) continue;

            const expirationTime = (new Date(expirationDate)).getTime();

            const renewDays    = (remainingTimeToRenew.match(/(\d\d)d(?:, )?/) || [0, 0])[1];
            const renewHours   = (remainingTimeToRenew.match(/(\d\d)h(?:, )?/) || [0, 0])[1];
            const renewMinutes = (remainingTimeToRenew.match(/(\d\d)m(?:, )?/) || [0, 0])[1];
            const renewSeconds = (remainingTimeToRenew.match(/(\d\d)s(?:, )?/) || [0, 0])[1];
            
            const renewDate = new Date();
            renewDate.setDate(renewDate.getDate() + parseInt(renewDays));
            renewDate.setHours(renewDate.getHours() + parseInt(renewHours));
            renewDate.setMinutes(renewDate.getMinutes() + parseInt(renewMinutes));
            renewDate.setSeconds(renewDate.getSeconds() + parseInt(renewSeconds));
            const renewTime = renewDate.getTime();

            output[appName] = {
                expirationTime,
                renewTime,
            };
        }
        return output;
    }

    async actionPsScale(appOrApps, scaling, onStdout = null, onStderr = null) {
        const scalingParams = [];
        for(const type in scaling) {
            this.mustBeValidResourceName(type);
            scalingParams.push(`${type}=${parseInt(scaling[type])}`);
        }
        await this[kExecAppCommands](appOrApps, `ps:scale %app% ${scalingParams.join(' ')}`, onStdout, onStderr);
    }

    async actionPsRestart(appOrApps, onStdout = null, onStderr = null) {
        const restartParams = [
            "--parallel -1",
        ];
        await this[kExecAppCommands](appOrApps, `ps:restart %app% ${restartParams.join(' ')}`, onStdout, onStderr);
    }

    async actionLetsEncryptCreate(appOrApps, onStdout = null, onStderr = null) {
        await this[kExecAppCommands](appOrApps, `letsencrypt:enable %app%`, onStdout, onStderr);
    }

    async actionLetsEncryptDelete(appOrApps, onStdout = null, onStderr = null) {
        await this[kExecAppCommands](appOrApps, `letsencrypt:disable %app%`, onStdout, onStderr);
    }

    async actionConfigSet(appOrApps, options, onStdout = null, onStderr = null) {
        const params = [
            '--encoded'
        ];
        if(options.noRestart || false) {
            params.push('--no-restart');
        }
        const configs = [];
        for(const key in options.config) {
            this.mustBeValidEnvironmentVariableName(key);
            const encodedValue = Buffer.from(options.config[key]).toString('base64');
            configs.push(`${key}=${encodedValue}`);
        }
        await this[kExecAppCommands](appOrApps, `config:set ${params.join(' ')} %app% ${configs.join(' ')}`, onStdout, onStderr);
    }

    async actionConfigUnset(appOrApps, options, onStdout = null, onStderr = null) {
        const params = [];
        if(options.noRestart || false) {
            params.push('--no-restart');
        }
        const configs = [];
        for(const key of options.config) {
            this.mustBeValidEnvironmentVariableName(key);
            configs.push(`${key}`);
        }
        await this[kExecAppCommands](appOrApps, `config:unset ${params.join(' ')} %app% ${configs.join(' ')}`, onStdout, onStderr);
    }

    async configShow(appOrApps) {
        const output = {};
        const configShowResult = await this[kExecAppCommands](appOrApps, 'config:export --format=json %app%');
        for(const app in configShowResult) {
            output[app] = JSON.parse(configShowResult[app]);
        }
        return output;
    }

    async nginxAccessLogs(appName, onStdout, onStderr) {
        this.mustBeValidResourceName(appName);

        const instance = await this[kExecCommandRealTimeOutput](`nginx:access-logs ${appName} -t`, null, null, onStdout, onStderr);

        return {
            kill: (code = 0) => {
                instance.kill(code);
            }
        }
    }

    async actionProxyPortsSet(appName, portsDefinition, onStdout, onStderr) {
        const ports = [];
        for(const portDefinition of portsDefinition) {
            if(!portDefinition) continue;
            this.mustBeValidPortDefinition(portDefinition, true);
            ports.push(portDefinition);
        }
        await this[kExecAppCommands](appName, `proxy:ports-set %app% ${ports.join(' ')}`, onStdout, onStderr);
    }

    async action_setExposeAllAppPorts(appName, exposeAllAppPorts, onStdout, onStderr) {
        const action = exposeAllAppPorts ? 'add' : 'remove';
        await this[kExecAppCommands](appName, `docker-options:${action} %app% deploy "-P"`, onStdout, onStderr);
    }

    async nginxErrorLogs(appName, onStdout, onStderr) {
        this.mustBeValidResourceName(appName);

        const instance = await this[kExecCommandRealTimeOutput](`nginx:error-logs ${appName} -t`, null, null, onStdout, onStderr);

        return {
            kill: (code = 0) => {
                instance.kill(code);
            }
        }
    }

    async logs(appName, onStdout, onStderr) {
        this.mustBeValidResourceName(appName);

        const instance = await this[kExecCommandRealTimeOutput](`logs ${appName} -t`, null, null, onStdout, onStderr);

        return {
            kill: (code = 0) => {
                instance.kill(code);
            }
        }
    }

    async ping() {
        await this[kExecCommand]('version');
    }

    async domainsReport(appOrApps) {
        const domainsResult = await this[kExecAppCommands](appOrApps, 'domains:report %app%');
        const output = {};
        for(const app in domainsResult) {

            const domainsConfigs = domainsResult[app].split(/\r?\n/);
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
        const apps = appsResult.split(/\r?\n/);
        apps.shift(); // remove header
        apps.pop(); // remove last empty line
        apps.pop(); // remove last empty line
        return apps;
    }

    async proxyPorts(appOrApps) {
        const output = {};
        const proxyPortsResult = await this[kExecAppCommands](appOrApps, 'proxy:ports %app%');
        for(const app in proxyPortsResult) {
            const proxyPorts = proxyPortsResult[app].split(/\r?\n/);
            proxyPorts.shift(); // remove header
            proxyPorts.shift(); // remove second header
            proxyPorts.pop(); // remove last empty line

            const proxyPortsApp = [];
            for(const proxyPort of proxyPorts) {
                const [protocol, acessiblePort, containerPort] = proxyPort.trim().replace(/\s+/g, ':').split(':');
                proxyPortsApp.push(`${protocol}:${acessiblePort}:${containerPort}`);
            }
            output[app] = proxyPortsApp;
        }
        return output;
    }

    async psScale(appOrApps) {
        const output = {};
        const psScaleResult = await this[kExecAppCommands](appOrApps, 'ps:scale %app%');
        for(const app in psScaleResult) {
            const psScaleLines = psScaleResult[app].split(/\r?\n/);
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

    async psInspect(appOrApps) {
        const output = {};
        const psInspectResult = await this[kExecAppCommands](appOrApps, 'ps:inspect %app%');
        for(const app in psInspectResult) {
            try {
                output[app] = JSON.parse(psInspectResult[app]);
            } catch(e) {
                output[app] = [];
            }
        }
        return output;
    }

    async [kExecAppCommands](appOrApps, command, onStdout = null, onStderr = null, appNameVar = '%app%') {
        const apps = this[kNormalizeAppNames](appOrApps);
        const responses = await this[kExecMultipleCommands](this[kCreateAppCommand](apps, command, appNameVar), onStdout ? function(log, index) {
            onStdout(log, apps[index]);
        } : null, onStderr ? function(log, index) {
            onStderr(log, apps[index]);
        } : null);

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
        const apps = appOrApps.map(app => app.trim()).filter(app => !!app);
        this.mustBeValidResourceNameArr(apps);
        return apps;
    }

    [kCreateAppCommand](apps, command, appNameVar = '%app%') {
        return apps.map(app => app.trim()).filter(app => !!app).map(app => {
            let appCommand = command;
            while(appCommand.includes(appNameVar)) appCommand = appCommand.replace(appNameVar, app)
            return appCommand;
        });
    }

    async [kExecMultipleCommands](commands, onStdout = null, onStderr = null) {

        const separator = {
            command: 'version',
            regex: /^dokku version \d+\.\d+\.\d+\r?\n/gm,
        }

        const newCommands = [];
        for (const command of commands) {
            newCommands.push(command);
            newCommands.push(separator.command);
        }
        let logIndex = 0;
        let response = await this[kExecCommand](newCommands.join('\n'), onStdout ? function(data) {
            data = data.split(separator.regex)
            for(const key in data) {
                onStdout(data[key], logIndex+parseInt(key));
            }
            logIndex += data.length - 1;
        } : null, onStderr ? function(data) {
            onStderr(data, logIndex);
        } : null);
        
        response = response.split(separator.regex);
        return response;
    }

    [kExecCommand](command, onStdout = null, onStderr = null) {
        return new Promise((resolve, reject) => {
            this[kExecCommandRealTimeOutput](command, resolve, reject, onStdout, onStderr);
        });
    }
    
    [kExecCommandRealTimeOutput](command, fullStdout = null, fullStderr = null, onStdout = null, onStderr = null) {
        return new Promise((resolve, reject) => {
            const child = exec(`
TMP_BASE64=$(mktemp)
TMP_PEM=$(mktemp)
echo "${Buffer.from(this[kPrivateKey]+"\n").toString('base64')}" >> $TMP_BASE64
base64 -d $TMP_BASE64 >> $TMP_PEM
chmod 600 $TMP_PEM
ssh -t -o StrictHostKeyChecking=no ${this[kUsername]}@${this[kHost]} -p ${this[kPort]} -i $TMP_PEM 'shell' <<'SSH_EOF'
${command}
SSH_EOF
            `.trim(), (error, stdout, stderr) => {
                if (error) {
                    if(fullStderr) {
                        fullStderr(stderr, error);
                    }
                } else {
                    if(fullStdout) {
                        fullStdout(stdout);
                    }
                }
            });
            if(onStdout) {
                child.stdout.on('data', function(stdout) {
                    onStdout(stdout);
                });
            }
            if(onStderr) {
                child.stderr.on('data', function(stderr) {
                    onStderr(stderr);
                });
            }

            resolve(child);
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

    mustBeValidResourceNameArr(resourceNameArr) {
        for(const resourceName of resourceNameArr) {
            this.mustBeValidResourceName(resourceName);
        }
    }

    mustBeValidResourceName(resourceName) {
        if(!this.isValidResourceName(resourceName)) {
            throw new Error(`Invalid resource name: ${resourceName}`);
        }
    }

    isValidResourceName(resourceName) {
        //must contain only letters, numbers, and hyphens.
        //must not start with a hyphen.
        //must not end with a hyphen.
        //must not contain consecutive hyphens.
        if(!resourceName.match(/^([a-z0-9]+(?:-[a-z0-9]+)*)$/)) return false;

        //must be between 2 and 63 characters long.
        if(resourceName.length > 63 || resourceName.length < 2) return false;

        return true;
    }

    mustBeValidEnvironmentVariableNameArr(environmentVariableNameArr) {
        for(const environmentVariableName of environmentVariableNameArr) {
            this.mustBeValidEnvironmentVariableName(environmentVariableName);
        }
    }

    mustBeValidEnvironmentVariableName(environmentVariableName) {
        if(!this.isValidEnvironmentVariableName(environmentVariableName)) {
            throw new Error(`Invalid environment variable name: ${environmentVariableName}`);
        }
    }

    isValidEnvironmentVariableName(environmentVariableName) {
        //must contain only letters, numbers, and underscores.
        //must not start with a number.
        if(!environmentVariableName.match(/^([a-zA-Z_][a-zA-Z0-9_]*)$/)) return false;

        return true;
    }

    mustBeValidRef(ref) {
        if(!this.isValidRef(ref)) {
            throw new Error(`Invalid ref: ${ref}`);
        }
    }

    isValidRef(ref) {
        if(ref.match(/^refs\/(heads|tags)\/[a-zA-Z0-9_.-]+$/)) return true;
        if(ref.match(/^[0-9a-fA-F]{40}$/)) return true;
        if(ref.match(/^[a-zA-Z0-9_.-]+$/)) return true;
        return false;
    }

    mustBeValidRemote(remote) {
        if(!this.isValidRemote(remote)) {
            throw new Error(`Invalid remote: ${remote}`);
        }
    }

    isValidRemote(remote) {
        if(remote.match(/([a-z0-9.\-_]+@[a-z0-9.\-_]+):([a-zA-Z0-9\-._\/]+)/)) return true;
        try {
            new URL(remote);
            return true;
        } catch(e) {}
        return false;
    }

    mustBeValidPortDefinition(portDefinition, needProtocol = true) {
        if(!this.isValidPortDefinition(portDefinition, needProtocol)) {
            throw new Error(`Invalid port definition: ${portDefinition}`);
        }
    }

    isValidPortDefinition(portDefinition, needProtocol = true) {
        if(needProtocol) {
            if(portDefinition.match(/^[a-z]+:[0-9]+:[0-9]+$/)) return true;
        } else {
            if(portDefinition.match(/^[0-9]+:[0-9]+$/)) return true;
        }
        return false;
    }
}