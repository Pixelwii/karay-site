/* ═══════════════════════════════════════════════════
   KARAY — Logique panier (localStorage)
   Inclus dans : tarifs.html + panier.html + toutes les pages avec nav
   ═══════════════════════════════════════════════════ */

(function () {
  var CART_KEY = 'karay_cart';

  /* ── Lire / écrire ── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    refreshBadges();
  }

  /* ── Mise à jour des badges nav ── */
  function refreshBadges() {
    var count = getCart().length;
    document.querySelectorAll('.cart-badge').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ── Synchroniser l'état des boutons (page tarifs) ── */
  function syncButtons() {
    var cart = getCart();
    cart.forEach(function (item) {
      document.querySelectorAll('[data-cart-id="' + item.id + '"]').forEach(function (btn) {
        markAdded(btn);
      });
    });
  }

  function markAdded(btn) {
    btn.textContent = '✓ Ajouté';
    btn.classList.add('added');
    btn.disabled = true;
  }

  /* ── API publique ── */

  /**
   * Appelé via onclick="addToCart(this)" sur chaque bouton de service.
   * Lit les data-cart-* du bouton pour construire l'objet item.
   */
  window.addToCart = function (btn) {
    var id = btn.dataset.cartId;
    var cart = getCart();

    if (cart.find(function (i) { return i.id === id; })) {
      // Déjà dans le panier — juste mettre à jour l'affichage bouton
      markAdded(btn);
      return;
    }

    var item = {
      id: id,
      name: btn.dataset.cartName,
      price: btn.dataset.cartPrice ? parseInt(btn.dataset.cartPrice, 10) : null,
      priceDisplay: btn.dataset.cartPriceDisplay,
      period: btn.dataset.cartPeriod,
      type: btn.dataset.cartType,        // 'fixed' | 'subscription' | 'custom'
      stripe: btn.dataset.cartStripe || null
    };

    cart.push(item);
    saveCart(cart);
    markAdded(btn);

    // Flash de confirmation
    showToast(item.name);
  };

  window.removeFromCart = function (id) {
    var cart = getCart().filter(function (i) { return i.id !== id; });
    saveCart(cart);
  };

  window.getCartData = getCart;

  /* Exposé pour tarifs.html : re-synchronise les boutons après changement de tab */
  window.syncCartButtons = function () { syncButtons(); };

  /**
   * Crée une session Stripe via la fonction serverless Netlify.
   * Appelée après validation du formulaire Formspree dans panier.html
   */
  window.createStripeCheckout = function (email, callback) {
    var cart = getCart();
    var payableItems = cart.filter(function (item) {
      return item.type === 'fixed' || item.type === 'subscription';
    });

    if (payableItems.length === 0) {
      console.log('Pas de services payants dans le panier');
      if (callback) callback(null);
      return;
    }

    // Préparer les données pour la fonction serverless
    var checkoutData = {
      items: payableItems.map(function (item) {
        return {
          name: item.name,
          price: item.price,
          period: item.period
        };
      }),
      email: email
    };

    // Appeler la fonction serverless
    fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    })
    .then(function (r) {
      if (!r.ok) throw new Error('Erreur ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (data.checkoutUrl) {
        // Vider le panier avant redirection
        localStorage.removeItem(CART_KEY);
        // Rediriger vers Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    })
    .catch(function (err) {
      console.error('Erreur création checkout:', err);
      if (callback) callback(err);
    });
  };

  /* ── Toast de confirmation ── */
  function showToast(name) {
    var existing = document.getElementById('cart-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.innerHTML = '<span>✓</span> <strong>' + name + '</strong> ajouté au panier';
    toast.style.cssText = [
      'position:fixed', 'bottom:1.5rem', 'right:1.5rem', 'z-index:9000',
      'background:var(--charcoal)', 'color:white',
      'padding:.75rem 1.2rem', 'border-radius:50px',
      'font-family:"DM Sans",sans-serif', 'font-size:.85rem',
      'display:flex', 'align-items:center', 'gap:.5rem',
      'box-shadow:0 8px 30px rgba(0,0,0,.2)',
      'transform:translateY(20px)', 'opacity:0',
      'transition:all .3s ease'
    ].join(';');

    var link = document.createElement('a');
    link.href = 'panier.html';
    link.textContent = 'Voir →';
    link.style.cssText = 'color:var(--terracotta-light);margin-left:.4rem;font-weight:500;text-decoration:none;';
    toast.appendChild(link);

    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      });
    });

    setTimeout(function () {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 350);
    }, 3500);
  }

  /* ── Init au chargement ── */
  document.addEventListener('DOMContentLoaded', function () {
    refreshBadges();
    syncButtons();
  });
})();
