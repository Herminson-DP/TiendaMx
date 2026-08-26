<h2>Panel de Administración</h2>

<div class="admin-grid">
    <div>
        <h3><?= $editProduct ? 'Editar Producto' : 'Agregar Producto' ?></h3>
        <form action="index.php?action=admin-save-product" method="POST" class="form-box">
            <input type="hidden" name="id" value="<?= $editProduct['id'] ?? '' ?>">
            <div class="form-group">
                <label>Nombre:</label>
                <input type="text" name="name" value="<?= $editProduct['name'] ?? '' ?>" required>
            </div>
            <div class="form-group">
                <label>Categoría:</label>
                <input type="text" name="category" value="<?= $editProduct['category'] ?? '' ?>" required>
            </div>
            <div class="form-group">
                <label>Precio:</label>
                <input type="number" step="0.01" name="price" value="<?= $editProduct['price'] ?? '' ?>" required>
            </div>
            <div class="form-group">
                <label>Descuento (%):</label>
                <input type="number" step="0.01" name="discount" value="<?= $editProduct['discount'] ?? 0 ?>">
            </div>
            <div class="form-group">
                <label>Descripción:</label>
                <textarea name="description" required><?= $editProduct['description'] ?? '' ?></textarea>
            </div>
            <div class="form-group">
                <label>Especificaciones:</label>
                <input type="text" name="specs" value="<?= $editProduct['specs'] ?? '' ?>" required>
            </div>
            <div class="form-group">
                <label>URL Imagen:</label>
                <input type="text" name="image" value="<?= $editProduct['image'] ?? '' ?>">
            </div>
            <button type="submit" class="btn"><?= $editProduct ? 'Actualizar' : 'Guardar' ?></button>
            <?php if ($editProduct): ?>
                <a href="index.php?action=admin" class="btn btn-secondary">Cancelar</a>
            <?php endif; ?>
        </form>

        <h3>Configuración del Sistema</h3>
        <form action="index.php?action=admin-save-config" method="POST" class="form-box">
            <div class="form-group">
                <label>Nombre de la Tienda:</label>
                <input type="text" name="store_name" value="<?= $config['store_name'] ?>" required>
            </div>
            <div class="form-group">
                <label>Impuestos (%):</label>
                <input type="number" step="0.01" name="tax" value="<?= $config['tax'] ?>" required>
            </div>
            <div class="form-group">
                <label>Costo de Envío ($):</label>
                <input type="number" step="0.01" name="shipping" value="<?= $config['shipping'] ?>" required>
            </div>
            <button type="submit" class="btn">Guardar Configuración</button>
        </form>
    </div>

    <div>
        <h3>Lista de Productos</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($products as $p): ?>
                    <tr>
                        <td><?= $p['name'] ?></td>
                        <td><?= $p['category'] ?></td>
                        <td>$<?= number_format($p['price'], 2) ?></td>
                        <td>
                            <a href="index.php?action=admin&edit=<?= $p['id'] ?>" class="btn-sm">Editar</a>
                            <a href="index.php?action=admin-delete-product&id=<?= $p['id'] ?>" class="btn-danger-sm" onclick="return confirm('¿Eliminar producto?')">Eliminar</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>