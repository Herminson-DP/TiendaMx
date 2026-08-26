<?php
/**
 * Modelo para la gestión de productos y datos del catálogo.
 * Persiste cambios durante la sesión activa si se modifican en el panel de administración.
 */
class ProductModel {
    public function __construct() {
        if (!isset($_SESSION['products'])) {
            $_SESSION['products'] = [
                1 => [
                    'id' => 1,
                    'name' => 'Laptop Pro 15',
                    'category' => 'Electrónica',
                    'price' => 1200.00,
                    'discount' => 10, // Porcentaje de descuento
                    'description' => 'Computadora portátil de alto rendimiento.',
                    'specs' => '16GB RAM, 512GB SSD, Intel i7',
                    'image' => 'https://via.placeholder.com/300x200?text=Laptop+Pro'
                ],
                2 => [
                    'id' => 2,
                    'name' => 'Smartphone X',
                    'category' => 'Electrónica',
                    'price' => 800.00,
                    'discount' => 0,
                    'description' => 'Teléfono inteligente de última generación.',
                    'specs' => '6.1" Display, 128GB, Cámara 48MP',
                    'image' => 'https://via.placeholder.com/300x200?text=Smartphone+X'
                ],
                3 => [
                    'id' => 3,
                    'name' => 'Silla Ergonómica',
                    'category' => 'Hogar',
                    'price' => 250.00,
                    'discount' => 15,
                    'description' => 'Silla de oficina ajustable y cómoda.',
                    'specs' => 'Soporte lumbar, Malla transpirable',
                    'image' => 'https://via.placeholder.com/300x200?text=Silla+Ergonomica'
                ]
            ];
        }
    }

    public function getAll($category = null, $search = null) {
        $products = $_SESSION['products'];
        
        // Filtrar por categoría
        if ($category) {
            $products = array_filter($products, function($p) use ($category) {
                return strtolower($p['category']) === strtolower($category);
            });
        }

        // Filtrar por búsqueda en nombre o características
        if ($search) {
            $products = array_filter($products, function($p) use ($search) {
                $term = strtolower($search);
                return strpos(strtolower($p['name']), $term) !== false || 
                       strpos(strtolower($p['specs']), $term) !== false;
            });
        }

        return $products;
    }

    public function getById($id) {
        return $_SESSION['products'][$id] ?? null;
    }

    public function save($data) {
        $id = isset($data['id']) && $data['id'] ? (int)$data['id'] : (empty($_SESSION['products']) ? 1 : max(array_keys($_SESSION['products'])) + 1);
        
        $_SESSION['products'][$id] = [
            'id' => $id,
            'name' => htmlspecialchars($data['name']),
            'category' => htmlspecialchars($data['category']),
            'price' => (float)$data['price'],
            'discount' => (float)$data['discount'],
            'description' => htmlspecialchars($data['description']),
            'specs' => htmlspecialchars($data['specs']),
            'image' => htmlspecialchars($data['image']) ?: 'https://via.placeholder.com/300x200?text=Producto'
        ];
    }

    public function delete($id) {
        if (isset($_SESSION['products'][$id])) {
            unset($_SESSION['products'][$id]);
        }
    }
}