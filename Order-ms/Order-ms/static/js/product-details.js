// // ==========================================
// // PRODUCT DETAILS PAGE FUNCTIONALITY
// // ==========================================

// // Global variables
// let productData = null;
// let currentQuantity = 1;
// let selectedVariant = null;
// let isWishlisted = false;
// let currentProductId = null;
// let reviewsPage = 1;
// let reviewsPerPage = 5;
// let totalReviews = 0;
// let userRating = 0;
// let cart = {
//     items: [],
//     totalPrice: 0,
//     totalSavings: 0,
//     count: 0
// };

// // ==========================================
// // INITIALIZATION
// // ==========================================

// /**
//  * Initialize the product page when DOM is loaded
//  */
// document.addEventListener('DOMContentLoaded', () => {
//     // Get product ID from URL
//     const urlParams = new URLSearchParams(window.location.search);
//     currentProductId = urlParams.get('id') || '1'; // Default to ID 1 if not specified
    
//     // Initialize page
//     initializeProductPage();
// });

// /**
//  * Initialize all product page functionality
//  */
// async function initializeProductPage() {
//     setupEventListeners();
//     await fetchProductData();
//     setupCartFunctionality();
// }

// /**
//  * Setup all event listeners for the page
//  */
// function setupEventListeners() {
//     // Quantity selector events
//     document.getElementById('decreaseQuantity').addEventListener('click', () => updateQuantity(-1));
//     document.getElementById('increaseQuantity').addEventListener('click', () => updateQuantity(1));
    
//     // Add to cart button
//     document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    
//     // Wishlist button
//     document.getElementById('wishlistBtn').addEventListener('click', toggleWishlist);
    
//     // Tab navigation
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
//     });
    
//     // Load more reviews button
//     document.getElementById('loadMoreReviews').addEventListener('click', loadMoreReviews);
    
//     // Write review button
//     document.getElementById('writeReviewBtn').addEventListener('click', showReviewForm);
//     document.getElementById('cancelReviewBtn').addEventListener('click', hideReviewForm);
//     document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
    
//     // Rating input
//     document.querySelectorAll('.rating-input i').forEach(star => {
//         star.addEventListener('click', (e) => {
//             const rating = parseInt(e.target.dataset.rating);
//             setUserRating(rating);
//         });
//     });
    
//     // Image zoom
//     document.getElementById('imageZoom').addEventListener('click', openZoomModal);
//     document.getElementById('zoomClose').addEventListener('click', closeZoomModal);
    
//     // Cart popup
//     document.getElementById('cartIcon').addEventListener('click', toggleCartPopup);
//     document.getElementById('closeCart').addEventListener('click', toggleCartPopup);
//     document.getElementById('viewFullCart').addEventListener('click', goToCheckout);
    
//     // Retry button
//     document.getElementById('retryBtn').addEventListener('click', () => {
//         document.getElementById('errorContainer').style.display = 'none';
//         document.getElementById('loadingIndicator').style.display = 'flex';
//         fetchProductData();
//     });
// }

// // ==========================================
// // DATA FETCHING
// // ==========================================

// /**
//  * Fetch product data from backend API
//  */
// async function fetchProductData() {
//     try {
//         showLoading(true);
        
//         // Fetch product details
//         const response = await fetch(`/api/products/${currentProductId}`);
//         if (!response.ok) throw new Error('Failed to fetch product data');
        
//         productData = await response.json();
//         console.log('Product data loaded:', productData);
        
//         // Update page with product data
//         updateProductDisplay();
        
//         // Fetch reviews
//         await fetchReviews();
        
//         // Fetch related products
//         await fetchRelatedProducts();
        
//         // Check if product is in wishlist
//         checkWishlistStatus();
        
//         // Show product sections
//         showLoading(false);
//         document.getElementById('productDetailsContainer').style.display = 'block';
//         document.getElementById('productTabsContainer').style.display = 'block';
//         document.getElementById('relatedProductsContainer').style.display = 'block';
        
//         // Update page title
//         document.title = `${productData.name} | SnackMart`;
        
//         // Track product view
//         trackProductView();
        
//     } catch (error) {
//         console.error('Error fetching product data:', error);
//         showError('Failed to load product details. Please try again later.');
//     }
// }

// /**
//  * Fetch product reviews from backend API
//  */
// async function fetchReviews() {
//     try {
//         const response = await fetch(`/api/products/${currentProductId}/reviews?page=${reviewsPage}&limit=${reviewsPerPage}`);
//         if (!response.ok) throw new Error('Failed to fetch reviews');
        
