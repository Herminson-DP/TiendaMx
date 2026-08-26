<h2>Proceso de Pago</h2>

<div class="checkout-grid">
    <form action="index.php?action=process-checkout" method="POST" class="form-box">
        <h3>Datos del Cliente</h3>
        <div class="form-group">
            <label>Nombre Completo:</label>
            <input type="text" name="name" required>
        </div>
        <div class="form-group">
            <label>Correo Electrónico:</label>
            <input type="email" name="email" required>
        </div>
        <div class="form-group">
            <label>Dirección de Envío:</label>
            <textarea name="address" required></textarea>
        </div>
        <button type="submit" class="btn btn-block">Finalizar Compra</button>
    </form>

    <div class="order-summary">
        <h3>Resumen del Pedido</h3>
        <ul>
            <?php foreach ($details['items'] as $item): ?>
                <li><?= $item['quantity'] ?>x <?= $item['product']['name'] ?> - $<?= number_format($item['total'], 2) ?></li>
            <?php endforeach; ?>
        </ul>
        <hr>
        <p>Total a pagar: <strong>$<?= number_format($details['final_total'], 2) ?></strong></p>
    </div>
</div>