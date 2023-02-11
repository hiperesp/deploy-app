<?php declare(strict_types=1);

return function(string $mode) {

    $config = match($mode) {
        "production" => [
            'basePath'  => "",
            'slim'      => [ 'errors' => [ 'display' => false ] ],
        ],
        "local-docker" => [
            'basePath'  => "",
            'slim'      => [ 'errors' => [ 'display' => true ] ],
        ],
    };

    $config+= [
        'timezone'  => "America/Sao_Paulo",
        'locale'    => "pt_BR",
    ];

    return $config;
};