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
    get apps() {
        return this.#apps;
    }

    async refresh() {
        try {
            await this[kPing]();
            await this[kRefreshApps]();
        } catch (e) {
            console.error("Error refreshing namespace", e);
        }
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

    async [kRefreshApps]() {
        const appsList = await this[kDokku].appsList();
        const proxyPorts = await this[kDokku].proxyPorts(appsList);
        const domainsReport = await this[kDokku].domainsReport(appsList);
        const psScale = await this[kDokku].psScale(appsList);

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
            });
        }
    }

    toJson() {
        return {
            name: this.name,
            globalDomain: this.globalDomain,
            online: this.online,
            apps: this.apps.map(app => app.toJson()),
        }
    }
}