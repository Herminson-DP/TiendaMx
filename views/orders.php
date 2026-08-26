<h2>Historial de Compras</h2>

<?php if (empty($orders)): ?>
    <p>No hay órdenes registradas aún.</p>
<?php else: ?>
    <?php foreach ($orders as $order): ?>
        <div class="card-order">
            <div class="flex-between">
                <h4>Orden: <?= $order['id'] ?></h4>
                <span><?= $order['date'] ?></span>
            </div>
            <p><strong>Cliente:</strong> <?= $order['customer']['name'] ?> (<?= $order['customer']['email'] ?>)</p>
            <p><strong>Total:</strong> $<?= number_format($order['total'], 2) ?></p>
            <details>
                <summary>Ver Detalles</summary>
                <ul>
                    <?php foreach ($order['items'] as $item): ?>
                        <li><?= $item['quantity'] ?>x <?= $item['product']['name'] ?> - $<?= number_format($item['total'], 2) ?></li>
                    <?php endforeach; ?>
                </ul>
            </details>
        </div>
    <?php endforeach; ?>
<?php endif; ?>