<?php
/**
 * Modelo para la gestión de órdenes de compra e historial.
 */
class OrderModel {
    public function __construct() {
        if (!isset($_SESSION['orders'])) {
            $_SESSION['orders'] = [];
        }
    }

    public function create($customerData, $items, $total) {
        $orderId = 'ORD-' . strtoupper(uniqid());
        $order = [
            'id' => $orderId,
            'date' => date('Y-m-d H:i:s'),
            'customer' => [
                'name' => htmlspecialchars($customerData['name']),
                'email' => htmlspecialchars($customerData['email']),
                'address' => htmlspecialchars($customerData['address'])
            ],
            'items' => $items,
            'total' => $total
        ];

        $_SESSION['orders'][$orderId] = $order;
        return $order;
    }

    public function getAll() {
        return $_SESSION['orders'];
    }

    public function getById($id) {
        return $_SESSION['orders'][$id] ?? null;
    }
}