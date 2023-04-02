import DokkuSSH from "../util/DokkuSSH.js";
import Model from "./Model.js";
import Namespace from "./Namespace.js";

const refreshInterval = 1000 * 60 * 1; // 1 minutes
const kDokku = Symbol('dokku');

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
            lastRefreshTime: this.lastRefreshTime,
        }
    }

    async refresh() {
        for(const namespace of this.namespaces) {
            await namespace.refresh();
        }
        this.#lastRefreshTime = Date.now();
        setTimeout(this.refresh.bind(this), refreshInterval);
    }

    static #instance
    static instance() {
        if(!System.#instance) {
            const instance = new System()

            const namespace = new Namespace(kDokku)
            namespace.name = process.env.NAMESPACE_NAME
            namespace[kDokku] = DokkuSSH.create({
                host: process.env.NAMESPACE_SERVER_HOST,
                port: process.env.NAMESPACE_SERVER_PORT,
                username: process.env.NAMESPACE_SERVER_USERNAME,
                privateKey: process.env.NAMESPACE_SERVER_PRIVATE_KEY
            });
            instance.#namespaces.push(namespace)

            instance.refresh();

            System.#instance = instance
        }
        return System.#instance
    }

}