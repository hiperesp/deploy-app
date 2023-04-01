import DokkuSSH from '../util/DokkuSSH.js';
import App from './App.js'

export default class Namespace {

    name;

    globalDomain;

    serverHost;
    serverPort;
    serverUsername;
    serverPrivateKey;

    dokkuSSH;

    async getApps() {
        const appsNames = await this.dokkuSSH.appsList();
        const apps = [];
        for (const appName of appsNames) {
            const app = new App(this);
            app.name = appName;
            apps.push(app);
        }
        return apps;
    }

    static instances = {};
    static get(name) {
        if(!Namespace.instances[name]) {

            if(name !== process.env.NAMESPACE_NAME) throw new Error(`Namespace ${name} not found`)

            const namespace = new Namespace()

            namespace.name = process.env.NAMESPACE_NAME

            namespace.globalDomain = process.env.NAMESPACE_GLOBAL_DOMAIN

            namespace.serverHost = process.env.NAMESPACE_SERVER_HOST
            namespace.serverPort = process.env.NAMESPACE_SERVER_PORT
            namespace.serverUsername = process.env.NAMESPACE_SERVER_USERNAME
            namespace.serverPrivateKey = process.env.NAMESPACE_SERVER_PRIVATE_KEY

            namespace.dokkuSSH = DokkuSSH.fromNamespace(namespace);

            Namespace.instances[name] = namespace;
        }
        return Namespace.instances[name];
    }
}