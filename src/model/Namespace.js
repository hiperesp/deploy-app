import App from './App.js'
import Model from './Model.js';

const kRefreshApps = Symbol('refreshApps');
const kDokku = Symbol('dokku');
const kPing = Symbol('ping');
const kGetPlugins = Symbol('getPlugins');

export default class Namespace extends Model {

    [kDokku]

    #name;
    #globalDomains;
    #plugins;

    #online = false;
    #lastRefreshTime = 0;

    #apps = [];

    constructor(options) {
        super()
        this.#name = options.name;
        this[kDokku] = options.dokkuSSH;
    }

    get name() {
        return this.#name;
    }
    get globalDomains() {
        return this.#globalDomains;
    }
    get online() {
        return this.#online;
    }
    get lastRefreshTime() {
        return this.#lastRefreshTime;
    }
    get apps() {
        return this.#apps;
    }
    get plugins() {
        return this.#plugins || [];
    }

    get builders() {
        const buildersNames = {
            '': 'Auto-detect',
            'herokuish': 'Herokuish',
            'dockerfile': 'Docker',
            'lambda': 'AWS Lambda',
            'pack': 'Cloud Native Buildpacks',
            'null': 'No builder',
        };
        const validBuilders = {
            '': buildersNames[''],
        };
        for(const pluginName in this.plugins) {
            if(!pluginName.startsWith('builder-')) continue;
            const builderName = pluginName.replace(/^builder-/, '');
            validBuilders[builderName] = buildersNames[builderName] || builderName;
        }

        return validBuilders;
    }

    async refresh(appOrApps = null) {
        try {
            await this[kPing]();
            await this[kGetPlugins]();
            await this[kRefreshApps](appOrApps);
        } catch (e) {
            console.error("Error refreshing namespace", e);
        }
        this.#lastRefreshTime = Date.now();
    }

    async [kPing]() {
        try {
            await this[kDokku].ping();
            this.#online = true;
        } catch (e) {
            this.#online = false;
            throw e;
        }
    }

    async [kGetPlugins]() {
        this.#plugins = await this[kDokku].getPluginList();
    }

    hasPlugin(pluginName) {
        return !!this.#plugins[pluginName];
    }

    mustHavePlugin(pluginName) {
        if(!this.hasPlugin(pluginName)) throw new Error(`Plugin ${pluginName} is required for this operation`);
    }

    async [kRefreshApps](appOrApps = null) {
        const appsList = await this[kDokku].appsList();
        const appsToFullRefresh = this[kDokku].normalizeAppNames(appOrApps || appsList);

        const proxyPorts    = await this.proxyPorts(appsList);
        const domainsReport = await this.domainsReport(appsList);
        const psScale       = await this.psScale(appsList);
        const letsEncrypt   = await this.letsEncryptList(appsList);
        const config        = await this.configShow(appsList);
        const builder       = await this.getBuilder(appsList);

        //remove apps that are not in appsList
        for(const app of this.apps) {
            if(!appsList.includes(app.name)) {
                this.apps.splice(this.apps.indexOf(app), 1);
                continue;
            }
        }
        //add apps that are in appsList but not in this.apps
        for (const appName of appsList) {
            if(!this.apps.find(app => app.name === appName)) {
                const app = new App(this, {
                    name: appName,
                });
                this.apps.push(app);
            }
        }

        //refresh apps
        for(const app of this.apps) {
            await app.refresh({
                domains: domainsReport[app.name],
                proxyPorts: proxyPorts[app.name],
                psScale: psScale[app.name],
                ssl: letsEncrypt[app.name],
                config: config[app.name],
                builder: builder[app.name],
            }, appsToFullRefresh.includes(app.name));
        }
    }

