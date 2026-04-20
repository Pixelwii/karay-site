<?php
/* ═══════════════════════════════════════════════════
   KARAY — Configuration Stripe
   ⚠️ NE JAMAIS COMMITER CE FICHIER AVEC LES VRAIES CLÉS
   ═══════════════════════════════════════════════════ */

// Ta clé privée Stripe (commence par sk_live_ ou sk_test_)
// À configurer dans Hostinger (voir README)
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: 'sk_live_REMPLACE_MOI');

// URL du site (sans slash final)
define('SITE_URL', getenv('SITE_URL') ?: 'https://karay.fr');
