<?php
namespace app\exceptions;

abstract class UserFriendlyException extends \Exception implements \JsonSerializable {
    public function __construct(string $message, int $code = 0, \Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }

    public function jsonSerialize(): mixed {
        return \json_decode($this->message);
    }

    public static function create(string $message, string $type = "danger"): UserFriendlyException {
        $class = static::class;
        return new $class(\json_encode([
            "message" => $message,
            "type" => $type,
        ]));
    }
}