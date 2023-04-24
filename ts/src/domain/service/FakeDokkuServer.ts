import App from "../entity/App"
import { Scaling } from "../types/Scaling"
import { Stdout } from "../types/Stdout"
import { Stderr } from "../types/Stderr"
import { KillableOperation } from "../types/KillableOperation"
import IDokkuServer from "./IDokkuServer"

export default class FakeDokkuServer implements IDokkuServer {

    /** apps:* */

    async apps_list(): Promise<string> {
        return [
            "=====> My Apps",
            "deploy-app",
            "gabstep-web",
            "og-preview",
            "whatsapp-js-flow",
            "",
        ].join("\n")
    }

    /** letsencrypt:* */

    async letsencrypt_list(): Promise<string> {
        return [
            "-----> App name           Certificate Expiry        Time before expiry        Time before renewal      ",
            "deploy-app                2023-07-08 16:46:20       75d, 15h, 54m, 17s        45d, 15h, 54m, 17s       ",
            "gabstep-web               2023-07-08 16:46:32       75d, 15h, 54m, 29s        45d, 15h, 54m, 29s       ",
            "og-preview                2023-07-13 15:40:14       80d, 14h, 48m, 11s        50d, 14h, 48m, 11s       ",
            "",
        ].join("\n")
    }

    async letsencrypt_enable(app: App, stdout: Stdout, stderr: Stderr): Promise<string> {
        const outputLines = [
            "=====> Enabling letsencrypt for gabstep-web",
            "-----> Enabling ACME proxy for gabstep-web...",
            "-----> Getting letsencrypt certificate for gabstep-web via HTTP-01",
            "        - Domain 'gabstep-web.deploy.app.br'",
            "        - Domain 'gabstep.com.br'",
            "        - Domain 'www.gabstep.com.br'",
            "2023/04/24 01:14:28 [INFO] [gabstep-web.deploy.app.br, gabstep.com.br, www.gabstep.com.br] acme: Obtaining bundled SAN certificate",
            "2023/04/24 01:14:29 [INFO] [gabstep-web.deploy.app.br] AuthURL: https://acme-v02.api.letsencrypt.org/acme/authz-v3/????????????",
            "2023/04/24 01:14:29 [INFO] [gabstep.com.br] AuthURL: https://acme-v02.api.letsencrypt.org/acme/authz-v3/????????????",
            "2023/04/24 01:14:29 [INFO] [www.gabstep.com.br] AuthURL: https://acme-v02.api.letsencrypt.org/acme/authz-v3/????????????",
            "2023/04/24 01:14:29 [INFO] [gabstep-web.deploy.app.br] acme: Could not find solver for: tls-alpn-01",
            "2023/04/24 01:14:29 [INFO] [gabstep-web.deploy.app.br] acme: use http-01 solver",
            "2023/04/24 01:14:29 [INFO] [gabstep.com.br] acme: Could not find solver for: tls-alpn-01",
            "2023/04/24 01:14:29 [INFO] [gabstep.com.br] acme: use http-01 solver",
            "2023/04/24 01:14:29 [INFO] [www.gabstep.com.br] acme: Could not find solver for: tls-alpn-01",
            "2023/04/24 01:14:29 [INFO] [www.gabstep.com.br] acme: use http-01 solver",
            "2023/04/24 01:14:29 [INFO] [gabstep-web.deploy.app.br] acme: Trying to solve HTTP-01",
            "2023/04/24 01:14:37 [INFO] [gabstep-web.deploy.app.br] The server validated our request",
            "2023/04/24 01:14:37 [INFO] [gabstep.com.br] acme: Trying to solve HTTP-01",
            "2023/04/24 01:14:42 [INFO] [gabstep.com.br] The server validated our request",
            "2023/04/24 01:14:42 [INFO] [www.gabstep.com.br] acme: Trying to solve HTTP-01",
            "2023/04/24 01:14:46 [INFO] [www.gabstep.com.br] The server validated our request",
            "2023/04/24 01:14:46 [INFO] [gabstep-web.deploy.app.br, gabstep.com.br, www.gabstep.com.br] acme: Validations succeeded requesting certificates",
            "2023/04/24 01:14:47 [INFO] [gabstep-web.deploy.app.br] Server responded with a certificate.",
            "-----> Certificate retrieved successfully.",
            "-----> Installing let's encrypt certificates",
            "-----> Unsetting DOKKU_PROXY_SSL_PORT",
            "-----> Setting config vars",
            "    DOKKU_PROXY_PORT_MAP:  http:80:80",
            "-----> Setting config vars",
            "    DOKKU_PROXY_PORT_MAP:  http:80:80 https:443:80",
            "-----> Configuring gabstep-web.deploy.app.br...(using built-in template)",
            "-----> Configuring gabstep.com.br...(using built-in template)",
            "-----> Configuring www.gabstep.com.br...(using built-in template)",
            "-----> Creating https nginx.conf",
            "    Enabling HSTS",
            "    Reloading nginx",
            "-----> Ensuring network configuration is in sync for gabstep-web",
            "-----> Configuring gabstep-web.deploy.app.br...(using built-in template)",
            "-----> Configuring gabstep.com.br...(using built-in template)",
            "-----> Configuring www.gabstep.com.br...(using built-in template)",
            "-----> Creating https nginx.conf",
            "    Enabling HSTS",
            "    Reloading nginx",
            "-----> Disabling ACME proxy for gabstep-web...",
            "-----> Done",
            "",
        ]

        for(const line of outputLines) {
            if(Math.random() > 0.9) {
                stderr(line)
            } else {
                stdout(line)
            }
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        }
        return outputLines.join("\n")
    }

