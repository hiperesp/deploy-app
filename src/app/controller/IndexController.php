<?php declare(strict_types=1);

namespace app\controller;

use hiperesp\framework\system\router\attributes\Middleware;
use hiperesp\framework\system\router\attributes\Route;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

#[Route(pattern: "")]
class IndexController extends Controller {
    
    public static function children(): array {
        return [
            AuthController::class,
        ];
    }

    #[Middleware]
    public function middleware(Request $request, RequestHandler $handler): Response {
        $response = $handler->handle($request);
        return $response;
    }


}