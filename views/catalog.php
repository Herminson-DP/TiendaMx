<div class="catalog-header">
    <h2>Catálogo de Productos</h2>
    <form action="index.php" method="GET" class="search-form flex-gap">
        <input type="text" name="search" placeholder="Buscar por nombre o especificaciones..." value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">
        <select name="category">
            <option value="">Todas las categorías</option>
            <?php foreach ($categories as $cat): ?>
                <option value="<?= $cat ?>" <?= (isset($_GET['category']) && $_GET['category'] === $cat) ? 'selected' : '' ?>>
                    <?= $cat ?>
                </option>
            <?php endforeach; ?>
        </select>
        <button type="submit" class="btn">Filtrar</button>
        <a href="index.php" class="btn btn-secondary">Limpiar</a>
    </form>
</div>

<div class="grid-products">
    <?php if (empty($products)): ?>
        <p>No se encontraron productos.</p>
    <?php else: ?>
        <?php foreach ($products as $p): ?>
            <div class="card-product">
                <img src="<?= $p['image'] ?>" alt="<?= $p['name'] ?>">
                <h3><?= $p['name'] ?></h3>
                <span class="badge"><?= $p['category'] ?></span>
                <p class="description"><?= $p['description'] ?></p>
                <p class="specs"><strong>Esp:</strong> <?= $p['specs'] ?></p>
                <div class="price-box">
                    <?php if ($p['discount'] > 0): ?>
                        <span class="price-original">$<?= number_format($p['price'], 2) ?></span>
                        <span class="price-final">$<?= number_format($p['price'] * (1 - $p['discount']/100), 2) ?></span>
                        <span class="discount">-<?= $p['discount'] ?>%</span>
                    <?php else: ?>
                        <span class="price-final">$<?= number_format($p['price'], 2) ?></span>
                    <?php endif; ?>
                </div>
                <form action="index.php?action=add-to-cart" method="POST">
                    <input type="hidden" name="product_id" value="<?= $p['id'] ?>">
                    <button type="submit" class="btn btn-block">Agregar al Carrito</button>
                </form>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>