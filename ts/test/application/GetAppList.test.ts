import {test, expect} from '@jest/globals'
import GetApps from "../../src/application/usecase/GetApps";
import AppRepository from "../../src/infra/repository/dokku-server/AppRepository";
import FakeDokkuServer from '../../src/domain/service/FakeDokkuServer';

test("Return a list of apps", async () => {
    const appRepository = new AppRepository(new FakeDokkuServer);

    const getApps = new GetApps(appRepository);

    const output = await getApps.execute();

    expect(output.length).toBe(4);
    expect(output[0].name).toBe("deploy-app");
    expect(output[1].name).toBe("gabstep-web");
    expect(output[2].name).toBe("og-preview");
    expect(output[3].name).toBe("whatsapp-js-flow");
});