import IAppRepository from "../../../application/repository/IAppRepository";
import App from "../../../domain/entity/App";
import IDokkuServer from "../../../domain/service/IDokkuServer";

export default class AppRepository implements IAppRepository {
    
    constructor(readonly dokkuServer: IDokkuServer) {
    }

    async getApps(): Promise<App[]> {
        const appsNames = (await this.dokkuServer.apps_list()).split(/\n/);
        appsNames.shift(); // Remove the first element, which is the header
        appsNames.pop();   // Remove the last element, which is an empty string

        const output: App[] = [];
        for (const app of appsNames) {
            output.push(new App(app));
        }

        return output;
    }
    async getAppByName(appName: string): Promise<App | undefined> {
        return undefined;
    }
}