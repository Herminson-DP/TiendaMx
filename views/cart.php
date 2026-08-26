<h2>Carrito de Compras</h2>

<?php if (empty($details['items'])): ?>
    <p>El carrito está vacío. <a href="index.php">Volver al catálogo</a>.</p>
<?php else: ?>
    <table class="table">
        <thead>
            <tr>
                <th>Producto</th>
                <th>Precio Unit.</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($details['items'] as $item): ?>
                <tr>
                    <td><?= $item['product']['name'] ?></td>
                    <td>$<?= number_format($item['unit_price'], 2) ?></td>
                    <td>
                        <form action="index.php?action=update-cart" method="POST" class="inline-form">
                            <input type="hidden" name="product_id" value="<?= $item['product']['id'] ?>">
                            <input type="number" name="quantity" value="<?= $item['quantity'] ?>" min="1" class="qty-input">
                            <button type="submit" class="btn-sm">Actualizar</button>
                        </form>
                    </td>
                    <td>$<?= number_format($item['total'], 2) ?></td>
                    <td>
                        <a href="index.php?action=remove-from-cart&id=<?= $item['product']['id'] ?>" class="btn-danger-sm">Eliminar</a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="summary-box">
        <p><strong>Subtotal:</strong> $<?= number_format($details['subtotal'], 2) ?></p>
        <p><strong>Impuestos (<?= $_SESSION['config']['tax'] ?? 16 ?>%):</strong> $<?= number_format($details['tax'], 2) ?></p>
        <p><strong>Envío:</strong> $<?= number_format($details['shipping'], 2) ?></p>
        <h3><strong>Total:</strong> $<?= number_format($details['final_total'], 2) ?></h3>
        <a href="index.php?action=checkout" class="btn btn-block">Proceder al Pago</a>
    </div>
<?php endif; ?>