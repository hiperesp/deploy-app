<?php declare(strict_types=1);

namespace app\model;

class Servers extends Model {

    public function __construct() {
        parent::__construct();
    }

    public function list(): array {
        return [
            [
                "id" => 1,
                "name" => "OCI Server 1",
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.2,
                    "memoryUsage" => 0.4,
                ],
            ],
            [
                "id" => 2,
                "name" => "OCI Server 2",
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.4,
                    "memoryUsage" => 0.3,
                ],
            ],
            [
                "id" => 3,
                "name" => "AWS Server",
                "status" => "running",
                "metrics" => [
                    "cpuUsage" => 0.6,
                    "memoryUsage" => 0.7,
                ],
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

    public static function instance(): Apps {
        return new Apps();
    }

}