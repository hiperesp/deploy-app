import App from './App.js'
import Model from './Model.js';

const kRefreshApps = Symbol('refreshApps');
const kDokkuKey = Symbol('dokkuKey');

export default class Namespace extends Model {

    [kDokkuKey];

    name;

    globalDomain;

    #apps = [];

    constructor(dokkuKey) {
        super()
        this[kDokkuKey] = dokkuKey;
    }

    get apps() {
        return this.#apps;
    }

    async refresh() {
        try {
            this.#apps = await this[kRefreshApps]();
        } catch (e) {
            console.error("Error refreshing apps", e);
        }
    }

    get #dokku() {
        return this[this[kDokkuKey]];
    }

    async [kRefreshApps]() {
        const appsList = await this.#dokku.appsList();
        const proxyPorts = await this.#dokku.proxyPorts(appsList);
        const psScale = await this.#dokku.psScale(appsList);

        const apps = [];
        for (const appName of appsList) {
            const app = new App(this);
            app.name = appName;
            app.refresh({
                proxyPorts: proxyPorts[appName],
                psScale: psScale[appName],
            })
            apps.push(app);
        }
        return apps;
    }

    toJson() {
        return {
            name: this.name,
            globalDomain: this.globalDomain,
            apps: this.apps.map(app => app.toJson()),
        }
    }
}