// Animation loader
let animation = lottie.loadAnimation({
    container: document.getElementById('animationContainer'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './animations/animation_loading.json'
});

setTimeout(() => {
    document.getElementById('loadingPage').style.display = 'none';
    document.getElementById('productPage').style.display = 'block';
}, 7000); // increase time to 7000

// Your product data
const products = {
    type1: {
        quality: 'Low fat milk, perfect for diet routines.',
        pricePer100ml: 20
    },
    type2: {
        quality: 'Pure milk with added vitamins.',
        pricePer100ml: 22
    },
    type3: {
        quality: 'Fresh and Creamy, straight from the farm.',
        pricePer100ml: 18
    },
    type4: {
        quality: 'Organic milk with a rich taste.',
        pricePer100ml: 24
    }
};

// Reference to the currently selected product
let selectedProduct = null;

// Handle Product Selection
document.querySelectorAll('.product-card').forEach(productCard => {
    productCard.addEventListener('click', function() {
        if (selectedProduct) {
            selectedProduct.classList.remove('border-blue-500');
        }
        this.classList.add('border-blue-500');
        selectedProduct = this;

        // Store the selected product type for future use
        let productType = this.getAttribute('data-product');
        localStorage.setItem('selectedMilkType', productType);

        // Moving to quality & quantity selection
        document.getElementById('productPage').style.display = 'none';
        document.getElementById('qualityQuantityPage').style.display = 'block';

        // Displaying the quality information based on the selection
        document.getElementById('qualityInfo').textContent = products[productType].quality;

        // Update initial total price for 50ml
        updateTotalPrice(50);
    });
});

// Handle Quantity and Price Display
const quantityInput = document.getElementById('quantity');
const selectedQuantityDisplay = document.getElementById('selectedQuantity');
const totalPriceDisplay = document.getElementById('totalPrice');

quantityInput.addEventListener('input', function() {
    updateTotalPrice(this.value);
});

function updateTotalPrice(quantity) {
    const selectedMilkType = localStorage.getItem('selectedMilkType');
    const pricePer100ml = products[selectedMilkType].pricePer100ml;
    const totalPrice = (quantity / 100) * pricePer100ml;

    selectedQuantityDisplay.textContent = `${quantity} ml`;
    totalPriceDisplay.textContent = `₹${totalPrice.toFixed(2)}`;
}

// Handle the proceed to payment action
document.getElementById('proceedToPayment').addEventListener('click', function() {
    const selectedMilkType = localStorage.getItem('selectedMilkType');
    const quantity = document.getElementById('quantity').value;

    // TODO: Here you can initiate the Stripe payment with the quantity and selected milk type data
    // After Stripe payment success, send the data to Firebase (this will be covered in a later step)
});

const paymentLinks = {
    type1: 'https://buy.stripe.com/9AQbKueND0aXgw0dQQ',
    type2: 'https://buy.stripe.com/9AQ9CmcFve1Ngw0145',
    type3: 'https://buy.stripe.com/5kAbKufRH9Lxa7CfZ0',
    type4: 'https://buy.stripe.com/bIY5m6eND4rd6VqcMP',
};

document.getElementById('proceedToPayment').addEventListener('click', function() {
    const selectedMilkType = localStorage.getItem('selectedMilkType');
    const paymentLink = paymentLinks[selectedMilkType];

    if (paymentLink) {
        window.location.href = paymentLink;
    } else {
        console.error("Invalid product type or payment link not found.");
    }
});

const admin = require('firebase-admin');

const serviceAccount = require('8OpbAUXiqHPGdIVFu1jAkJ7X6vrLZsU2BYwuT17X');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://smart-pour-default-rtdb.asia-southeast1.firebasedatabase.app'  // replace with your database URL
});

app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_7CQrCtbj2gYN6mLa01WRDC7YbzFNqJNE');
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Extract necessary data from the session
        const { amount_total, currency, payment_status, metadata } = session;
        
        // Send metadata to Firebase
        const db = admin.firestore();
        await db.collection('payments').add({
            amount: amount_total,
            currency,
            status: payment_status,
            metadata,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    res.status(200).send('Received');
});
