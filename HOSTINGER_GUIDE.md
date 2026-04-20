# Guide de déploiement sur Hostinger

## Structure à uploader

Uploade **tout** le contenu du dossier `karay-site` dans le dossier `public_html` de Hostinger via :
- **hPanel → File Manager**
- OU FTP (FileZilla, etc.)

```
public_html/
├── index.html
├── panier.html
├── tarifs.html
├── documents.html
├── audit.html
├── cgv.html
├── mentions-legales.html
├── politique-confidentialite.html
├── style.css
├── cart.js
└── api/
    ├── create-checkout.php   ← Fonction PHP Stripe
    ├── config.php            ← ⚠️ À éditer avec ta clé (voir plus bas)
    └── .htaccess             ← Protège config.php
```

**Ne PAS uploader :**
- `netlify/` (pas utilisé avec Hostinger)
- `netlify.toml`
- `package.json`
- `node_modules/`
- `.env`
- `.git/`

---

## Configuration de la clé Stripe

### Option A (simple) : Modifier directement config.php

Dans `api/config.php`, remplace :
```php
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: 'sk_live_REMPLACE_MOI');
```

Par ta vraie clé :
```php
define('STRIPE_SECRET_KEY', 'sk_live_tavraicle...');
```

Remplace aussi `SITE_URL` par ton domaine :
```php
define('SITE_URL', 'https://karay.fr');
```

⚠️ **Important** : `config.php` est protégé par `.htaccess` — il n'est pas accessible via URL publique, seulement par le code PHP.

### Option B (mieux) : Variables d'environnement Hostinger

Si tu utilises Hostinger Business ou plus :
- hPanel → Avancé → Configuration PHP → Variables d'environnement
- Ajouter `STRIPE_SECRET_KEY` et `SITE_URL`
- Laisser `config.php` tel quel (il lit `getenv()`)

---

## Test

1. Ajoute un service au panier (ex: "Accompagnement IA 499€")
2. Va au panier → remplis le formulaire → Confirmer
3. Tu dois être redirigé vers Stripe Checkout
4. Teste avec carte test `4242 4242 4242 4242`

---

## Dépannage

**Erreur 500 ou "Erreur paiement"** → Vérifie les logs PHP :
- hPanel → Avancé → Logs d'erreur PHP

**Stripe renvoie une erreur de clé invalide** → Vérifie que `STRIPE_SECRET_KEY` est bien `sk_live_...` (production) ou `sk_test_...` (test)

**La fonction PHP ne répond pas** → Vérifie que `curl` est activé :
- hPanel → Avancé → Configuration PHP → Extensions → `curl` ✓
