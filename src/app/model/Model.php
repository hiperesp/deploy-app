<?php declare(strict_types=1);

namespace app\model;

abstract class Model {

    public function __construct() {

    }

    public static function instance(): static {
        return new static();
    }
}