    async letsencrypt_disable(app: App, stdout: Stdout, stderr: Stderr): Promise<string> {
        const outputLines = [
            "-----> Disabling letsencrypt for app",
            "       Removing letsencrypt files for whatsapp-js-flow",
            "       Removing SSL endpoint from whatsapp-js-flow",
            "-----> Skipping DOKKU_PROXY_SSL_PORT, it is not set in the environment",
            "-----> Setting config vars",
            "       DOKKU_PROXY_PORT_MAP:  http:80:3000",
            " !     No web listeners specified for whatsapp-js-flow",
            "-----> Done",
            "",
        ]

        for(const line of outputLines) {
            if(Math.random() > 0.9) {
                stderr(line)
            } else {
                stdout(line)
            }
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        }
        return outputLines.join("\n")
    }

    /** ps:* */

    async ps_scale(app: App, scaling: Scaling | undefined, stdout: Stdout, stderr: Stderr): Promise<string> {
        if(!scaling) {
            return [
                "-----> Scaling for whatsapp-js-flow",
                "proctype: qty",
                "--------: ---",
                "web:  2",
                "",
            ].join("\n")
        }
        const outputLines = [
            "-----> Scaling whatsapp-js-flow processes: web=2",
            "-----> Deploying web (count=2)",
            "       Attempting pre-flight checks (web.1)",
            "       Waiting for 10 seconds (web.1)",
            "       Default container check successful (web.1)",
            "       Attempting pre-flight checks (web.2)",
            "       Waiting for 10 seconds (web.2)",
            "       Default container check successful (web.2)",
            "=====> Triggering early nginx proxy rebuild",
            "-----> Ensuring network configuration is in sync for whatsapp-js-flow",
            "-----> Configuring whatsapp-js-flow.host3.gabstep.com.br...(using built-in template)",
            "-----> Creating http nginx.conf",
            "       Reloading nginx",
            "-----> Running post-deploy",
            " !     Detected IPv4 domain name with nginx proxy enabled.",
            " !     Ensure the default nginx site is removed before continuing.",
            "-----> Ensuring network configuration is in sync for whatsapp-js-flow",
            "-----> Configuring whatsapp-js-flow.host3.gabstep.com.br...(using built-in template)",
            "-----> Creating http nginx.conf",
            "       Reloading nginx",
            "-----> Renaming containers",
            "       Found previous container(s) (49a26950dfcb) named whatsapp-js-flow.web.1",
            "       Renaming container (49a26950dfcb) whatsapp-js-flow.web.1 to whatsapp-js-flow.web.1.1682299535",
            "       Renaming container whatsapp-js-flow.web.1.upcoming-17214 (ed1e08bf5193) to whatsapp-js-flow.web.1",
            "       Renaming container whatsapp-js-flow.web.2.upcoming-29417 (928ed7ade7d8) to whatsapp-js-flow.web.2",
            "-----> Checking for postdeploy task",
            "       No postdeploy task found, skipping",
            "",
        ]

        for(const line of outputLines) {
            if(Math.random() > 0.9) {
                stderr(line)
            } else {
                stdout(line)
            }
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        }
        return outputLines.join("\n")
    }

