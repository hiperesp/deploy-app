<?php declare(strict_types=1);

namespace app\model;

class Servers extends Model {

    public function __construct() {
        parent::__construct();
    }

    public function list(): array {
        return \json_decode(\json_encode([
            [
                "name" => "oci-server-1",
                "host" => "0.0.0.0",
                "port" => "22",
                "username" => "ubuntu",
                "privateKey" => <<<SSH
                -----BEGIN OPENSSH PRIVATE KEY-----
                b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
                -----END OPENSSH PRIVATE KEY-----
                SSH,
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.2,
                    "memoryUsage" => 0.4,
                ],
            ],
            [
                "name" => "oci-server-2",
                "host" => "0.0.0.0",
                "port" => "22",
                "username" => "ubuntu",
                "privateKey" => <<<SSH
                -----BEGIN OPENSSH PRIVATE KEY-----
                b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
                -----END OPENSSH PRIVATE KEY-----
                SSH,
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.5,
                    "memoryUsage" => 0.8,
                ],
            ],
            [
                "name" => "aws-server",
                "host" => "0.0.0.0",
                "port" => "22",
                "username" => "ubuntu",
                "privateKey" => <<<SSH
                -----BEGIN OPENSSH PRIVATE KEY-----
                b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
                -----END OPENSSH PRIVATE KEY-----
                SSH,
                "status" => "stopped",
                "metrics" => [
                    "cpuUsage" => 0.8,
                    "memoryUsage" => 0.9,
                ],
            ],
            [
                "name" => "aws-server-2",
                "host" => "0.0.0.0",
                "port" => "22",
                "username" => "ubuntu",
                "privateKey" => <<<SSH
                -----BEGIN OPENSSH PRIVATE KEY-----
                b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
                -----END OPENSSH PRIVATE KEY-----
                SSH,
                "status" => "unknown",
            ],
        ]));
    }

    public function get(string $name): ?object {
        foreach($this->list() as $app) {
            if($app->name === $name) {
                return $app;
            }
        }
        return null;
    }

}