//         const reviewsData = await response.json();
//         console.log('Reviews data loaded:', reviewsData);
        
//         // Update reviews display
//         updateReviewsDisplay(reviewsData);
        
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         showNotification('Failed to load reviews. Please try again later.', 'error');
//     }
// }

// /**
//  * Fetch related products from backend API
//  */
// async function fetchRelatedProducts() {
//     try {
//         const response = await fetch(`/api/products/related?category=${productData.category}&id=${currentProductId}`);
//         if (!response.ok) throw new Error('Failed to fetch related products');
        
//         const relatedProducts = await response.json();
//         console.log('Related products loaded:', relatedProducts);
        
//         // Update related products display
//         updateRelatedProductsDisplay(relatedProducts);
        
//     } catch (error) {
//         console.error('Error fetching related products:', error);
//         // Don't show error notification for related products, not critical
//     }
// }

// // ==========================================
// // DISPLAY UPDATES
// // ==========================================

// /**
//  * Update product display with current data
//  */
// function updateProductDisplay() {
//     // Update product title and subtitle
//     document.getElementById('productTitle').textContent = productData.name;
//     document.getElementById('productSubtitle').textContent = productData.subtitle;
//     document.getElementById('productBreadcrumb').textContent = productData.name;
    
//     // Update category link
//     const categoryLink = document.getElementById('categoryLink');
//     categoryLink.textContent = productData.category_name || 'Products';
//     categoryLink.href = `/products?category=${productData.category}`;
    
//     // Update rating
//     updateRatingDisplay(productData.rating, productData.review_count);
    
//     // Update pricing
//     updatePricingDisplay();
    
//     // Update stock status
//     updateStockStatus();
    
//     // Update product images
//     updateProductImages();
    
//     // Update product highlights
//     updateProductHighlights();
    
//     // Update variants
//     updateVariantsDisplay();
    
//     // Update product description
//     updateProductDescription();
    
//     // Update nutrition facts
//     updateNutritionFacts();
    
//     // Update brand info
//     updateBrandInfo();
// }

// /**
//  * Update rating display
//  */
// function updateRatingDisplay(rating, reviewCount) {
//     const starsContainer = document.getElementById('productRatingStars');
//     const ratingText = document.getElementById('productRatingText');
    
//     starsContainer.innerHTML = generateStarRating(rating);
//     ratingText.textContent = `${rating} (${reviewCount.toLocaleString()} reviews)`;
// }

// /**
//  * Update pricing display
//  */
// function updatePricingDisplay() {
//     const currentVariant = selectedVariant || productData.variants[0];
//     const currentPrice = currentVariant.price;
//     const originalPrice = currentVariant.original_price;
//     const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    
//     document.getElementById('currentPrice').textContent = `₹${currentPrice}`;
//     document.getElementById('originalPrice').textContent = `₹${originalPrice}`;
//     document.getElementById('discountBadge').textContent = `${discount}% OFF`;
// }

// /**
//  * Update stock status
//  */
// function updateStockStatus() {
//     const stockStatus = document.getElementById('stockStatus');
//     const addToCartBtn = document.getElementById('addToCartBtn');
    
//     if (productData.in_stock) {
//         stockStatus.innerHTML = '<i class="fas fa-check-circle"></i> In Stock';
//         stockStatus.className = 'stock-status';
//         addToCartBtn.disabled = false;
//     } else {
//         stockStatus.innerHTML = '<i class="fas fa-times-circle"></i> Out of Stock';
//         stockStatus.className = 'stock-status out-of-stock';
//         addToCartBtn.disabled = true;
//         addToCartBtn.innerHTML = '<i class="fas fa-times"></i> OUT OF STOCK';
//     }
// }

// /**
//  * Update product images
//  */
// function updateProductImages() {
//     const thumbnailList = document.getElementById('thumbnailList');
//     const mainImage = document.getElementById('mainProductImage');
    
//     // Clear existing thumbnails
//     thumbnailList.innerHTML = '';
    
//     // Add thumbnails
//     productData.images.forEach((image, index) => {
//         const thumbnail = document.createElement('div');
//         thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
//         thumbnail.innerHTML = `<img src="${image}" alt="Product Image ${index + 1}">`;
        
//         thumbnail.addEventListener('click', () => {
//             // Remove active class from all thumbnails
//             document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            
//             // Add active class to clicked thumbnail
//             thumbnail.classList.add('active');
            
