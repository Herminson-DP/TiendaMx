<?php
/**
 * Punto de entrada principal (Front Controller).
 * Inicializa la sesión y maneja el enrutamiento simple del patrón MVC.
 */
session_start();

// Manejo básico de errores para entorno de desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cargar controladores necesarios
require_once 'controllers/HomeController.php';
require_once 'controllers/CartController.php';
require_once 'controllers/AdminController.php';

// Enrutador básico por parámetro GET 'action'
$action = $_GET['action'] ?? 'home';

try {
    switch ($action) {
        case 'home':
            $controller = new HomeController();
            $controller->index();
            break;

        case 'cart':
            $controller = new CartController();
            $controller->viewCart();
            break;

        case 'add-to-cart':
            $controller = new CartController();
            $controller->add();
            break;

        case 'update-cart':
            $controller = new CartController();
            $controller->update();
            break;

        case 'remove-from-cart':
            $controller = new CartController();
            $controller->remove();
            break;

        case 'checkout':
            $controller = new CartController();
            $controller->checkout();
            break;

        case 'process-checkout':
            $controller = new CartController();
            $controller->processCheckout();
            break;

        case 'receipt':
            $controller = new CartController();
            $controller->receipt();
            break;

        case 'orders':
            $controller = new CartController();
            $controller->orders();
            break;

        case 'admin':
            $controller = new AdminController();
            $controller->index();
            break;

        case 'admin-save-product':
            $controller = new AdminController();
            $controller->saveProduct();
            break;

        case 'admin-delete-product':
            $controller = new AdminController();
            $controller->deleteProduct();
            break;

        case 'admin-save-config':
            $controller = new AdminController();
            $controller->saveConfig();
            break;

        default:
            http_response_code(404);
            echo "<h1>404 - Página no encontrada</h1>";
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo "<h1>Error del servidor:</h1> <p>" . htmlspecialchars($e->getMessage()) . "</p>";
}