<?php declare(strict_types=1);

namespace app\model;

class Apps extends Model {

    public function __construct() {
        parent::__construct();
    }

    public function list(): array {
        return [
            [
                "name" => "upload-pages-artifact",
                "description" => "Uma ação composite para empacotar e enviar um artefato que pode ser implantado no Github Pages.",
                "status" => "running",
                "publicUrl" => "https://upload-pages-artifact.appops.dev",
                "git" => [
                    "repository" => "https://github.com/hiperesp/appops",
                    "latestRelease" => [
                        "url" => "https://github.com/hiperesp/appops/releases/tag/2.5.3",
                        "tagName" => "2.5.3",
                        "date" => "2023-02-06T02:01:00Z",
                    ],
                ],
            ],
            [
                "name" => "appops",
                "description" => "Uma ferramenta para gerenciar a implantação de aplicações web e gerenciar servidores Dokku.",
                "status" => "running",
                "publicUrl" => "https://upload-pages-artifact.appops.dev",
                "git" => [
                    "repository" => "https://github.com/hiperesp/appops",
                    "latestRelease" => [
                        "url" => "https://github.com/hiperesp/appops/releases/tag/0.0.1",
                        "tagName" => "0.0.1",
                        "date" => "2023-02-11T12:24:00Z",
                    ],
                ],
            ],
            [
                "name" => "upload-pages-artifact-2",
                "description" => "Uma ação composite para empacotar e enviar um artefato que pode ser implantado no Github Pages.",
                "status" => "stopped",
                "publicUrl" => "https://upload-pages-artifact.appops.dev",
                "git" => [
                    "repository" => "https://github.com/hiperesp/appops",
                    "latestRelease" => [
                        "url" => "https://github.com/hiperesp/appops/releases/tag/2.5.3",
                        "tagName" => "2.5.3",
                        "date" => "2023-02-09T02:01:00Z",
                    ],
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