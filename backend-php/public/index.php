<!-- Front controller da API -->

<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// API Key (comente para testes)
# $apiKey = $_SERVER['HTTP_X_API_KEY'] ?? $_GET['key'] ?? '';
# if ($apiKey !== 'hunterdrinks2026') {
#     http_response_code(401);
#     echo json_encode(['error' => 'API Key inválida']);
#     exit;
# }

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/DrinkRepository.php';

$db = (new Database())->getConnection();
$repo = new DrinkRepository($db);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = array_values(array_filter(explode('/', trim($path, '/'))));

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

if ($resource !== 'favorites') {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint não encontrado']);
    exit;
}

switch ($method) {
    case 'GET':
        if ($id) {
            // GET único
            $data = $repo->getFavorite($id);
            if (!$data) {
                http_response_code(404);
                echo json_encode(['error' => 'Favorito não encontrado']);
            } else {
                echo json_encode($data);
            }
        } else {
            // GET todos com paginação
            $page = max(1, (int) ($_GET['page'] ?? 1));
            $limit = min(50, max(1, (int) ($_GET['limit'] ?? 10)));
            $data = $repo->listFavorites($page, $limit);  // Adicione paginação na repo depois
            echo json_encode($data);
        }
        break;

    case 'POST':
        $rawInput = file_get_contents('php://input');
        error_log("Raw body: " . $rawInput);

        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido: ' . json_last_error_msg()]);
            break;
        }

        error_log("Parsed input: " . print_r($input, true));

        if (!isset($input['drink_id'], $input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltam drink_id ou name', 'received' => $input]);
            break;
        }

        try {
            error_log("Iniciando addFavorite...");
            $newId = $repo->addFavorite($input);
            error_log("addFavorite OK: ID $newId");
            http_response_code(201);
            echo json_encode(['id' => $newId, 'message' => 'Favorito criado']);
        } catch (InvalidArgumentException $e) {
            error_log("InvalidArgument: " . $e->getMessage());
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (Exception $e) {
            error_log("Exception geral: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID é obrigatório para UPDATE']);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $updated = $repo->updateFavorite($id, $input);
        if ($updated) {
            echo json_encode(['message' => 'Favorito atualizado']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Não encontrado']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID é obrigatório para DELETE']);
            break;
        }
        $deleted = $repo->deleteFavorite($id);
        if ($deleted) {
            echo json_encode(['message' => 'Favorito deletado']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Não encontrado']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>