<?php
/* ═══════════════════════════════════════════════════
   KARAY — Configuration Stripe (EXEMPLE)
   ───────────────────────────────────────────────────
   Ce fichier sert de modèle et EST versionné sur GitHub.
   Le vrai fichier s'appelle api/config.php, il est
   ignoré par git (.gitignore) et contient les vraies clés.

   POUR METTRE EN PLACE :
   1. Copier ce fichier → api/config.php
   2. Remplacer le placeholder par ta vraie clé Stripe
   3. En production (Hostinger) : définir STRIPE_SECRET_KEY
      en variable d'environnement au lieu d'éditer le fichier.
   ═══════════════════════════════════════════════════ */

// Clé privée Stripe (commence par sk_live_ ou sk_test_)
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: 'sk_live_REMPLACE_MOI');

// URL du site (sans slash final)
define('SITE_URL', getenv('SITE_URL') ?: 'https://karay.fr');
