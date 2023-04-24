import App from "../entity/App"
import { KillableOperation } from "../types/KillableOperation"
import { Scaling } from "../types/Scaling"
import { Stderr } from "../types/Stderr"
import { Stdout } from "../types/Stdout"

export default interface IDokkuServer {

    apps_list(): Promise<string>

    letsencrypt_list(): Promise<string>
    letsencrypt_enable(app: App, stdout: Stdout, stderr: Stderr): Promise<string>
    letsencrypt_disable(app: App, stdout: Stdout, stderr: Stderr): Promise<string>

    ps_scale(app: App, scaling: Scaling | undefined, stdout: Stdout, stderr: Stderr): Promise<string>

    nginx_accessLogs(app: App, stdout: Stdout): Promise<KillableOperation>
    nginx_errorLogs(app: App, stdout: Stdout): Promise<KillableOperation>

    logs(app: App, stdout: Stdout): Promise<KillableOperation>

    domains_report(app: App): Promise<string>
    proxy_ports(app: App): Promise<string>
    
}