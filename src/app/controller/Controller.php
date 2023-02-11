<?php declare(strict_types=1);

namespace app\controller;

use Slim\Psr7\Request;
use Slim\Views\Twig;

abstract class Controller {
    public function view(Request $request): Twig {
        $twig = Twig::fromRequest($request);
        $twig->getEnvironment()->addGlobal('_GET', $request->getQueryParams());
        return $twig;
    }
}