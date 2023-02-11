<?php declare(strict_types=1);

namespace hiperesp\framework\system\router\attributes;

#[\Attribute]
class Route {

    const GET        = 0b1;//1
    const POST       = 0b10;//2
    const PUT        = 0b100;//4
    const DELETE     = 0b1000;//8
    const PATCH      = 0b10000;//16
    const OPTIONS    = 0b100000;//32
    const HEAD       = 0b1000000;//64
    
    const ALL = self::GET|self::POST|self::PUT|self::DELETE|self::PATCH|self::OPTIONS|self::HEAD;//127

    public function __construct(
        private int $method = 0,
        private string $pattern = ""
    ) {}

    public function getMethod(): int {
        return $this->method;
    }
    public function getPattern(): string {
        return $this->pattern;
    }

    /** @return array<string> */
    public function getMethodArray(): array {
        $methodList = $this->getMethod();

        $methods = [];
        $multiplier = 0b0;
        while($methodList>0) {
            $method = ($methodList & 0b1) << $multiplier++;
            $methodList = $methodList >> 0b1;
            if(!$method) continue;
            $methods[] = match($method) {
                self::GET => "GET",
                self::POST => "POST",
                self::PUT => "PUT",
                self::DELETE => "DELETE",
                self::PATCH => "PATCH",
                self::OPTIONS => "OPTIONS",
                self::HEAD => "HEAD",
                default => throw new \Exception("Invalid method id: $method")
            };
        }
        return $methods;
    }
}