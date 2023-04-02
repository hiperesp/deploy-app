import App from './App.js'
import Model from './Model.js';

const kRefreshApps = Symbol('refreshApps');
const kDokkuKey = Symbol('dokkuKey');
const kPing = Symbol('ping');

export default class Namespace extends Model {

    [kDokkuKey];

    name;

    globalDomain;

    #online = false;

    #apps = [];

    constructor(dokkuKey) {
        super()
        this[kDokkuKey] = dokkuKey;
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

    get #dokku() {
        return this[this[kDokkuKey]];
    }

    async [kPing]() {
        try {
            await this.#dokku.ping();
            this.#online = true;
        } catch (e) {
            this.#online = false;
            throw e;
        }
    }

    async [kRefreshApps]() {
        const appsList = await this.#dokku.appsList();
        const proxyPorts = await this.#dokku.proxyPorts(appsList);
        const psScale = await this.#dokku.psScale(appsList);

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
                const app = new App(this);
                app.name = appName;
                this.apps.push(app);
            }
        }

        //refresh apps
        for(const app of this.apps) {
            await app.refresh({
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