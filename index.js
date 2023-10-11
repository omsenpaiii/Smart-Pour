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
}, 70); // increase time to 7000

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