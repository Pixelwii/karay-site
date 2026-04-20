<?php
/* ═══════════════════════════════════════════════════
   KARAY — Création de session Stripe (PHP/Hostinger)
   Appelée par cart.js → window.createStripeCheckout()
   ═══════════════════════════════════════════════════ */

// Inclure la config avec la clé privée Stripe
require_once __DIR__ . '/config.php';

// Headers CORS (même domaine normalement, mais on autorise au cas où)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Lire le JSON envoyé par le frontend
$input = json_decode(file_get_contents('php://input'), true);
$items = $input['items'] ?? [];
$email = $input['email'] ?? null;

if (empty($items) || !is_array($items)) {
    http_response_code(400);
    echo json_encode(['error' => 'Pas d\'articles à payer']);
    exit;
}

// Préparer les line_items pour Stripe
$lineItems = [];
foreach ($items as $i => $item) {
    $name = $item['name'] ?? 'Service';
    $period = $item['period'] ?? '';
    $price = (float)($item['price'] ?? 0);
    $amountCents = (int)round($price * 100);

    if ($amountCents <= 0) continue;

    $lineItems["line_items[$i][price_data][currency]"] = 'eur';
    $lineItems["line_items[$i][price_data][product_data][name]"] = $name;
    if ($period) {
        $lineItems["line_items[$i][price_data][product_data][description]"] = $period;
    }
    $lineItems["line_items[$i][price_data][unit_amount]"] = $amountCents;
    $lineItems["line_items[$i][quantity]"] = 1;
}

if (empty($lineItems)) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun montant valide']);
    exit;
}

// Construire les paramètres de la requête Stripe
$params = array_merge([
    'mode' => 'payment',
    'payment_method_types[]' => 'card',
    'success_url' => SITE_URL . '/panier.html?success=true',
    'cancel_url' => SITE_URL . '/panier.html?cancelled=true',
    'locale' => 'fr'
], $lineItems);

if ($email) {
    $params['customer_email'] = $email;
}

// Appel à l'API Stripe via cURL
$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, STRIPE_SECRET_KEY . ':');
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur réseau Stripe', 'message' => $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200 || !isset($data['url'])) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur Stripe',
        'message' => $data['error']['message'] ?? 'Erreur inconnue'
    ]);
    exit;
}

// Succès : retourner l'URL de checkout
echo json_encode([
    'checkoutUrl' => $data['url'],
    'sessionId' => $data['id']
]);
