<?php declare(strict_types=1);

namespace app\util;

use app\exceptions\ServerConnectException;
use app\model\Servers;

class DokkuServer {

    private function __construct(
        private object $server,
    ) {}

    public static function fromServer(object|string $server): DokkuServer {
        if(\is_string($server)) {
            $server = Servers::instance()->get($server);
        }
        return new DokkuServer($server);
    }

    public function connect(): void {
        $connection = \ssh2_connect($this->server->host, (int)$this->server->port);
        if(!$connection) {
            throw ServerConnectException::create(
                message: "Falha ao conectar ao servidor {$this->server->name}",
                type: "danger"
            );
        }
        if(!\ssh2_auth_pubkey_file($connection, $this->server->user, $this->server->public_key, $this->server->private_key)) {
            throw ServerConnectException::create(
                message: "Falha ao autenticar ao servidor {$this->server->name}",
                type: "danger"
            );
        }
        echo "Conectado ao servidor {$this->server->name}";die;
    }
    public function createApp(string $name): void {
        "dokku apps:create deploy-app";
        throw ServerConnectException::create(
            message: "Falha ao conectar ao servidor {$this->server->name}",
            type: "danger"
        );
    }
    public function addDomains(string $app, string $domains): void {
        "dokku domains:add deploy-app deploy.app.br";
        throw ServerConnectException::create(
            message: "Falha ao conectar ao servidor {$this->server->name}",
            type: "danger"
        );
    }

    public function enableSSL(string $app): void {
        "dokku letsencrypt:enable deploy-app";
        throw ServerConnectException::create(
            message: "Falha ao conectar ao servidor {$this->server->name}",
            type: "danger"
        );
    }

    public function setPortsMapping(string $app, string $ports): void {
        "dokku proxy:ports-set deploy-app http:80:80 https:443:80";
        throw ServerConnectException::create(
            message: "Falha ao conectar ao servidor {$this->server->name}",
            type: "danger"
        );
    }
    
    public function setEnvironmentVariables(string $app, string $envs): void {
        //ignorar todas as configs que começam com DOKKU
        "dokku config:unset deploy-app KEY1 KEY2";
        "dokku config:set deploy-app KEY1=VALUE1 KEY2=VALUE2";
        throw ServerConnectException::create(
            message: "Falha ao conectar ao servidor {$this->server->name}",
            type: "danger"
        );
    }

}