//             // Update main image
//             mainImage.src = image;
//             mainImage.style.opacity = '0.5';
//             setTimeout(() => {
//                 mainImage.style.opacity = '1';
//             }, 200);
//         });
        
//         thumbnailList.appendChild(thumbnail);
//     });
    
//     // Set main image
//     if (productData.images.length > 0) {
//         mainImage.src = productData.images[0];
//     }
// }

// /**
//  * Update product highlights
//  */
// function updateProductHighlights() {
//     const highlightsList = document.getElementById('productHighlights');
    
//     highlightsList.innerHTML = productData.highlights.map(highlight => `
//         <li>
//             <i class="fas fa-check-circle"></i>
//             ${highlight}
//         </li>
//     `).join('');
// }

// /**
//  * Update variants display
//  */
// function updateVariantsDisplay() {
//     const variantOptions = document.getElementById('variantOptions');
    
//     variantOptions.innerHTML = productData.variants.map((variant, index) => `
//         <div class="variant-option ${index === 0 ? 'active' : ''}">
//             <input type="radio" id="size-${variant.size}" name="size" value="${variant.size}" ${index === 0 ? 'checked' : ''}>
//             <label for="size-${variant.size}">${variant.size} - ₹${variant.price}</label>
//         </div>
//     `).join('');
    
//     // Set initial selected variant
//     selectedVariant = productData.variants[0];
    
//     // Add event listeners to variant options
//     document.querySelectorAll('.variant-option').forEach(option => {
//         option.addEventListener('click', () => {
//             const radio = option.querySelector('input[type="radio"]');
//             const variantSize = radio.value;
            
//             // Remove active class from all options
//             document.querySelectorAll('.variant-option').forEach(opt => opt.classList.remove('active'));
            
//             // Add active class to selected option
//             option.classList.add('active');
            
//             // Check the radio button
//             radio.checked = true;
            
//             // Update selected variant
//             selectedVariant = productData.variants.find(v => v.size === variantSize);
            
//             // Update pricing
//             updatePricingDisplay();
//         });
//     });
// }

// /**
//  * Update product description
//  */
// function updateProductDescription() {
//     const descriptionContainer = document.getElementById('productDescription');
    
//     descriptionContainer.innerHTML = `
//         <p>${productData.description}</p>
        
//         <h4>Why Choose ${productData.name}?</h4>
//         <ul>
//             ${productData.features.map(feature => `<li><strong>${feature.title}:</strong> ${feature.description}</li>`).join('')}
//         </ul>

//         <h4>Storage Instructions</h4>
//         <p>${productData.storage_instructions}</p>
//     `;
// }

// /**
//  * Update nutrition facts
//  */
// function updateNutritionFacts() {
//     const nutritionTable = document.getElementById('nutritionTable');
    
//     nutritionTable.innerHTML = `
//         <div class="nutrition-header">Per 100g serving</div>
//         ${productData.nutrition.map(item => `
//             <div class="nutrition-row">
//                 <span>${item.name}</span>
//                 <span>${item.value}</span>
//             </div>
//         `).join('')}
//     `;
// }

// /**
//  * Update brand info
//  */
// function updateBrandInfo() {
//     const brandInfo = document.getElementById('brandInfo');
    
//     brandInfo.innerHTML = `
//         <div class="brand-logo">
//             <img src="${productData.brand.logo}" alt="${productData.brand.name}">
//         </div>
//         <div class="brand-description">
//             <p>${productData.brand.description}</p>
            
//             <h4>Our Commitment</h4>
//             <ul>
//                 ${productData.brand.commitments.map(commitment => `<li><strong>${commitment.title}:</strong> ${commitment.description}</li>`).join('')}
//             </ul>

//             <h4>Certifications</h4>
//             <div class="certifications">
//                 ${productData.brand.certifications.map(cert => `<div class="cert-badge">${cert}</div>`).join('')}
//             </div>
//         </div>
//     `;
// }

// /**
//  * Update reviews display
//  */
// function updateReviewsDisplay(reviewsData) {
//     totalReviews = reviewsData.total;
    
//     // Update reviews count in tab
//     document.getElementById('reviewsCount').textContent = totalReviews;
    
//     // Update overall rating
//     document.getElementById('overallRating').textContent = reviewsData.average_rating.toFixed(1);
//     document.getElementById('overallRatingStars').innerHTML = generateStarRating(reviewsData.average_rating);
//     document.getElementById('totalReviews').textContent = `Based on ${totalReviews} reviews`;
    
