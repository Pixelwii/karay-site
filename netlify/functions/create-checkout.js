const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { items, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Pas d\'articles à payer' })
      };
    }

    // Construire les line_items pour Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.period || ''
        },
        unit_amount: Math.round(item.price * 100) // en centimes
      },
      quantity: 1
    }));

    // Créer la Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.SITE_URL || 'https://karay.fr'}/panier.html?success=true`,
      cancel_url: `${process.env.SITE_URL || 'https://karay.fr'}/panier.html?cancelled=true`,
      locale: 'fr'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkoutUrl: session.url,
        sessionId: session.id
      })
    };
  } catch (error) {
    console.error('Erreur Stripe:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur lors de la création de la session de paiement',
        message: error.message
      })
    };
  }
};
