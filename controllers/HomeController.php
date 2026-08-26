<?php
require_once 'models/ProductModel.php';

class HomeController {
    private $productModel;

    public function __construct() {
        $this->productModel = new ProductModel();
    }

    public function index() {
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        
        $products = $this->productModel->getAll($category, $search);
        
        // Extraer categorías únicas
        $allProducts = $this->productModel->getAll();
        $categories = array_unique(array_column($allProducts, 'category'));

        $view = 'catalog.php';
        require_once 'views/layout.php';
    }
}