//     // Update rating breakdown
//     updateRatingBreakdown(reviewsData.rating_breakdown);
    
//     // Update reviews list
//     updateReviewsList(reviewsData.reviews);
    
//     // Update load more button
//     updateLoadMoreButton();
// }

// /**
//  * Update rating breakdown
//  */
// function updateRatingBreakdown(breakdown) {
//     const ratingBreakdown = document.getElementById('ratingBreakdown');
    
//     ratingBreakdown.innerHTML = [5, 4, 3, 2, 1].map(rating => {
//         const count = breakdown[rating] || 0;
//         const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        
//         return `
//             <div class="rating-bar">
//                 <span>${rating} ⭐</span>
//                 <div class="bar"><div class="fill" style="width: ${percentage}%"></div></div>
//                 <span>${percentage}%</span>
//             </div>
//         `;
//     }).join('');
// }

// /**
//  * Update reviews list
//  */
// function updateReviewsList(reviews) {
//     const reviewsList = document.getElementById('reviewsList');
    
//     if (reviewsPage === 1) {
//         reviewsList.innerHTML = '';
//     }
    
//     reviews.forEach(review => {
//         const reviewElement = document.createElement('div');
//         reviewElement.className = 'review-item';
//         reviewElement.innerHTML = `
//             <div class="review-header">
//                 <div class="reviewer-info">
//                     <div class="reviewer-avatar">${review.user_name.charAt(0).toUpperCase()}</div>
//                     <div>
//                         <div class="reviewer-name">${review.user_name}</div>
//                         <div class="review-date">${formatDate(review.created_at)}</div>
//                     </div>
//                 </div>
//                 <div class="review-rating">
//                     ${generateStarRating(review.rating)}
//                 </div>
//             </div>
//             ${review.title ? `<div class="review-title">${review.title}</div>` : ''}
//             <div class="review-content">
//                 <p>${review.content}</p>
//             </div>
//             <div class="review-actions">
//                 <button class="helpful-btn ${review.user_found_helpful ? 'active' : ''}" onclick="markHelpful(${review.id})">
//                     <i class="fas fa-thumbs-up"></i> Helpful (${review.helpful_count})
//                 </button>
//             </div>
//         `;
        
//         reviewsList.appendChild(reviewElement);
//     });
// }

// /**
//  * Update load more button
//  */
// function updateLoadMoreButton() {
//     const loadMoreBtn = document.getElementById('loadMoreReviews');
//     const currentReviewsCount = document.querySelectorAll('.review-item').length;
    
//     if (currentReviewsCount >= totalReviews) {
//         loadMoreBtn.style.display = 'none';
//     } else {
//         loadMoreBtn.style.display = 'block';
//         loadMoreBtn.disabled = false;
//         loadMoreBtn.textContent = 'Load More Reviews';
//     }
// }

// /**
//  * Update related products display
//  */
// function updateRelatedProductsDisplay(relatedProducts) {
//     const relatedProductsGrid = document.getElementById('relatedProductsGrid');
    
//     relatedProductsGrid.innerHTML = relatedProducts.map(product => `
//         <div class="product-card" data-product-id="${product.id}">
//             <div class="product-image">
//                 <img src="${product.image}" alt="${product.name}">
//             </div>
//             <div class="product-info">
//                 <h3>${product.name}</h3>
//                 <div class="product-rating">
//                     <div class="stars">
//                         ${generateStarRating(product.rating)}
//                     </div>
//                     <span>${product.rating}</span>
//                 </div>
//                 <div class="product-price">
//                     <span class="current-price">₹${product.price}</span>
//                     <span class="original-price">₹${product.original_price}</span>
//                 </div>
//                 <button class="add-to-cart" onclick="addRelatedProductToCart(${product.id})">Add to Cart</button>
//             </div>
//         </div>
//     `).join('');
// }

// // ==========================================
// // QUANTITY MANAGEMENT
// // ==========================================

// /**
//  * Update product quantity
//  */
// function updateQuantity(change) {
//     const quantityInput = document.getElementById('quantity');
//     const newQuantity = currentQuantity + change;
    
//     if (newQuantity >= 1 && newQuantity <= 10) {
//         currentQuantity = newQuantity;
//         quantityInput.value = currentQuantity;
        
//         // Add visual feedback
//         quantityInput.style.transform = 'scale(1.1)';
//         setTimeout(() => {
//             quantityInput.style.transform = 'scale(1)';
//         }, 150);
//     }
// }

