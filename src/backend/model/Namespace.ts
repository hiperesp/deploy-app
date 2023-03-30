import DokkuSSH from '../DokkuSSH';
import App from './App'

export default class Namespace {

    name: string;

    globalDomain: string;

    serverHost: string;
    serverPort: number;
    serverUsername: string;
    serverPrivateKey: string;

    dokkuSSH: DokkuSSH;

    async getApps(): Promise<App[]> {
        const appsNames = await this.dokkuSSH.appsList();
        const apps: App[] = [];
        for (const appName of appsNames) {
            const app = new App(this);
            app.name = appName;
            apps.push(app);
        }
        return apps;
    }

    static get(name: string): Namespace {
        if(name !== 'default') throw new Error(`Namespace ${name} not found`)

        const namespace: Namespace = new Namespace()

        namespace.name = 'default'

        namespace.globalDomain = 'deploy.app.br'

        namespace.serverHost = 'deploy.app.br'
        namespace.serverPort = 22
        namespace.serverUsername = 'dokku'
        namespace.serverPrivateKey = ''

        namespace.dokkuSSH = DokkuSSH.fromNamespace(namespace);

        return namespace;
    }
}