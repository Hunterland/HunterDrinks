<!-- Crud de favoritos -->

<?php
class DrinkRepository
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // Lista favoritos
    public function listFavorites($page = 1, $limit = 10)
    {
        // Simplificado: sem paginação por enquanto
        $stmt = $this->db->query("SELECT * FROM favorites ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }


    // Adiciona favorito
    public function addFavorite($data)
    {
        error_log("Repo - Data recebida: " . print_r($data, true));

        if (empty($data['drink_id']) || empty($data['name'])) {
            error_log("Repo - Validação empty falhou");
            throw new InvalidArgumentException('drink_id e name obrigatórios');
        }

        error_log("Repo - Verificando duplicata para drink_id: " . $data['drink_id']);
        $check = $this->db->prepare("SELECT id FROM favorites WHERE drink_id = ?");
        $check->execute([$data['drink_id']]);
        if ($check->fetch()) {
            error_log("Repo - DUPLICATA encontrada!");
            throw new InvalidArgumentException('Drink já está nos favoritos');
        }

        error_log("Repo - Inserindo...");
        $stmt = $this->db->prepare("INSERT INTO favorites (drink_id, name, thumb, instructions) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['drink_id'],
            substr($data['name'], 0, 255),
            $data['thumb'] ?? null,
            $data['instructions'] ?? null
        ]);
        $insertId = $this->db->lastInsertId();
        error_log("Repo - INSERT OK: ID $insertId");
        return $insertId;
    }



    // Deleta favorito
    public function deleteFavorite($id)
    {
        $stmt = $this->db->prepare("DELETE FROM favorites WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount();
    }

    public function getFavorite($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM favorites WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function updateFavorite($id, $data)
    {
        $stmt = $this->db->prepare("UPDATE favorites SET name = ?, thumb = ?, instructions = ? WHERE id = ?");
        $stmt->execute([
            $data['name'] ?? null,
            $data['thumb'] ?? null,
            $data['instructions'] ?? null,
            $id
        ]);
        return $stmt->rowCount() > 0;
    }

}