// // ==========================================
// // CART FUNCTIONALITY
// // ==========================================

// /**
//  * Add current product to cart
//  */
// async function addToCart() {
//     try {
//         const cartData = {
//             product_id: productData.id,
//             variant_id: selectedVariant.id,
//             quantity: currentQuantity
//         };
        
//         const response = await fetch('/api/cart/add', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(cartData)
//         });
        
//         if (!response.ok) throw new Error('Failed to add to cart');
        
//         const result = await response.json();
//         console.log('Added to cart:', result);
        
//         // Show success feedback
//         showAddToCartFeedback();
        
//         // Update cart display
//         await fetchCartData();
        
//         // Show cart popup
//         toggleCartPopup();
        
//         // Track add to cart event
//         trackAddToCart();
        
//         showNotification('Product added to cart successfully!', 'success');
        
//     } catch (error) {
//         console.error('Error adding to cart:', error);
//         showNotification('Failed to add product to cart. Please try again.', 'error');
//     }
// }

// /**
//  * Add related product to cart
//  */
// async function addRelatedProductToCart(productId) {
//     try {
//         const cartData = {
//             product_id: productId,
//             quantity: 1
//         };
        
//         const response = await fetch('/api/cart/add', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(cartData)
//         });
        
//         if (!response.ok) throw new Error('Failed to add to cart');
        
//         const result = await response.json();
//         console.log('Added related product to cart:', result);
        
//         // Show success feedback
//         const button = document.querySelector(`[data-product-id="${productId}"] .add-to-cart`);
//         const originalText = button.textContent;
        
//         button.textContent = 'Added!';
//         button.style.background = '#28a745';
        
//         setTimeout(() => {
//             button.textContent = originalText;
//             button.style.background = '';
//         }, 2000);
        
//         // Update cart display
//         await fetchCartData();
        
//         showNotification('Product added to cart successfully!', 'success');
        
//     } catch (error) {
//         console.error('Error adding related product to cart:', error);
//         showNotification('Failed to add product to cart. Please try again.', 'error');
//     }
// }

// /**
//  * Fetch cart data from backend
//  */
// async function fetchCartData() {
//     try {
//         const response = await fetch('/api/cart');
//         if (!response.ok) throw new Error('Failed to fetch cart data');
        
//         cart = await response.json();
//         updateCartDisplay();
        
//     } catch (error) {
//         console.error('Error fetching cart data:', error);
//     }
// }

// /**
//  * Setup cart functionality
//  */
// function setupCartFunctionality() {
//     fetchCartData();
// }

// /**
//  * Update cart display
//  */
// function updateCartDisplay() {
//     document.getElementById('cartCount').textContent = cart.count;
//     document.getElementById('cartItemCount').textContent = cart.count;
//     document.getElementById('cartTotal').textContent = `₹${cart.totalPrice}`;
//     document.getElementById('cartSavings').textContent = `₹${cart.totalSavings}`;
    
//     // Update cart items
//     updateCartItems();
    
//     // Update minimum order message
//     updateMinimumOrderMessage();
// }

// /**
//  * Update cart items display
//  */
// function updateCartItems() {
//     const cartItemsContainer = document.getElementById('cartItems');
    
//     if (cart.items.length === 0) {
//         cartItemsContainer.innerHTML = `
//             <div style="text-align: center; padding: 3rem;">
//                 <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
//                 <p style="color: #666; font-size: 1.1rem;">Your cart is empty</p>
//             </div>
//         `;
//         return;
//     }
    
//     cartItemsContainer.innerHTML = cart.items.map(item => `
//         <div class="cart-item">
//             <div class="cart-item-image">
//                 <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
//             </div>
//             <div class="cart-item-details">
//                 <div class="cart-item-title">${item.name}</div>
//                 <div class="cart-item-variant">Variant: ${item.variant}</div>
//                 <div class="cart-item-price">
//                     <div class="cart-item-pay">You Pay ₹${item.price}</div>
//                     <div class="cart-item-save">You Save ₹${item.savings}</div>
//                 </div>
//                 <div class="cart-item-actions">
//                     <div class="quantity-control">
//                         <button class="quantity-btn ${item.quantity === 1 ? 'remove' : ''}" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">
//                             ${item.quantity === 1 ? '<i class="fas fa-trash"></i>' : '-'}
//                         </button>
//                         <input type="text" class="quantity-input" value="${item.quantity}" readonly>
//                         <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
//                     </div>
//                     <button class="remove-item" onclick="removeCartItem(${item.id})">
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// /**
//  * Update minimum order message
//  */
// function updateMinimumOrderMessage() {
//     const minimumOrderMessage = document.getElementById('minimumOrderMessage');
//     const remainingAmount = document.getElementById('remainingAmount');
//     const minimumOrder = 500;
    
