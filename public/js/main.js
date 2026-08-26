/**
 * TiendaMx Elite - Modern E-Commerce Client Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // Flash alert auto-dismiss after 5s
  const flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach(msg => {
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(-10px)';
      msg.style.transition = 'all 0.4s ease';
      setTimeout(() => msg.remove(), 400);
    }, 4500);
  });

  // Image Gallery Switcher in Product Detail
  const mainImage = document.getElementById('mainProductImage');
  const thumbs = document.querySelectorAll('.thumb-item');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.getAttribute('data-img');
      if (mainImage && newSrc) {
        mainImage.src = newSrc;
      }
    });
  });

  // Quantity Stepper Controls
  const qtyBtns = document.querySelectorAll('.qty-btn');
  qtyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.qty-input-box') || btn.parentElement.querySelector('input[type="number"]');
      if (!input) return;

      const step = parseInt(btn.getAttribute('data-step') || 1, 10);
      const min = parseInt(input.getAttribute('min') || 1, 10);
      const max = parseInt(input.getAttribute('max') || 99, 10);
      let currentVal = parseInt(input.value || 1, 10);

      currentVal += step;
      if (currentVal < min) currentVal = min;
      if (currentVal > max) currentVal = max;

      input.value = currentVal;

      // If in cart table, auto submit parent form if requested
      const autoForm = btn.closest('form.auto-update-form');
      if (autoForm) {
        autoForm.submit();
      }
    });
  });

  // Admin Dashboard Tabs
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminTabPanes = document.querySelectorAll('.admin-tab-pane');

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminTabBtns.forEach(b => b.classList.remove('active'));
      adminTabPanes.forEach(p => (p.style.display = 'none'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.style.display = 'block';
      }
    });
  });

  // Checkout Payment Method Tabs
  const paymentTabs = document.querySelectorAll('.payment-tab-btn');
  const paymentPanes = document.querySelectorAll('.payment-pane');
  const paymentMethodInput = document.getElementById('selectedPaymentMethod');

  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      paymentTabs.forEach(t => t.classList.remove('active'));
      paymentPanes.forEach(p => (p.style.display = 'none'));

      tab.classList.add('active');
      const method = tab.getAttribute('data-method');
      const targetPane = document.getElementById(`pane-${method}`);
      if (targetPane) {
        targetPane.style.display = 'block';
      }
      if (paymentMethodInput) {
        paymentMethodInput.value = tab.getAttribute('data-label') || method;
      }
    });
  });

  // Virtual Credit Card Formatting & Live Preview in Checkout
  const cardNumInput = document.getElementById('cardNumberInput');
  const cardHolderInput = document.getElementById('cardHolderInput');
  const cardExpInput = document.getElementById('cardExpInput');

  const cardNumPreview = document.getElementById('cardNumPreview');
  const cardHolderPreview = document.getElementById('cardHolderPreview');
  const cardExpPreview = document.getElementById('cardExpPreview');

  if (cardNumInput && cardNumPreview) {
    cardNumInput.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;
      cardNumPreview.textContent = formatted || '•••• •••• •••• ••••';
    });
  }

  if (cardHolderInput && cardHolderPreview) {
    cardHolderInput.addEventListener('input', e => {
      cardHolderPreview.textContent = e.target.value.toUpperCase() || 'NOMBRE DEL TITULAR';
    });
  }

  if (cardExpInput && cardExpPreview) {
    cardExpInput.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
      cardExpPreview.textContent = val || 'MM/AA';
    });
  }

  // Shipping Selection in Checkout
  const shippingOptions = document.querySelectorAll('.shipping-option-card');
  shippingOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      shippingOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        // Optionally reload or recalculate
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('shipping', radio.value);
        window.location.href = currentUrl.toString();
      }
    });
  });

  // Copy Coupon Button helper
  const copyBtns = document.querySelectorAll('.btn-copy-code');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = btn.textContent;
          btn.textContent = '¡Copiado!';
          setTimeout(() => (btn.textContent = originalText), 2000);
        });
      }
    });
  });
});
