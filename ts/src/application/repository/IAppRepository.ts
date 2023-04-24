import App from "../../domain/entity/App";

export default interface IAppRepository {
    getApps(): Promise<App[]>;
    getAppByName(appName: string): Promise<App | undefined>;
}