    /** nginx:* */
    async nginx_accessLogs(app: App, stdout: Stdout): Promise<KillableOperation> {
        const outputLines = [
            '??.???.??.?? - - [24/Apr/2023:01:07:46 +0000] "GET /.env HTTP/1.1" 401 4271 "-" "Mozilla/5.0 (Linux; U; Android 4.4.2; en-US; HM NOTE 1W Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/11.0.5.850 U3/0.8.0 Mobile Safari/534.30',
            '???.??.?.??? - - [24/Apr/2023:01:07:46 +0000] "POST / HTTP/1.1" 401 4267 "-" "Mozilla/5.0 (Linux; U; Android 4.4.2; en-US; HM NOTE 1W Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/11.0.5.850 U3/0.8.0 Mobile Safari/534.30',
            '??.???.???.? - - [24/Apr/2023:01:16:47 +0000] "GET / HTTP/1.1" 301 162 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            '???.???.??.?? - - [24/Apr/2023:01:18:48 +0000] "GET /images/logo-bg-transparent.png HTTP/1.1" 200 125454 "https://gabstep.com.br/images/logo-bg-transparent.png" "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36"',
            '???.???.???.? - - [24/Apr/2023:01:18:55 +0000] "GET /images/logo-bg-transparent.png HTTP/1.1" 200 125454 "https://gabstep.com.br/images/logo-bg-transparent.png" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0"',
            '???.???.???.? - - [24/Apr/2023:01:18:55 +0000] "GET /images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg HTTP/1.1" 200 50677 "https://gabstep.com.br/images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0"',
            '???.???.???.? - - [24/Apr/2023:01:18:55 +0000] "GET /images/logotipo-bg-branco-transparent.png HTTP/1.1" 200 200205 "https://gabstep.com.br/images/logotipo-bg-branco-transparent.png" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0"',
            '??.???.???.??? - - [24/Apr/2023:01:19:01 +0000] "GET /images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg HTTP/1.1" 200 50677 "https://gabstep.com.br/images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1"',
            '??.???.???.??? - - [24/Apr/2023:01:19:01 +0000] "GET /images/logo-bg-transparent.png HTTP/1.1" 200 125454 "https://gabstep.com.br/images/logo-bg-transparent.png" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1"',
            '??.???.???.??? - - [24/Apr/2023:01:19:01 +0000] "GET /images/logotipo-bg-branco-transparent.png HTTP/1.1" 200 200205 "https://gabstep.com.br/images/logotipo-bg-branco-transparent.png" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1"',
            '??.???.??.??? - - [24/Apr/2023:01:19:06 +0000] "GET /images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg HTTP/1.1" 200 50677 "https://gabstep.com.br/images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"',
            '??.???.??.??? - - [24/Apr/2023:01:19:06 +0000] "GET /images/logo-bg-transparent.png HTTP/1.1" 200 125454 "https://gabstep.com.br/images/logo-bg-transparent.png" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"',
            '??.???.??.??? - - [24/Apr/2023:01:19:06 +0000] "GET /images/logotipo-bg-branco-transparent.png HTTP/1.1" 200 200205 "https://gabstep.com.br/images/logotipo-bg-branco-transparent.png" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"',
            '???.???.???.?? - - [24/Apr/2023:01:19:10 +0000] "GET /images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg HTTP/1.1" 200 50677 "https://gabstep.com.br/images/COPIARCOPYLogotipo200x200px.1_clipdrop-enhance.jpeg" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1"',
            '???.???.???.?? - - [24/Apr/2023:01:19:10 +0000] "GET /images/logotipo-bg-branco-transparent.png HTTP/1.1" 200 200205 "https://gabstep.com.br/images/logotipo-bg-branco-transparent.png" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1"',
            '???.???.???.?? - - [24/Apr/2023:01:19:10 +0000] "GET /images/logo-bg-transparent.png HTTP/1.1" 200 125454 "https://gabstep.com.br/images/logo-bg-transparent.png" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1"',
            '???.???.???.?? - - [24/Apr/2023:01:22:52 +0000] "HEAD / HTTP/1.1" 200 0 "https://gabstep.com.br" "Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)"',
            '??.??.???.??? - - [24/Apr/2023:01:27:50 +0000] "GET / HTTP/1.1" 301 162 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/103.0.5060.134 Safari/537.36"',
            '???.???.???.?? - - [24/Apr/2023:01:27:52 +0000] "HEAD / HTTP/1.1" 200 0 "https://gabstep.com.br" "Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)"',
            '???.???.???.??? - - [24/Apr/2023:01:30:37 +0000] "GET /robots.txt HTTP/1.1" 301 162 "-" "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)"',
            '???.???.???.??? - - [24/Apr/2023:01:30:39 +0000] "GET /robots.txt HTTP/1.1" 404 196 "-" "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)"',
            '???.???.???.??? - - [24/Apr/2023:01:30:40 +0000] "GET / HTTP/1.1" 301 162 "-" "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)"',
            '???.???.???.??? - - [24/Apr/2023:01:30:42 +0000] "GET / HTTP/1.1" 200 12715 "-" "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)"',
        ]

        const sendRandomLogLoop = () => {
            stdout(outputLines[Math.floor(outputLines.length * Math.random())])
            return timeout = setTimeout(sendRandomLogLoop, Math.random()*100)
        }
        let timeout: NodeJS.Timeout = sendRandomLogLoop()

        return {
            kill: () => {
                clearTimeout(timeout)
            }
        }
    }