//     if (cart.totalPrice < minimumOrder) {
//         const remaining = minimumOrder - cart.totalPrice;
//         remainingAmount.textContent = remaining;
//         minimumOrderMessage.style.display = 'block';
//     } else {
//         minimumOrderMessage.style.display = 'none';
//     }
// }

// /**
//  * Update cart item quantity
//  */
// async function updateCartItemQuantity(itemId, newQuantity) {
//     try {
//         if (newQuantity <= 0) {
//             await removeCartItem(itemId);
//             return;
//         }
        
//         const response = await fetch(`/api/cart/items/${itemId}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ quantity: newQuantity })
//         });
        
//         if (!response.ok) throw new Error('Failed to update cart item');
        
//         await fetchCartData();
        
//     } catch (error) {
//         console.error('Error updating cart item:', error);
//         showNotification('Failed to update cart item. Please try again.', 'error');
//     }
// }

// /**
//  * Remove cart item
//  */
// async function removeCartItem(itemId) {
//     try {
//         const response = await fetch(`/api/cart/items/${itemId}`, {
//             method: 'DELETE'
//         });
        
//         if (!response.ok) throw new Error('Failed to remove cart item');
        
//         await fetchCartData();
//         showNotification('Item removed from cart', 'info');
        
//     } catch (error) {
//         console.error('Error removing cart item:', error);
//         showNotification('Failed to remove cart item. Please try again.', 'error');
//     }
// }

// /**
//  * Toggle cart popup
//  */
// function toggleCartPopup() {
//     const cartPopup = document.getElementById('cartPopup');
//     cartPopup.classList.toggle('active');
    
//     if (cartPopup.classList.contains('active')) {
//         document.body.style.overflow = 'hidden';
//     } else {
//         document.body.style.overflow = '';
//     }
// }

// /**
//  * Go to checkout
//  */
// function goToCheckout() {
//     window.location.href = '/checkout';
// }

// // ==========================================
// // WISHLIST FUNCTIONALITY
// // ==========================================

// /**
//  * Check if product is in wishlist
//  */
// async function checkWishlistStatus() {
//     try {
//         const response = await fetch(`/api/wishlist/check/${currentProductId}`);
//         if (response.ok) {
//             const result = await response.json();
//             isWishlisted = result.in_wishlist;
//             updateWishlistButton();
//         }
//     } catch (error) {
//         console.error('Error checking wishlist status:', error);
//     }
// }

// /**
//  * Toggle product in wishlist
//  */
// async function toggleWishlist() {
//     try {
//         const method = isWishlisted ? 'DELETE' : 'POST';
//         const response = await fetch(`/api/wishlist/${currentProductId}`, {
//             method: method,
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         if (!response.ok) throw new Error('Failed to update wishlist');
        
//         isWishlisted = !isWishlisted;
//         updateWishlistButton();
        
//         const message = isWishlisted ? 'Added to wishlist' : 'Removed from wishlist';
//         showNotification(message, 'success');
        
//     } catch (error) {
//         console.error('Error updating wishlist:', error);
//         showNotification('Failed to update wishlist. Please try again.', 'error');
//     }
// }

// /**
//  * Update wishlist button
//  */
// function updateWishlistButton() {
//     const wishlistBtn = document.getElementById('wishlistBtn');
//     const icon = wishlistBtn.querySelector('i');
    
//     if (isWishlisted) {
//         icon.classList.remove('far');
//         icon.classList.add('fas');
//         wishlistBtn.classList.add('active');
//     } else {
//         icon.classList.remove('fas');
//         icon.classList.add('far');
//         wishlistBtn.classList.remove('active');
//     }
// }

// // ==========================================
// // REVIEWS FUNCTIONALITY
// // ==========================================

// /**
//  * Load more reviews
//  */
// async function loadMoreReviews() {
//     try {
//         const loadMoreBtn = document.getElementById('loadMoreReviews');
//         loadMoreBtn.disabled = true;
//         loadMoreBtn.textContent = 'Loading...';
        
//         reviewsPage++;
//         await fetchReviews();
        
//     } catch (error) {
//         console.error('Error loading more reviews:', error);
//         showNotification('Failed to load more reviews. Please try again.', 'error');
//         reviewsPage--;
//     }
// }

