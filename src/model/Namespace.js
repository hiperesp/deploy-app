import DokkuSSH from '../util/DokkuSSH.js';
import App from './App.js'
import Model from './Model.js';

const kServerHost = Symbol('serverHost');
const kServerPort = Symbol('serverPort');
const kServerUsername = Symbol('serverUsername');
const kServerPrivateKey = Symbol('serverPrivateKey');

export default class Namespace extends Model {

    constructor() {
        super()
    }

    name;

    globalDomain;

    [kServerHost];
    [kServerPort];
    [kServerUsername];
    [kServerPrivateKey];

    dokkuSSH;

    async getApps() {
        const appsList = await this.dokkuSSH.appsList();
        const proxyPorts = await this.dokkuSSH.proxyPorts(appsList);
        const psScale = await this.dokkuSSH.psScale(appsList);

        const apps = [];
        for (const appName of appsList) {
            const app = new App(this);
            app.name = appName;
            app.proxyPorts = proxyPorts[appName];
            app.psScale = psScale[appName];
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

            namespace[kServerHost] = process.env.NAMESPACE_SERVER_HOST
            namespace[kServerPort] = process.env.NAMESPACE_SERVER_PORT
            namespace[kServerUsername] = process.env.NAMESPACE_SERVER_USERNAME
            namespace[kServerPrivateKey] = process.env.NAMESPACE_SERVER_PRIVATE_KEY

            namespace.dokkuSSH = DokkuSSH.create({
                host: namespace[kServerHost],
                port: namespace[kServerPort],
                username: namespace[kServerUsername],
                privateKey: namespace[kServerPrivateKey],
            });

            Namespace.instances[name] = namespace;
        }
        return Namespace.instances[name];
    }

    async toJson() {
        return {
            name: this.name,
            globalDomain: this.globalDomain,
        }
    }
}