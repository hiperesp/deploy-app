import App from "../../domain/entity/App";
import IAppRepository from "../repository/IAppRepository";

export default class GetApps {
    appRepository: IAppRepository;

    constructor(appRepository: IAppRepository) {
        this.appRepository = appRepository;
    }

    async execute(): Promise<App[]> {
        return this.appRepository.getApps();
    }
}