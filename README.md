# Karay — Site e-commerce IA

Site vitrine avec panier et paiement Stripe dynamique.

## Installation (Local)

```bash
# Cloner le repo
git clone https://github.com/Pixelwii/karay-site.git
cd karay-site

# Copier les fichiers HTML/CSS/JS depuis "site finale" vers ce dossier
# (Voir instructions ci-dessous)

# Installation des dépendances Node (pour Netlify Functions)
npm install
```

## Structure

```
karay-site/
├── index.html
├── panier.html
├── tarifs.html
├── style.css
├── cart.js
├── netlify/
│   └── functions/
│       └── create-checkout.js      # ← Fonction serverless Stripe
├── netlify.toml                     # ← Config Netlify
├── package.json                     # ← Dépendances
├── .env.example                     # ← Variables d'env à copier
└── .gitignore
```

## Déploiement sur Netlify

### Step 1: Push sur GitHub

```bash
git add .
git commit -m "Initial commit: Karay site + Stripe serverless"
git push -u origin main
```

### Step 2: Connecter à Netlify

1. Va sur https://app.netlify.com/
2. Clique "Add new site" → "Import an existing project" → GitHub
3. Autorise Netlify et sélectionne le repo `karay-site`
4. Netlify détecte `netlify.toml` automatiquement ✓

### Step 3: Ajouter les variables d'environnement

Dans Netlify :
- Site settings → Environment → Add environment variables
- Ajoute ta clé privée Stripe :
  - **Key**: `STRIPE_SECRET_KEY`
  - **Value**: `sk_live_...` (ta clé)
- Ajoute l'URL du site :
  - **Key**: `SITE_URL`
  - **Value**: `https://karay.fr` (ou ton domaine)

### Step 4: Redéployer

- Clique "Deploys" → "Trigger deploy"
- Karay est live ! 🚀

## Notes

- Les clés Stripe **ne sont jamais** dans le code ou GitHub — elles restent dans Netlify (sécurisé)
- La fonction serverless crée automatiquement des sessions Stripe basées sur le panier
- Pas besoin de Payment Links statiques — tout est dynamique ✓

## Support

Pour toute question: voir `.env.example` pour les variables requises.
