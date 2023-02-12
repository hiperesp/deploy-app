<?php declare(strict_types=1);

namespace app\model;

class Servers extends Model {

    public function __construct() {
        parent::__construct();
    }

    public function list(): array {
        return [
            [
                "name" => "oci-server-1",
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.2,
                    "memoryUsage" => 0.4,
                ],
            ],
            [
                "name" => "oci-server-2",
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.5,
                    "memoryUsage" => 0.8,
                ],
            ],
            [
                "name" => "aws-server",
                "status" => "stopped",
                "metrics" => [
                    "cpuUsage" => 0.8,
                    "memoryUsage" => 0.9,
                ],
            ],
            [
                "name" => "aws-server-2",
                "status" => "unknown",
            ],
        ];
    }

    public function get(string $name): ?array {
        foreach($this->list() as $app) {
            if($app["name"] === $name) {
                return $app;
            }
        }
        return null;
    }

}