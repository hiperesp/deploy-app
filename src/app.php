<?php declare(strict_types=1);

use app\util\TwigUtil;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;

$app = \Slim\Factory\AppFactory::create();
$app->setBasePath(CONFIG["basePath"]);
$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();

$twig = Twig::create(__DIR__.'/template');
TwigUtil::configure($twig);
$app->add(TwigMiddleware::create($app, $twig));

$errorMiddleware = $app->addErrorMiddleware(CONFIG["slim"]["errors"]["display"], true, true);
$defaultErrorHandler = $errorMiddleware->getDefaultErrorHandler();
$errorMiddleware->setDefaultErrorHandler(function(\Psr\Http\Message\ServerRequestInterface $request, \Throwable $exception, bool $displayErrorDetails, bool $logErrors, bool $logErrorDetails, ?\Psr\Log\LoggerInterface $logger = null) use ($app, $defaultErrorHandler) {
    if($exception instanceof \ValueError) {
        $response = $app->getResponseFactory()->createResponse(422);
        $response->getBody()->write(\json_encode([
            "_type" => "userError",
            "_error" => $exception->getMessage(),
        ]));
    
        return $response;
    }
    return $defaultErrorHandler($request, $exception, $displayErrorDetails, $logErrors, $logErrorDetails, $logger);
});

$autoRouter = new \hiperesp\framework\system\router\AutoRouter($app);
$autoRouter->registerController(\app\controller\IndexController::class);

$app->run();