// /**
//  * Show review form
//  */
// function showReviewForm() {
//     document.getElementById('reviewForm').style.display = 'block';
//     document.getElementById('writeReviewBtn').style.display = 'none';
// }

// /**
//  * Hide review form
//  */
// function hideReviewForm() {
//     document.getElementById('reviewForm').style.display = 'none';
//     document.getElementById('writeReviewBtn').style.display = 'block';
    
//     // Reset form
//     document.getElementById('reviewTitle').value = '';
//     document.getElementById('reviewContent').value = '';
//     setUserRating(0);
// }

// /**
//  * Set user rating
//  */
// function setUserRating(rating) {
//     userRating = rating;
//     document.getElementById('ratingInput').value = rating;
    
//     const stars = document.querySelectorAll('.rating-input i');
//     stars.forEach((star, index) => {
//         if (index < rating) {
//             star.classList.remove('far');
//             star.classList.add('fas', 'active');
//         } else {
//             star.classList.remove('fas', 'active');
//             star.classList.add('far');
//         }
//     });
// }

// /**
//  * Submit review
//  */
// async function submitReview() {
//     try {
//         const title = document.getElementById('reviewTitle').value.trim();
//         const content = document.getElementById('reviewContent').value.trim();
        
//         if (userRating === 0) {
//             showNotification('Please select a rating', 'error');
//             return;
//         }
        
//         if (!content) {
//             showNotification('Please write a review', 'error');
//             return;
//         }
        
//         const submitBtn = document.getElementById('submitReviewBtn');
//         submitBtn.disabled = true;
//         submitBtn.textContent = 'Submitting...';
        
//         const reviewData = {
//             product_id: currentProductId,
//             rating: userRating,
//             title: title,
//             content: content
//         };
        
//         const response = await fetch('/api/reviews', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(reviewData)
//         });
        
//         if (!response.ok) throw new Error('Failed to submit review');
        
//         const result = await response.json();
//         console.log('Review submitted:', result);
        
//         hideReviewForm();
//         showNotification('Review submitted successfully!', 'success');
        
//         // Refresh reviews
//         reviewsPage = 1;
//         await fetchReviews();
        
//     } catch (error) {
//         console.error('Error submitting review:', error);
//         showNotification('Failed to submit review. Please try again.', 'error');
//     } finally {
//         const submitBtn = document.getElementById('submitReviewBtn');
//         submitBtn.disabled = false;
//         submitBtn.textContent = 'Submit Review';
//     }
// }

// /**
//  * Mark review as helpful
//  */
// async function markHelpful(reviewId) {
//     try {
//         const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         if (!response.ok) throw new Error('Failed to mark review as helpful');
        
//         const result = await response.json();
        
//         // Update the helpful button
//         const helpfulBtn = document.querySelector(`[onclick="markHelpful(${reviewId})"]`);
//         helpfulBtn.classList.add('active');
//         helpfulBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${result.helpful_count})`;
        
//         showNotification('Thank you for your feedback!', 'success');
        
//     } catch (error) {
//         console.error('Error marking review as helpful:', error);
//         showNotification('Failed to mark review as helpful. Please try again.', 'error');
//     }
// }

// // ==========================================
// // TAB FUNCTIONALITY
// // ==========================================

// /**
//  * Switch between product information tabs
//  */
// function switchTab(tabId) {
//     // Remove active class from all tabs and panels
//     document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
//     document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
//     // Add active class to selected tab and panel
//     document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
//     document.getElementById(tabId).classList.add('active');
    
//     // Smooth scroll to tab content
//     document.querySelector('.tab-content').scrollIntoView({ 
//         behavior: 'smooth', 
//         block: 'start' 
//     });
// }

// // ==========================================
// // IMAGE ZOOM FUNCTIONALITY
// // ==========================================

// /**
//  * Open zoom modal
//  */
// function openZoomModal() {
//     const zoomModal = document.getElementById('zoomModal');
//     const zoomImage = document.getElementById('zoomImage');
//     const mainImage = document.getElementById('mainProductImage');
    
//     zoomImage.src = mainImage.src;
//     zoomModal.style.display = 'block';
//     document.body.style.overflow = 'hidden';
// }

// /**
//  * Close zoom modal
//  */
// function closeZoomModal() {
//     const zoomModal = document.getElementById('zoomModal');
//     zoomModal.style.display = 'none';
//     document.body.style.overflow = '';
// }

