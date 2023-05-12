import DokkuSSH from '../util/DokkuSSH.js';
import App from './App.js'
import Model from './Model.js';

const kRefreshApps = Symbol('refreshApps');
const kDokku = Symbol('dokku');
const kPing = Symbol('ping');

export default class Namespace extends Model {

    [kDokku]

    #name;
    #globalDomains;

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

    async refresh(appOrApps = null) {
        try {
            await this[kPing]();
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

    async [kRefreshApps](appOrApps = null) {
        let appsList = [];
        if(appOrApps) {
            appsList = this.dokkuSSH.normalizeAppNames(appOrApps);
        } else {
            appsList = await this[kDokku].appsList();
        }
        const proxyPorts = await this[kDokku].proxyPorts(appsList);
        const domainsReport = await this[kDokku].domainsReport(appsList);
        const psScale = await this[kDokku].psScale(appsList);
        const letsEncrypt = await this[kDokku].letsEncryptList(appsList);
        const config = await this[kDokku].configShow(appsList);
        const psInspect = await this[kDokku].psInspect(appsList);

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
                psInspect: psInspect[app.name],
            });
        }
    }

    async createApp(newAppName, onStdout = null, onStderr) {
        const response = await this[kDokku].actionAppsCreate(newAppName, onStdout, onStderr);
        this.refresh(newAppName);
        return response;
    }
    async destroyApp(appName, onStdout = null, onStderr) {
        const response = await this[kDokku].actionAppsDestroy(appName, onStdout, onStderr);
        this.refresh(null);
        return response;
    }

    async scaleApp(appOrApps, scaling, onStdout = null, onStderr) {
        const response = await this[kDokku].actionPsScale(appOrApps, scaling, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }

    async generateAppSSL(appOrApps, onStdout = null, onStderr) {
        const response = await this[kDokku].actionLetsEncryptCreate(appOrApps, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }
    async removeAppSSL(appOrApps, onStdout = null, onStderr) {
        const response = await this[kDokku].actionLetsEncryptDelete(appOrApps, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }

    async configSetApp(appOrApps, options, onStdout = null, onStderr) {
        const response = await this[kDokku].actionConfigSet(appOrApps, options, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }
    async configUnsetApp(appOrApps, options, onStdout = null, onStderr) {
        const response = await this[kDokku].actionConfigUnset(appOrApps, options, onStdout, onStderr);
        this.refresh(appOrApps);
        return response;
    }

    async deployApp(appName, remote, ref, onStdout = null, onStderr) {
        const response = await this[kDokku].actionGitSync(appName, remote, ref, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    async restartApp(appName, onStdout = null, onStderr) {
        const response = await this[kDokku].actionPsRestart(appName, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    async setAppPorts(appName, ports, onStdout = null, onStderr) {
        const response = await this[kDokku].actionProxyPortsSet(appName, ports, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }
    async setExposeAllAppPorts(appName, exposeAllAppPorts, onStdout = null, onStderr) {
        const response = await this[kDokku].action_setExposeAllAppPorts(appName, exposeAllAppPorts, onStdout, onStderr);
        this.refresh(appName);
        return response;
    }

    toJson() {
        return {
            name: this.name,
            globalDomain: this.globalDomain,
            online: this.online,
            apps: this.apps.map(app => app.toJson()),

            _lastRefreshTime: this.lastRefreshTime,
        }
    }

    async getAppLogs(appName, onStdout, onStderr) {
        return await this[kDokku].logs(appName, onStdout, onStderr);
    }
    async getNginxAccessLogs(appName, onStdout, onStderr) {
        return await this[kDokku].nginxAccessLogs(appName, onStdout, onStderr);
    }
    async getNginxErrorLogs(appName, onStdout, onStderr) {
        return await this[kDokku].nginxErrorLogs(appName, onStdout, onStderr);
    }
}