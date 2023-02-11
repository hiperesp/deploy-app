<?php declare(strict_types=1);

namespace app\util;

class PermissionContext {

    private static ?PermissionContext $instance = null;

    public static function getInstance(): PermissionContext {
        if(self::$instance===null) {
            self::$instance = new PermissionContext();
            \session_start();
            $jwt = $_SESSION["jwt"]??null;
            \session_write_close();
            self::$instance->setJwt($jwt);
        }
        return self::$instance;
    }

    private ?string $jwt = null;
    public function setJwt(?string $jwt): void {
        \session_start();
        $this->jwt = $jwt;
        $_SESSION["jwt"] = $jwt;
        $_SESSION["lastAccess"] = \time();
        \session_write_close();
    }
    public function needRenew(): bool {
        //renew every 60 seconds
        return \time() > $_SESSION["lastAccess"] + 60;
    }
    public function getJwt(): ?string {
        return $this->jwt;
    }

    public function getPayload(): object {
        $jwt = $this->getJwt();
        if($jwt===null) {
            throw new \Exception("No JWT");
        }
        $parts = \explode(".", $jwt);
        if(\count($parts)!==3) {
            throw new \Exception("Invalid JWT");
        }
        $payload = \json_decode(\base64_decode($parts[1]));
        if($payload===null) {
            throw new \Exception("Invalid JWT");
        }
        return $payload;
    }
}