    async nginx_errorLogs(app: App, stdout: Stdout): Promise<KillableOperation> {
        const outputLines = [
            '2023/04/24 01:16:27 [crit] 3443570#3443570: *37032 SSL_do_handshake() failed (SSL: error:0A00006C:SSL routines::bad key share) while SSL handshaking, client: ???.???.???.???, server: 0.0.0.0:443',
            '2023/04/24 01:16:27 [crit] 3443570#3443570: *37033 SSL_do_handshake() failed (SSL: error:0A00006C:SSL routines::bad key share) while SSL handshaking, client: ???.???.???.???, server: 0.0.0.0:443',
            '2023/04/24 01:16:33 [crit] 3443570#3443570: *37135 SSL_do_handshake() failed (SSL: error:0A00006C:SSL routines::bad key share) while SSL handshaking, client: ??.???.???.??, server: 0.0.0.0:443',
            '2023/04/24 01:16:33 [crit] 3443570#3443570: *37137 SSL_do_handshake() failed (SSL: error:0A00006C:SSL routines::bad key share) while SSL handshaking, client: ???.??.???.???, server: 0.0.0.0:443',
            '2023/04/24 01:29:46 [crit] 3470103#3470103: *37397 SSL_do_handshake() failed (SSL: error:0A00006C:SSL routines::bad key share) while SSL handshaking, client: ???.???.??.???, server: 0.0.0.0:443',
        ]

        const sendRandomLogLoop = () => {
            stdout(outputLines[Math.floor(outputLines.length * Math.random())])
            return timeout = setTimeout(sendRandomLogLoop, Math.random()*100)
        }
        let timeout: NodeJS.Timeout = sendRandomLogLoop()

        return {
            kill: () => {
                clearTimeout(timeout)
            }
        }
    }

    /** logs:* */

