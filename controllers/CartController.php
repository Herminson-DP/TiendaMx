<?php
require_once 'models/CartModel.php';
require_once 'models/ProductModel.php';
require_once 'models/OrderModel.php';

class CartController {
    private $cartModel;
    private $productModel;
    private $orderModel;

    public function __construct() {
        $this->cartModel = new CartModel();
        $this->productModel = new ProductModel();
        $this->orderModel = new OrderModel();
    }

    public function viewCart() {
        $cartItems = $this->cartModel->getItems();
        $details = $this->calculateTotals($cartItems);

        $view = 'cart.php';
        require_once 'views/layout.php';
    }

    public function add() {
        $productId = (int)($_POST['product_id'] ?? 0);
        if ($productId > 0) {
            $this->cartModel->add($productId);
        }
        header('Location: index.php?action=cart');
        exit;
    }

    public function update() {
        $productId = (int)($_POST['product_id'] ?? 0);
        $quantity = (int)($_POST['quantity'] ?? 1);
        if ($productId > 0) {
            $this->cartModel->update($productId, $quantity);
        }
        header('Location: index.php?action=cart');
        exit;
    }

    public function remove() {
        $productId = (int)($_GET['id'] ?? 0);
        if ($productId > 0) {
            $this->cartModel->remove($productId);
        }
        header('Location: index.php?action=cart');
        exit;
    }

    public function checkout() {
        $cartItems = $this->cartModel->getItems();
        if (empty($cartItems)) {
            header('Location: index.php');
            exit;
        }

        $details = $this->calculateTotals($cartItems);
        $view = 'checkout.php';
        require_once 'views/layout.php';
    }

    public function processCheckout() {
        $cartItems = $this->cartModel->getItems();
        if (empty($cartItems)) {
            header('Location: index.php');
            exit;
        }

        $customerData = [
            'name' => $_POST['name'] ?? '',
            'email' => $_POST['email'] ?? '',
            'address' => $_POST['address'] ?? ''
        ];

        $details = $this->calculateTotals($cartItems);
        $order = $this->orderModel->create($customerData, $details['items'], $details['final_total']);
        
        $this->cartModel->clear();

        header('Location: index.php?action=receipt&id=' . $order['id']);
        exit;
    }

    public function receipt() {
        $id = $_GET['id'] ?? '';
        $order = $this->orderModel->getById($id);

        if (!$order) {
            header('Location: index.php');
            exit;
        }

        $view = 'receipt.php';
        require_once 'views/layout.php';
    }

    public function orders() {
        $orders = $this->orderModel->getAll();
        $view = 'orders.php';
        require_once 'views/layout.php';
    }

    private function calculateTotals($cartItems) {
        $items = [];
        $subtotal = 0;
        
        // Opciones del sistema configuradas en la sesión
        $taxRate = $_SESSION['config']['tax'] ?? 16; 
        $shipping = $_SESSION['config']['shipping'] ?? 10.00;

        foreach ($cartItems as $productId => $qty) {
            $product = $this->productModel->getById($productId);
            if ($product) {
                $unitPrice = $product['price'] * (1 - ($product['discount'] / 100));
                $totalItem = $unitPrice * $qty;
                $subtotal += $totalItem;

                $items[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total' => $totalItem
                ];
            }
        }

        $taxAmount = $subtotal * ($taxRate / 100);
        $finalTotal = $subtotal > 0 ? ($subtotal + $taxAmount + $shipping) : 0;

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'tax' => $taxAmount,
            'shipping' => $shipping,
            'final_total' => $finalTotal
        ];
    }
}