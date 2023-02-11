<?php declare(strict_types=1);

return function(string $environment) {
    
    if($environment=="local" or $environment=="local-docker") {
        \ini_set('display_errors', "1");
        \ini_set('display_startup_errors', "1");
    } else {
        \ini_set('display_errors', "Off");
        \ini_set('display_startup_errors', "Off");
    }

    if(@$_SERVER["HTTP_X_FORWARDED_PROTO"]) {
        $_SERVER["REQUEST_SCHEME"] = $_SERVER["HTTP_X_FORWARDED_PROTO"];
    }
    if(@$_SERVER["HTTP_CF_CONNECTING_IP"]) {
        $_SERVER['REMOTE_ADDR'] = $_SERVER["HTTP_CF_CONNECTING_IP"];
    }
    if(!@$_SERVER["SERVER_NAME"]) {
        \header("{$_SERVER["SERVER_PROTOCOL"]} 400 Bad Request ");
        die;
    }

    include_once __DIR__.\DIRECTORY_SEPARATOR."vendor".\DIRECTORY_SEPARATOR."autoload.php";

    \define("CONFIG", (include_once 'config.inc.php')($environment));

    \setlocale(LC_ALL, \CONFIG["locale"]);
    \date_default_timezone_set(\CONFIG["timezone"]);

    include_once "app.php";
};