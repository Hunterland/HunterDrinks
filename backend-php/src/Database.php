<!-- Classe POO -->
<?php
class Database
{
    private $pdo;

    public function __construct()
    {
        $host = 'localhost';
        $db = 'hunterdrinks';
        $user = 'root';
        $pass = '';

        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

        $this->pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    public function getConnection()
    {
        return $this->pdo;
    }
}
