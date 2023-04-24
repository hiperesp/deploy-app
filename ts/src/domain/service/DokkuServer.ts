import App from "../entity/App";
import { KillableOperation } from "../types/KillableOperation";
import { Scaling } from "../types/Scaling";
import { Stderr } from "../types/Stderr";
import { Stdout } from "../types/Stdout";
import IDokkuServer from "./IDokkuServer";

export default class DokkuServer implements IDokkuServer {
    
    apps_list(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    letsencrypt_list(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    letsencrypt_enable(app: App, stdout: Stdout, stderr: Stderr): Promise<string> {
        throw new Error("Method not implemented.");
    }
    letsencrypt_disable(app: App, stdout: Stdout, stderr: Stderr): Promise<string> {
        throw new Error("Method not implemented.");
    }

    ps_scale(app: App, scaling: Scaling | undefined, stdout: Stdout, stderr: Stderr): Promise<string> {
        throw new Error("Method not implemented.");
    }

    nginx_accessLogs(app: App, stdout: Stdout): Promise<KillableOperation> {
        throw new Error("Method not implemented.");
    }
    nginx_errorLogs(app: App, stdout: Stdout): Promise<KillableOperation> {
        throw new Error("Method not implemented.");
    }

    logs(app: App, stdout: Stdout): Promise<KillableOperation> {
        throw new Error("Method not implemented.");
    }

    domains_report(app: App): Promise<string> {
        throw new Error("Method not implemented.");
    }

    proxy_ports(app: App): Promise<string> {
        throw new Error("Method not implemented.");
    }
}