    async setAppBuilder(appName, builderName, onStdout = null, onStderr) {
        if(typeof this.builders[builderName] != "string") throw new Error(`Invalid builder "${builder}". Must be one of: ${Object.keys(validBuilders).join(', ')}`);

        const response = await this[kDokku].actionBuilderSet(appName, builderName, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    async getBuilder(appsList) {
        const response = await this[kDokku].builderReport(appsList);
        return response;
    }

    async proxyPorts(appsList) {
        if(!this.hasPlugin('proxy')) return null;
        return await this[kDokku].proxyPorts(appsList);
    }
    async domainsReport(appsList) {
        if(!this.hasPlugin('domains')) return null;
        return await this[kDokku].domainsReport(appsList);
    }
    async psScale(appsList) {
        if(!this.hasPlugin('ps')) return null;
        return await this[kDokku].psScale(appsList);
    }
    async letsEncryptList(appsList) {
        if(!this.hasPlugin('letsencrypt')) return null;
        return await this[kDokku].letsEncryptList(appsList);
    }
    async configShow(appsList) {
        if(!this.hasPlugin('config')) return null;
        return await this[kDokku].configShow(appsList);
    }

    async createApp(newAppName, onStdout = null, onStderr) {
        this.mustHavePlugin('apps');

        const response = await this[kDokku].actionAppsCreate(newAppName, onStdout, onStderr);
        this.refresh(newAppName);
        return response;
    }
    async destroyApp(appName, onStdout = null, onStderr) {
        this.mustHavePlugin('apps');

        const response = await this[kDokku].actionAppsDestroy(appName, onStdout, onStderr);
        this.refresh(null);
        return response;
    }

    async scaleApp(appOrApps, scaling, onStdout = null, onStderr) {
        this.mustHavePlugin('ps');

        const response = await this[kDokku].actionPsScale(appOrApps, scaling, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }

    async generateAppSSL(appOrApps, onStdout = null, onStderr) {
        this.mustHavePlugin('letsencrypt');

        const response = await this[kDokku].actionLetsEncryptCreate(appOrApps, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }
    async removeAppSSL(appOrApps, onStdout = null, onStderr) {
        this.mustHavePlugin('letsencrypt');

        const response = await this[kDokku].actionLetsEncryptDelete(appOrApps, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }

    async configSetApp(appOrApps, options, onStdout = null, onStderr) {
        this.mustHavePlugin('config');

        const response = await this[kDokku].actionConfigSet(appOrApps, options, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }
    async configUnsetApp(appOrApps, options, onStdout = null, onStderr) {
        this.mustHavePlugin('config');

        const response = await this[kDokku].actionConfigUnset(appOrApps, options, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }

    async deployApp(appName, remote, ref, onStdout = null, onStderr) {
        this.mustHavePlugin('git');

        const response = await this[kDokku].actionGitSync(appName, remote, ref, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    async restartApp(appName, onStdout = null, onStderr) {
        this.mustHavePlugin('ps');

        const response = await this[kDokku].actionPsRestart(appName, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    async setAppPorts(appName, ports, onStdout = null, onStderr) {
        this.mustHavePlugin('proxy');

        const response = await this[kDokku].actionProxyPortsSet(appName, ports, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }
    async setExposeAllAppPorts(appName, exposeAllAppPorts, onStdout = null, onStderr) {
        this.mustHavePlugin('docker-options');

        const response = await this[kDokku].action_setExposeAllAppPorts(appName, exposeAllAppPorts, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }
    async setAppDomains(appName, domains, onStdout = null, onStderr) {
        this.mustHavePlugin('domains');

        const response = await this[kDokku].actionDomainsSet(appName, domains, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    toJson() {
        return {
            name: this.name,
            globalDomain: this.globalDomain,
            online: this.online,
            apps: this.apps.map(app => app.toJson()),
            plugins: this.plugins,
            builders: this.builders,

            _lastRefreshTime: this.lastRefreshTime,
        }
    }

    async getAppLogs(appName, onStdout, onStderr) {
        this.mustHavePlugin('logs');

        return await this[kDokku].logs(appName, onStdout, onStderr);
    }
    async getNginxAccessLogs(appName, onStdout, onStderr) {
        this.mustHavePlugin('nginx-vhosts');

        return await this[kDokku].nginxAccessLogs(appName, onStdout, onStderr);
    }
    async getNginxErrorLogs(appName, onStdout, onStderr) {
        this.mustHavePlugin('nginx-vhosts');

        return await this[kDokku].nginxErrorLogs(appName, onStdout, onStderr);
    }


    async psInspect(appName) {
        this.mustHavePlugin('ps');

        return await this[kDokku].psInspect(appName);
    }
}