<?php
/**
 * Modelo para la gestión del carrito de compras.
 */
class CartModel {
    public function __construct() {
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
    }

    public function add($productId, $quantity = 1) {
        if (isset($_SESSION['cart'][$productId])) {
            $_SESSION['cart'][$productId] += $quantity;
        } else {
            $_SESSION['cart'][$productId] = $quantity;
        }
    }

    public function update($productId, $quantity) {
        if ($quantity <= 0) {
            $this->remove($productId);
        } else {
            $_SESSION['cart'][$productId] = (int)$quantity;
        }
    }

    public function remove($productId) {
        unset($_SESSION['cart'][$productId]);
    }

    public function getItems() {
        return $_SESSION['cart'];
    }

    public function clear() {
        $_SESSION['cart'] = [];
    }
}