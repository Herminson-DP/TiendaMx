<div class="receipt-box">
    <h2>Recibo de Compra</h2>
    <p><strong>Orden ID:</strong> <?= $order['id'] ?></p>
    <p><strong>Fecha:</strong> <?= $order['date'] ?></p>

    <h3>Datos del Cliente</h3>
    <p><strong>Nombre:</strong> <?= $order['customer']['name'] ?></p>
    <p><strong>Email:</strong> <?= $order['customer']['email'] ?></p>
    <p><strong>Dirección:</strong> <?= $order['customer']['address'] ?></p>

    <h3>Productos</h3>
    <table class="table">
        <thead>
            <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio Unit.</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($order['items'] as $item): ?>
                <tr>
                    <td><?= $item['product']['name'] ?></td>
                    <td><?= $item['quantity'] ?></td>
                    <td>$<?= number_format($item['unit_price'], 2) ?></td>
                    <td>$<?= number_format($item['total'], 2) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <h3>Total Pagado: $<?= number_format($order['total'], 2) ?></h3>
    <a href="index.php" class="btn">Volver al Catálogo</a>
</div>