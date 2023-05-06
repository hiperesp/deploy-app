import App from "../../domain/entity/App";
import IAppRepository from "../repository/IAppRepository";
import IExecutable from "./IExecutable";

export default class GetApps implements IExecutable<App[]> {
    appRepository: IAppRepository;

    constructor(appRepository: IAppRepository) {
        this.appRepository = appRepository;
    }

    async execute(): Promise<App[]> {
        return this.appRepository.getApps();
    }
}