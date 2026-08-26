<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $_SESSION['config']['store_name'] ?? 'Tienda Online' ?></title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="navbar">
        <div class="container flex-between">
            <a href="index.php" class="brand"><?= $_SESSION['config']['store_name'] ?? 'Tienda Online' ?></a>
            <nav>
                <a href="index.php">Catálogo</a>
                <a href="index.php?action=cart">
                    Carrito (<?= array_sum($_SESSION['cart'] ?? []) ?>)
                </a>
                <a href="index.php?action=orders">Historial</a>
                <a href="index.php?action=admin" class="btn-admin">Admin</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <?php include $view; ?>
    </main>

    <footer>
        <div class="container text-center">
            <p>&copy; <?= date('Y') ?> <?= $_SESSION['config']['store_name'] ?? 'Tienda Online' ?> - MVC Sin Base de Datos</p>
        </div>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>