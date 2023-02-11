<?php declare(strict_types=1);

namespace app\controller;

use hiperesp\framework\system\router\attributes\Middleware;
use hiperesp\framework\system\router\attributes\Route;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

#[Route(pattern: "/apps")]
class AppController extends Controller {
    
    #[Middleware]
    public function middleware(Request $request, RequestHandler $handler): Response {
        $response = $handler->handle($request);
        return $response;
    }

    #[Route(method: Route::GET, pattern: "/")]
    public function list(Request $request, Response $response): Response {
        
        return $this->view($request)->render($response, 'pages/app/list.twig', [
            "apps" => [
                [
                    "name" => "upload-pages-artifact",
                    "description" => "Uma ação composite para empacotar e enviar um artefato que pode ser implantado no Github Pages.",
                    "status" => "running",
                ],
                [
                    "name" => "appops",
                    "description" => "Uma ferramenta para gerenciar a implantação de aplicações web e gerenciar servidores Dokku.",
                    "status" => "running",
                ],
                [
                    "name" => "upload-pages-artifact",
                    "description" => "Uma ação composite para empacotar e enviar um artefato que pode ser implantado no Github Pages.",
                    "status" => "stopped",
                ],
            ]
        ]);
    }

    #[Route(method: Route::GET, pattern: "/new")]
    public function create(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/app/new.twig', [
        ]);
    }

    #[Route(method: Route::GET, pattern: "/update")]
    public function update(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/app/info.twig', [
        ]);
    }

    #[Route(method: Route::GET, pattern: "/{app-name}")]
    public function read(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/app/info.twig', [
        ]);
    }

    #[Route(method: Route::GET, pattern: "/actions/{action}")]
    public function action(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/login.twig', [
        ]);
    }


}