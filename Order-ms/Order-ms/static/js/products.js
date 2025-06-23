// Make functions globally accessible
window.filteredProducts = [];
window.currentPage = 1;
window.productsPerPage = 9;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.fetchAndRenderProducts();
});

// Get DOM elements
const productsContainer = document.getElementById("productsContainer");

window.fetchAndRenderProducts = async function() {
    try {
        console.log('Fetching products...');
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        console.log('Products received:', products);
        
        if (!products || !Array.isArray(products)) {
            throw new Error('Invalid products data received');
        }

        filteredProducts = products;
        console.log('Filtered products:', filteredProducts);
        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

window.renderProducts = function(products) {
    productsContainer.innerHTML = ""; // clear loading spinner

    if (!products.length) {
        productsContainer.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-box-open"></i>
                <p>No products available at the moment.</p>
            </div>
        `;
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(products.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    // Render products
    currentProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute('data-category', product.category || 'uncategorized' );

        card.innerHTML = `
          <div class="product-card" data-category="${product.category || "uncategorized"}" style="cursor: pointer;" onclick="goToProductDetails(${product.id})">
            <div class="product-image">${product.icon || "🍪"}</div>
            <div class="product-info">
                <h3>${product.item_name || "Unnamed Product"}</h3>
                <div class="product-price">₹${product.price_01 ? product.price_01.toFixed(2) : "N/A"}</div>
                <p>${product.description || "No description available"}</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
        `;

        window.goToProductDetails = function(productId) {
            window.location.href = `/product-details.html?id=${productId}`
          }
        productsContainer.appendChild(card);
        
    });

    // Update pagination UI
    const pagination = document.getElementById('pagination');
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = `Page ${currentPage} of ${totalPages}`;
    } else {
        pagination.style.display = 'none';
    }
}

// Filter functions
window.applyFilters = function() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();

    let filtered = filteredProducts.filter(product => {
        if (category && product.category !== category) return false;
        if (searchQuery && !product.item_name.toLowerCase().includes(searchQuery)) return false;
        
        if (priceRange) {
            const price = parseFloat(product.price_01);
            const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
            if (price < min || price > max) return false;
        }
        
        return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return (a.price_01 || 0) - (b.price_01 || 0);
            case 'price-high':
                return (b.price_01 || 0) - (a.price_01 || 0);
            case 'name':
                return (a.item_name || '').localeCompare(b.item_name || '');
            default:
                return 0;
        }
    });

    currentPage = 1; // Reset to first page when filtering
    renderProducts(filtered);
}

window.setQuickFilter = function(category) {
    document.getElementById('categoryFilter').value = category === 'all' ? '' : category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === 'All'));
    });
    applyFilters();
}

window.changePage = function(delta) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    currentPage = Math.max(1, Math.min(currentPage + delta, totalPages));
    renderProducts(filteredProducts);
}

window.addToCart = async function(productId) {
    console.log('Adding product to cart, ID:', productId);
    console.log('Current filtered products:', filteredProducts);
    
    // Disable button and show loading state
    const button = document.querySelector(`button[onclick="addToCart(${productId})"]`);
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }

    try {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Current cart:', cart);
        
        // Find the product in filteredProducts
        const product = filteredProducts.find(p => p.id === parseInt(productId));
        console.log('Found product:', product);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === parseInt(productId));
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Add new item to cart
            const cartItem = {
                id: parseInt(productId),
                name: product.item_name,
                price: product.price_01,
                description: product.description,
                icon: product.icon || '🍪',
                category: product.category,
                quantity: 1
            };
            cart.push(cartItem);
        }

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count using common function
        updateCartCount();

        // Show success message
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${product.item_name} added to cart!
        `;
        document.body.appendChild(toast);

        // Add floating animation
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon && button) {
            // Add pulse animation to cart icon
            cartIcon.classList.add('pulse');
            setTimeout(() => cartIcon.classList.remove('pulse'), 300);

            // Add floating animation from button to cart
            const floatingItem = document.createElement('div');
            floatingItem.className = 'floating-cart-item';
            floatingItem.innerHTML = product.icon || '🍪';
            document.body.appendChild(floatingItem);

            // Get positions
            const cartRect = cartIcon.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            // Set initial position
            floatingItem.style.top = `${buttonRect.top}px`;
            floatingItem.style.left = `${buttonRect.left}px`;

            // Animate to cart
            requestAnimationFrame(() => {
                floatingItem.style.top = `${cartRect.top}px`;
                floatingItem.style.left = `${cartRect.left}px`;
                floatingItem.style.opacity = '0';
                floatingItem.style.transform = 'scale(0.5)';
            });

            // Remove floating item and success message after animation
            setTimeout(() => {
                floatingItem.remove();
                toast.remove();
            }, 500);
        } else {
            // If no animation possible, just remove the toast after a delay
            setTimeout(() => toast.remove(), 3000);
        }

        // Try to sync with server if available
        try {
            const response = await fetch('/api/cart/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to sync cart: ${response.status}`);
            }

            const result = await response.json();
            if (result.data && result.data.cart) {
                // Update local cart if server made any changes
                localStorage.setItem('cart', JSON.stringify(result.data.cart));
            }
        } catch (syncError) {
            console.warn('Failed to sync cart with server:', syncError);
            // Don't show error to user as the item was still added locally
        }

    } catch (error) {
        console.error('Error adding to cart:', error);
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Failed to add item to cart. Please try again.
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } finally {
        const button = document.querySelector(`button[onclick="addToCart(${productId})"]`);
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Add to Cart <i class="fas fa-shopping-cart"></i>';
        }
    }
}




