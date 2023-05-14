import Model from "./Model.js";

export default class App extends Model {

    #namespace;

    #name;

    #proxyPorts;
    #domains;
    #psScale;
    #ssl;
    #config;
    #psInspect;

    #lastRefreshTime = 0;

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
    get ssl() {
        return this.#ssl;
    }
    get config() {
        const typesPrefixes = {
            deployApp: ["DEPLOY_APP_"],
            dokku: ["DOKKU_", "GIT_REV"],
            userDefined: [""],
        };
        const output = {
            all: this.#config
        };

        loopKey: for(const key in output.all) {
            for(const type in typesPrefixes) {
                for(const prefix of typesPrefixes[type]) {
                    if(key.startsWith(prefix)) {
                        if(!output[type]) {
                            output[type] = {};
                        }
                        output[type][key] = output.all[key];
                        continue loopKey;
                    }
                }
            }
        }
        return output;
    }
    get psInspect() {
        return this.#psInspect || [];
    }

    get replicas() {
        return this.#psScale;
    }

    get instances() {
        const instances = [];

        for(const instance of this.psInspect) {
            const ports = [];
            for(const port in instance?.NetworkSettings?.Ports??{}) {
                if(!instance.NetworkSettings.Ports[port]) continue;

                const portProtocol = port.split("/");

                ports.push({
                    containerPort: portProtocol[0],
                    protocol: portProtocol[1],
                    type: "direct",
                    hostPort: instance.NetworkSettings.Ports[port][0].HostPort,
                    hostIp: instance.NetworkSettings.Ports[port][0].HostIp,
                    hostName: null
                });
            }

            for(const proxyPort of this.proxyPorts) {
                const protocolProxyPortContainer = proxyPort.split(":");
                const protocol = protocolProxyPortContainer[0];
                const proxyPortN = protocolProxyPortContainer[1];
                const containerPort = protocolProxyPortContainer[2];

                ports.push({
                    containerPort: containerPort,
                    protocol: protocol,
                    type: "proxy",
                    hostPort: proxyPortN,
                    hostIp: null,
                    hostName: this.domains.app[0] || this.domains.global[0]
                });
            }

            instances.push({
                id: instance.Id,
                dyno: instance.Config.Labels["com.dokku.dyno"],
                type: instance.Config.Labels["com.dokku.builder-type"],
                platform: instance.Platform,
                hostname: instance.Config.Hostname,
                name: instance.Name,
                networkSettings: {
                    gateway: instance.NetworkSettings.Gateway,
                    ipAddress: instance.NetworkSettings.IPAddress,
                    ipPrefixLen: instance.NetworkSettings.IPPrefixLen,
                    macAddress: instance.NetworkSettings.MacAddress,
                    ports,
                },
                status: instance.State.Status,//created, restarting, running, removing, paused, exited, dead
            });
        }
        return instances;
    }

    get status() {
        const status = {
            created: 0,
            restarting: 0,
            running: 0,
            removing: 0,
            paused: 0,
            exited: 0,
            dead: 0,
        };
        for(const instance of this.instances) {
            status[instance.status]++;
        }
        return status;
    }

    get lastRefreshTime() {
        return this.#lastRefreshTime;
    }

    get isExposedAllPorts() {
        for(const instance of this.instances) {
            for(const port of instance.networkSettings.ports) {
                if(port.type === "direct") {
                    return true;
                }
            }
        }
        return false;
    }

    async refresh({ proxyPorts, domains, psScale, ssl, config }, fullRefresh) {
        this.#domains    = domains;
        this.#proxyPorts = proxyPorts;
        this.#psScale    = psScale;
        this.#ssl        = ssl;
        this.#config     = config;

        if(!fullRefresh) return;

        this.#psInspect  = await this.namespace.psInspect(this.name);
        this.#lastRefreshTime = Date.now();

    }

    async scale(options, onStdout = null, onStderr) {
        await this.#namespace.scaleApp(this.name, options, onStdout, onStderr);
    }

    async generateSSL(onStdout = null, onStderr) {
        await this.#namespace.generateAppSSL(this.name, onStdout, onStderr);
    }
    async removeSSL(onStdout = null, onStderr) {
        await this.#namespace.removeAppSSL(this.name, onStdout, onStderr);
    }

    async configSet(options, onStdout = null, onStderr) {
        await this.#namespace.configSetApp(this.name, options, onStdout, onStderr);
    }
    async configUnset(options, onStdout = null, onStderr) {
        await this.#namespace.configUnsetApp(this.name, options, onStdout, onStderr);
    }

    async deploy(ref, onStdout = null, onStderr) {
        try {
            const remote = JSON.parse(this.config.deployApp.DEPLOY_APP_GIT).REPO;
            await this.#namespace.deployApp(this.name, remote, ref, onStdout, onStderr);
        } catch (e) {
            throw new Error(`Invalid deploy configuration: ${e.message}`);
        }
    }
    async restart(onStdout = null, onStderr) {
        await this.#namespace.restartApp(this.name, onStdout, onStderr);
    }

    async setPorts(ports, onStdout = null, onStderr) {
        await this.#namespace.setAppPorts(this.name, ports, onStdout, onStderr);
    }
    async setExposeAllPorts(exposeAllPorts, onStdout = null, onStderr) {
        await this.#namespace.setExposeAllAppPorts(this.name, exposeAllPorts, onStdout, onStderr);
    }
    async setDomains(domains, onStdout = null, onStderr) {
        await this.#namespace.setAppDomains(this.name, domains, onStdout, onStderr);
    }

    toJson() {
        return {
            name: this.name,

            proxyPorts: this.proxyPorts,
            replicas: this.replicas,
            domains: this.domains,
            ssl: this.ssl,
            config: this.config,
            instances: this.instances,
            exposeAllPorts: this.isExposedAllPorts,

            status: this.status,

            _lastRefreshTime: this.lastRefreshTime,
        }
    }


    async realTimeAppLogs(onStdout, onStderr) {
        return this.namespace.getAppLogs(this.name, onStdout, onStderr);
    }
    async realTimeAccessLogs(onStdout, onStderr) {
        return this.namespace.getNginxAccessLogs(this.name, onStdout, onStderr);
    }
    async realTimeErrorLogs(onStdout, onStderr) {
        return this.namespace.getNginxErrorLogs(this.name, onStdout, onStderr);
    }

}