// // ==========================================
// // UTILITY FUNCTIONS
// // ==========================================

// /**
//  * Show loading indicator
//  */
// function showLoading(show) {
//     const loadingIndicator = document.getElementById('loadingIndicator');
//     loadingIndicator.style.display = show ? 'flex' : 'none';
// }

// /**
//  * Show error message
//  */
// function showError(message) {
//     showLoading(false);
//     document.getElementById('errorMessage').textContent = message;
//     document.getElementById('errorContainer').style.display = 'block';
// }

// /**
//  * Show notification
//  */
// function showNotification(message, type = 'success') {
//     const notificationContainer = document.getElementById('notificationContainer');
    
//     const notification = document.createElement('div');
//     notification.className = `notification ${type}`;
//     notification.innerHTML = `
//         <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
//         <span>${message}</span>
//     `;
    
//     notificationContainer.appendChild(notification);
    
//     // Show notification
//     setTimeout(() => {
//         notification.classList.add('show');
//     }, 100);
    
//     // Remove notification after 3 seconds
//     setTimeout(() => {
//         notification.classList.remove('show');
//         setTimeout(() => {
//             notificationContainer.removeChild(notification);
//         }, 300);
//     }, 3000);
// }

// /**
//  * Show add to cart feedback
//  */
// function showAddToCartFeedback() {
//     const button = document.getElementById('addToCartBtn');
//     const originalText = button.innerHTML;
    
//     button.innerHTML = '<i class="fas fa-check"></i> ADDED TO CART';
//     button.style.background = '#28a745';
    
//     setTimeout(() => {
//         button.innerHTML = originalText;
//         button.style.background = '';
//     }, 2000);
// }

// /**
//  * Generate star rating HTML
//  */
// function generateStarRating(rating) {
//     let stars = '';
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 !== 0;
    
//     for (let i = 1; i <= 5; i++) {
//         if (i <= fullStars) {
//             stars += '<i class="fas fa-star"></i>';
//         } else if (i === fullStars + 1 && hasHalfStar) {
//             stars += '<i class="fas fa-star-half-alt"></i>';
//         } else {
//             stars += '<i class="far fa-star"></i>';
//         }
//     }
    
//     return stars;
// }

// /**
//  * Format date
//  */
// function formatDate(dateString) {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 1) {
//         return 'Yesterday';
//     } else if (diffDays < 7) {
//         return `${diffDays} days ago`;
//     } else if (diffDays < 30) {
//         const weeks = Math.floor(diffDays / 7);
//         return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
//     } else if (diffDays < 365) {
//         const months = Math.floor(diffDays / 30);
//         return `${months} month${months > 1 ? 's' : ''} ago`;
//     } else {
//         const years = Math.floor(diffDays / 365);
//         return `${years} year${years > 1 ? 's' : ''} ago`;
//     }
// }

// // ==========================================
// // ANALYTICS AND TRACKING
// // ==========================================

// /**
//  * Track product view event
//  */
// function trackProductView() {
//     // TODO: Implement analytics tracking
//     console.log('Product viewed:', {
//         productId: productData.id,
//         productName: productData.name,
//         category: productData.category,
//         timestamp: new Date().toISOString()
//     });
// }

// /**
//  * Track add to cart event
//  */
// function trackAddToCart() {
//     // TODO: Implement analytics tracking
//     console.log('Add to cart:', {
//         productId: productData.id,
//         variant: selectedVariant.size,
//         quantity: currentQuantity,
//         price: selectedVariant.price,
//         timestamp: new Date().toISOString()
//     });
// }

// // ==========================================
// // EVENT LISTENERS
// // ==========================================

// // Close modals when clicking outside
// window.addEventListener('click', (event) => {
//     const zoomModal = document.getElementById('zoomModal');
//     if (event.target === zoomModal) {
//         closeZoomModal();
//     }
// });

// // Keyboard shortcuts
// document.addEventListener('keydown', (event) => {
//     // Close modals with Escape key
//     if (event.key === 'Escape') {
//         closeZoomModal();
//         if (document.getElementById('cartPopup').classList.contains('active')) {
//             toggleCartPopup();
//         }
//     }
    
//     // Quick quantity adjustment with + and - keys
//     if (event.target.id === 'quantity') {
//         if (event.key === '+' || event.key === '=') {
//             event.preventDefault();
//             updateQuantity(1);
//         } else if (event.key === '-') {
//             event.preventDefault();
//             updateQuantity(-1);
//         }
//     }
// });

// console.log('Product details page initialized successfully');