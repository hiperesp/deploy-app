<?php declare(strict_types=1);

namespace hiperesp\framework\system\router;

use hiperesp\framework\system\router\attributes\Middleware;
use hiperesp\framework\system\router\attributes\Route;

class AutoRouter {
    public function __construct(
        private \Slim\Routing\RouteCollectorProxy $app
    ) {}

    public function registerController(string $className) {
        $class = new \ReflectionClass($className);
        $attributes = $class->getAttributes(Route::class, \ReflectionAttribute::IS_INSTANCEOF);
        foreach($attributes as $attribute) {
            /** @var Route $route */
            $route = $attribute->newInstance();
            if($route->getMethod()!=0) throw new \Exception("Class route must not have method");

            $group = $this->app->group(
                pattern: $route->getPattern(), 
                callable: function(\Slim\Routing\RouteCollectorProxy $app) use ($class): void {
                    $autoRouter = new AutoRouter(app: $app);
                    if(\method_exists($class->getName(), 'children')) {
                        foreach($class->getName()::children() as $child) {
                            $autoRouter->registerController($child);
                        }
                    }
                    $methods = $class->getMethods();
                    foreach($methods as $method) {
                        $attributes = $method->getAttributes(Route::class, \ReflectionAttribute::IS_INSTANCEOF);
                        foreach($attributes as $attribute) {
                            /** @var Route $route */
                            $route = $attribute->newInstance();
                            if($route->getMethod()==0) throw new \Exception("Method route must have method");
                            $app->map(
                                methods: $route->getMethodArray(),
                                pattern: $route->getPattern(),
                                callable: "{$class->getName()}:{$method->getName()}"
                            );
                        }
                    }
                }
            );

            $methods = $class->getMethods();
            foreach($methods as $method) {
                $attributes = $method->getAttributes(Middleware::class, \ReflectionAttribute::IS_INSTANCEOF);
                foreach($attributes as $attribute) {
                    $group->add("{$class->getName()}:{$method->getName()}");
                }
            }
        }
    }

}