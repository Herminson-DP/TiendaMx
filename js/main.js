/**
 * Interacciones básicas en el cliente.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Confirmación al eliminar items en frontend si aplica
    const deleteButtons = document.querySelectorAll('.btn-danger-sm');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!confirm('¿Estás seguro de que deseas realizar esta acción?')) {
                e.preventDefault();
            }
        });
    });
});