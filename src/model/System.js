import DokkuSSH from "../util/DokkuSSH.js";
import UpdateCheck from "../util/UpdateCheck.js";
import Model from "./Model.js";
import Namespace from "./Namespace.js";
import os from "node:os";

export default class System extends Model {

    #namespaces = [];
    #lastRefreshTime = 0;
    #updateChecker = null;

    get namespaces() {
        return this.#namespaces;
    }
    get lastRefreshTime() {
        return this.#lastRefreshTime;
    }
    get updateChecker() {
        return this.#updateChecker;
    }
    get hostname() {
        return os.hostname();
    }
    get currentAppPath() {
        for(const namespace of this.namespaces) {
            for(const app of namespace.apps) {
                for(const instance of app.instances) {
                    if(instance.hostname === this.hostname) {
                        return `/${namespace.name}/${app.name}`;
                    }
                }
            }
        }
        return null;
    }

    toJson() {
        return {
            namespaces: this.namespaces.map(namespace => namespace.toJson()),
            updateCheck: this.updateChecker.toJson(),
            _lastRefreshTime: this.lastRefreshTime,
            hostname: this.hostname,
            currentAppPath: this.currentAppPath,
        }
    }

    async verifyUpdates() {
        if(process.env.UPDATE_CHECK_INTERVAL < 1) return;

        this.#updateChecker.check();
        setTimeout(this.verifyUpdates.bind(this), (process.env.UPDATE_CHECK_INTERVAL || 3600) * 1000, null);
    }

    async refresh() {
        await Promise.all(this.namespaces.map(namespace => namespace.refresh()));
        this.#lastRefreshTime = Date.now();
        setTimeout(this.refresh.bind(this), (process.env.REFRESH_INTERVAL || 600) * 1000, null);
    }

    static #instance
    static instance() {
        if(!System.#instance) {
            const instance = new System()

            instance.#updateChecker = new UpdateCheck();

            if(!process.env.NAMESPACES) throw new Error("Missing namespaces environment variable in .env file: NAMESPACES");

            try {
                const namespacesData = JSON.parse(process.env.NAMESPACES)

                if(!Array.isArray(namespacesData)) throw new Error("NAMESPACES environment variable must be an array of namespaces, see README.md");

                for(const namespaceData of namespacesData) {
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
                instance.verifyUpdates();

                System.#instance = instance

            } catch(e) {
                throw new Error("NAMESPACES environment variable must be a valid JSON array, see README.md");
            }
        }

        return System.#instance
    }

}