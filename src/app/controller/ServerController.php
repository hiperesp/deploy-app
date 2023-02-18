<?php declare(strict_types=1);

namespace app\controller;

use app\model\Apps;
use app\model\Servers;
use app\util\DokkuServer;
use hiperesp\framework\system\router\attributes\Middleware;
use hiperesp\framework\system\router\attributes\Route;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

#[Route(pattern: "/servers")]
class ServerController extends Controller {

    #[Middleware]
    public function middleware(Request $request, RequestHandler $handler): Response {
        $response = $handler->handle($request);
        return $response;
    }

    #[Route(method: Route::GET, pattern: "/")]
    public function list(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/server/list.twig', [
            "servers" => Servers::instance()->list(),
        ]);
    }
    #[Route(method: Route::GET, pattern: "/test/")]
    public function test(Request $request, Response $response): Response {
        \ob_start();
        $dokkuServer = DokkuServer::fromServer("oci-server-1");
        $dokkuServer->connect();
        $response->getBody()->write(\ob_get_clean());
        return $response;
    }

    #[Route(method: Route::GET, pattern: "/{server-name}/apps/")]
    public function apps(Request $request, Response $response): Response {
        return $this->view($request)->render($response, 'pages/app/list.twig', [
            "server" => Servers::instance()->get($request->getAttribute("server-name")),
            "apps" => Apps::instance()->listFromServer($request->getAttribute("server-name")),
        ]);
    }


}