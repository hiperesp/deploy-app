<?php declare(strict_types=1);

namespace app\util;

use Slim\Views\Twig;
use Twig\Environment;

class TwigUtil {

    public static function configure(Twig $twig): void {
        $twigEnvironment = $twig->getEnvironment();
        self::filters($twigEnvironment);
        self::tests($twigEnvironment);
        self::globals($twigEnvironment);
    }
    private static function filters(Environment $twigEnvironment): void {
        $twigEnvironment->addFilter(new \Twig\TwigFilter('template', function(?string $url): string {
            $basePath = CONFIG["basePath"];
            return "{$basePath}/template{$url}";
        }));
        $twigEnvironment->addFilter(new \Twig\TwigFilter('base', function(?string $url): string {
            return CONFIG["basePath"].$url;
        }));
        $twigEnvironment->addFilter(new \Twig\TwigFilter('array', function(mixed $data): array {
            return (array)$data;
        }));
        $twigEnvironment->addFilter(new \Twig\TwigFilter('preg_replace', function(mixed $data, string $regex, string $value): string {
            return \preg_replace($regex, $value, $data);
        }));
    }
    private static function tests(Environment $twigEnvironment): void {
        $twigEnvironment->addTest(new \Twig\TwigTest('bool', function(mixed $data): bool {
            return \is_bool($data);
        }));
        $twigEnvironment->addTest(new \Twig\TwigTest('null', function(mixed $data): bool {
            return \is_null($data);
        }));
    }
    private static function globals(Environment $twigEnvironment): void {
        try {
            $user = PermissionContext::getInstance()->getPayload();
        } catch(\Exception $e) {
            $user = null;
        }
        $twigEnvironment->addGlobal('_user', $user);
    }
}