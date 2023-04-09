import DokkuSSH from "../util/DokkuSSH.js";
import Model from "./Model.js";
import Namespace from "./Namespace.js";

export default class System extends Model {

    #namespaces = [];
    #lastRefreshTime = 0;

    get namespaces() {
        return this.#namespaces;
    }
    get lastRefreshTime() {
        return this.#lastRefreshTime;
    }

    toJson() {
        return {
            namespaces: this.namespaces.map(namespace => namespace.toJson()),

            _lastRefreshTime: this.lastRefreshTime,
        }
    }

    async refresh() {
        for(const namespace of this.namespaces) {
            await namespace.refresh();
        }
        this.#lastRefreshTime = Date.now();
        setTimeout(this.refresh.bind(this), (process.env.REFRESH_INTERVAL || 600) * 1000);
    }

    static #instance
    static instance() {
        if(!System.#instance) {
            const instance = new System()

            const namespacesData = JSON.parse(process.env.NAMESPACES)
            for(const namespaceData of namespacesData) {
                if(namespaceData.name == "evve") continue;
                const namespace = new Namespace({
                    name: namespaceData.name,
                    dokkuSSH: DokkuSSH.create({
                        host: namespaceData.server_host,
                        port: namespaceData.server_port,
                        username: namespaceData.server_username,
                        privateKey: namespaceData.server_privateKey,
                    })
                })
                instance.#namespaces.push(namespace)
            }

            instance.refresh();

            System.#instance = instance
        }
        return System.#instance
    }

}