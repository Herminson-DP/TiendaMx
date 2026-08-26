<?php
require_once 'models/ProductModel.php';

class AdminController {
    private $productModel;

    public function __construct() {
        $this->productModel = new ProductModel();
        
        // Inicializar opciones predeterminadas de la tienda
        if (!isset($_SESSION['config'])) {
            $_SESSION['config'] = [
                'store_name' => 'Mi Tienda Online',
                'tax' => 16,
                'shipping' => 10.00
            ];
        }
    }

    public function index() {
        $products = $this->productModel->getAll();
        $config = $_SESSION['config'];
        $editProduct = null;

        if (isset($_GET['edit'])) {
            $editProduct = $this->productModel->getById((int)$_GET['edit']);
        }

        $view = 'admin.php';
        require_once 'views/layout.php';
    }

    public function saveProduct() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->productModel->save($_POST);
        }
        header('Location: index.php?action=admin');
        exit;
    }

    public function deleteProduct() {
        $id = (int)($_GET['id'] ?? 0);
        if ($id > 0) {
            $this->productModel->delete($id);
        }
        header('Location: index.php?action=admin');
        exit;
    }

    public function saveConfig() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_SESSION['config'] = [
                'store_name' => htmlspecialchars($_POST['store_name']),
                'tax' => (float)$_POST['tax'],
                'shipping' => (float)$_POST['shipping']
            ];
        }
        header('Location: index.php?action=admin');
        exit;
    }
}