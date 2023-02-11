<?php declare(strict_types=1);

namespace app\controller;

use app\model\Apps;
use app\model\Servers;
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
            "apps" => Apps::instance()->list(),
        ]);
    }

    #[Route(method: Route::GET, pattern: "/new")]
    public function create(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/app/new.twig', [
            "servers" => Servers::instance()->list(),
        ]);
    }

    #[Route(method: Route::GET, pattern: "/{app-name}")]
    public function read(Request $request, Response $response): Response {
        $app = Apps::instance()->get($request->getAttribute("app-name"));
        if(!$app) {
            return $this->view($request)->render($response, 'pages/app/not-found.twig', [
                "requestedApp" => $request->getAttribute("app-name"),
            ]);
        }
        return $this->view($request)->render($response, 'pages/app/info.twig', [
            "app" => $app,
        ]);
    }

    #[Route(method: Route::GET, pattern: "/{app-name}/update")]
    public function update(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/app/info.twig', [
        ]);
    }

    #[Route(method: Route::GET, pattern: "/{app-name}/actions/{action}")]
    public function action(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/login.twig', [
        ]);
    }


}