    async logs(app: App, stdout: Stdout): Promise<KillableOperation> {
        const outputLines = [
            '\x1b[[36m2023-04-21T01:11:56.213623819Z app[web.1]:\x1b[[0m',
            '\x1b[[36m2023-04-21T01:11:56.213678379Z app[web.1]:\x1b[[0m > deploy-app@1.0.0 start',
            '\x1b[[36m2023-04-21T01:11:56.213682859Z app[web.1]:\x1b[[0m > node deploy-app.js',
            '\x1b[[36m2023-04-21T01:11:56.213685939Z app[web.1]:\x1b[[0m',
            '\x1b[[36m2023-04-21T01:11:56.424601578Z app[web.1]:\x1b[[0m Servidor iniciado na porta 3000',
            '\x1b[[36m2023-04-22T00:09:20.704038305Z app[web.1]:\x1b[[0m Error refreshing namespace Pseudo-terminal will not be allocated because stdin is not a terminal.',
            '\x1b[[36m2023-04-22T00:09:20.704080544Z app[web.1]:\x1b[[0m kex_exchange_identification: read: Connection reset by peer',
            '\x1b[[36m2023-04-22T00:09:20.704084344Z app[web.1]:\x1b[[0m Connection reset by ???.??.???.??? port 22',
            '\x1b[[36m2023-04-22T00:09:20.704087064Z app[web.1]:\x1b[[0m',
            '\x1b[[36m2023-04-22T03:55:49.773022551Z app[web.1]:\x1b[[0m Error refreshing namespace Pseudo-terminal will not be allocated because stdin is not a terminal.',
            '\x1b[[36m2023-04-22T03:55:49.773056791Z app[web.1]:\x1b[[0m kex_exchange_identification: Connection closed by remote host',
            '\x1b[[36m2023-04-22T03:55:49.773060711Z app[web.1]:\x1b[[0m Connection closed by ???.??.???.??? port 22',
            '\x1b[[36m2023-04-22T03:55:49.773063511Z app[web.1]:\x1b[[0m',
            '\x1b[[36m2023-04-22T06:19:50.616950296Z app[web.1]:\x1b[[0m Error refreshing namespace Pseudo-terminal will not be allocated because stdin is not a terminal.',
            '\x1b[[36m2023-04-22T06:19:50.616980576Z app[web.1]:\x1b[[0m kex_exchange_identification: Connection closed by remote host',
            '\x1b[[36m2023-04-22T06:19:50.616984176Z app[web.1]:\x1b[[0m Connection closed by ???.??.???.??? port 22',
            '\x1b[[36m2023-04-22T06:19:50.616987256Z app[web.1]:\x1b[[0m',
            '\x1b[[36m2023-04-22T15:25:15.319226434Z app[web.1]:\x1b[[0m Error refreshing namespace Pseudo-terminal will not be allocated because stdin is not a terminal.',
            '\x1b[[36m2023-04-22T15:25:15.319254994Z app[web.1]:\x1b[[0m kex_exchange_identification: read: Connection reset by peer',
            '\x1b[[36m2023-04-22T15:25:15.319258634Z app[web.1]:\x1b[[0m Connection reset by ???.??.???.??? port 22',
            '\x1b[[36m2023-04-22T15:25:15.319261274Z app[web.1]:\x1b[[0m',
            '\x1b[[36m2023-04-23T07:33:00.443201053Z app[web.1]:\x1b[[0m Error refreshing namespace Pseudo-terminal will not be allocated because stdin is not a terminal.',
            '\x1b[[36m2023-04-23T07:33:00.443229132Z app[web.1]:\x1b[[0m kex_exchange_identification: read: Connection reset by peer',
            '\x1b[[36m2023-04-23T07:33:00.443232892Z app[web.1]:\x1b[[0m Connection reset by ???.??.???.??? port 22',
            '\x1b[[36m2023-04-23T07:33:00.443235692Z app[web.1]:\x1b[[0m',
        ]

        const sendRandomLogLoop = () => {
            stdout(outputLines[Math.floor(outputLines.length * Math.random())])
            return timeout = setTimeout(sendRandomLogLoop, Math.random()*100)
        }
        let timeout: NodeJS.Timeout = sendRandomLogLoop()

        return {
            kill: () => {
                clearTimeout(timeout)
            }
        }
    }

    /** domains:* */

    async domains_report(app: App): Promise<string> {
        return [
            '=====> deploy-app domains information',
            'Domains app enabled:           true',
            'Domains app vhosts:            deploy.app.br www.deploy.app.br',
            'Domains global enabled:        true',
            'Domains global vhosts:         deploy.app.br',
            '',
        ].join('\n')
    }

    /** proxy:* */

    async proxy_ports(app: App): Promise<string> {
        return [
            '-----> Port mappings for deploy-app',
            '    -----> scheme  host port  container port',
            '    http           80         3000',
            '    https          443        3000',
            '',
        ].join('\n')
    }

}