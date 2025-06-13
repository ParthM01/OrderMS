// Global variables
let currentProduct = null
const cart = JSON.parse(localStorage.getItem("cart")) || []

// API Configuration
const API_BASE_URL = "/api" // Change this to your backend URL

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount()
  await loadProductDetails()
  await loadRelatedProducts()
  initializeScrollToTop()
  checkAuthState()
})

// Load product details from backend
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get("id")

  if (!productId) {
    showError("Product Not Found", "The product you are looking for does not exist.")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)

    if (!response.ok) {
      throw new Error(`Failed to load product details: ${response.status}`)
    }

    const product = await response.json()
    console.log("Product data:", product)

    currentProduct = product
    renderProductDetails(product)
    updateBreadcrumb(product.item_name)
  } catch (error) {
    console.error("Error loading product:", error)
    showError("Loading Error", "Failed to load product details. Please try again later.")
  }
}

// Render product details - Enhanced with purple theme matching index page
function renderProductDetails(product) {
  const container = document.getElementById("productContainer")

  // Create variants array - Preserved from your original code
  const variants = []
  for (let i = 1; i <= 4; i++) {
    const packing = product[`packing_0${i}`]
    const price = product[`price_0${i}`]
    if (packing && price) {
      variants.push({ packing, price })
    }
  }

  // Calculate discount - Preserved from your original code
  let discountPercentage = 0
  if (product.original_price && product.price_01) {
    discountPercentage = Math.round(((product.original_price - product.price_01) / product.original_price) * 100)
  }

  container.innerHTML = `
        <div class="product-layout">
            <div class="product-gallery">
                  <div class="product-image" onclick="goToProductDetails(${product.id})">
  <img src="${product.image_url|| 'images/.png'}"
       alt="${product.item_name}"
       loading="lazy"
       onload="this.parentElement.classList.add('loaded')"
       onerror="this.src='images/placeholder.png'; this.classList.add('image-error');" />
</div>
                <div class="product-thumbnails">
                    <div class="thumbnail active" onclick="changeProductImage('${product.icon || "🍪"}')">
                        ${product.icon || "🍪"}
                    </div>
                    <div class="thumbnail" onclick="changeProductImage('🥨')">🥨</div>
                    <div class="thumbnail" onclick="changeProductImage('🍩')">🍩</div>
                    <div class="thumbnail" onclick="changeProductImage('🍰')">🍰</div>
                </div>
            </div>
            
            <div class="product-info">
                <div class="product-header">
                    <div class="product-category">${product.category || "Snack"}</div>
                    <h1 class="product-title">${product.item_name}</h1>
                    
                    <div class="product-rating">
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <span class="rating-count">(${Math.floor(Math.random() * 100) + 50} reviews)</span>
                    </div>
                    
                    <div class="product-price-container">
                        <div class="product-price" id="currentPrice">₹${product.price_01?.toFixed(2) || "N/A"}</div>
                        ${
                          product.original_price
                            ? `
                            <div class="product-original-price">₹${product.original_price.toFixed(2)}</div>
                            <div class="product-discount">${discountPercentage}% OFF</div>
                        `
                            : ""
                        }
                    </div>
                </div>
                
                <div class="product-description">
                    ${product.description || "Delicious snack made with premium ingredients and traditional recipes. Perfect for sharing with family and friends or enjoying as a personal treat."}
                </div>
                
                <div class="product-meta">
                    ${
                      product.shelf_life_days
                        ? `
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div class="meta-item-content">
                                <h4>Shelf Life</h4>
                                <p>${product.shelf_life_days} days</p>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      product.lead_time_days
                        ? `
                        <div class="meta-item">
                            <i class="fas fa-truck"></i>
                            <div class="meta-item-content">
                                <h4>Delivery Time</h4>
                                <p>${product.lead_time_days} days</p>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="meta-item">
                        <i class="fas fa-shield-alt"></i>
                        <div class="meta-item-content">
                            <h4>Quality Guarantee</h4>
                            <p>100% Fresh & Premium</p>
                        </div>
                    </div>
                </div>
                
                ${
                  variants.length > 0
                    ? `
                    <div class="product-variants">
                        <h3 class="variants-title">Available Variants</h3>
                        <div class="variants-list">
                            ${variants
                              .map(
                                (v, i) => `
                                <div class="variant-item ${i === 0 ? "active" : ""}" 
                                    onclick="selectVariant(this, ${v.price})">
                                    <div class="variant-name">${v.packing}</div>
                                    <div class="variant-price">₹${v.price.toFixed(2)}</div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="10" id="quantity" readonly>
                        <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
                    </div>
                    
                    <button class="add-to-cart-btn" onclick="addToCartFromDetails(${product.id})">
                        <i class="fas fa-plus"></i>
                        Add to Cart
                    </button>
                    
                    <button class="wishlist-btn" onclick="toggleWishlist(this)">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <div class="product-tabs">
                    <div class="tabs-header">
                        <button class="tab-btn active" onclick="switchTab(this, 'description')">Description</button>
                        <button class="tab-btn" onclick="switchTab(this, 'specifications')">Specifications</button>
                        <button class="tab-btn" onclick="switchTab(this, 'reviews')">Reviews</button>
                        <button class="tab-btn" onclick="switchTab(this, 'shipping')">Shipping</button>
                    </div>
                    
                    <div class="tab-content active" id="description">
                        <p>${product.description || "No description available for this product."}</p>
                        <p>Our products are made with the finest ingredients, ensuring a delightful experience with every bite. Perfect for snacking at home, gifting to loved ones, or enjoying during special occasions.</p>
                    </div>
                    
                    <div class="tab-content" id="specifications">
                        <ul>
                            <li><strong>Category:</strong> ${product.category || "N/A"}</li>
                            <li><strong>Weight:</strong> ${product.packing_01 || "N/A"}</li>
                            <li><strong>Shelf Life:</strong> ${product.shelf_life_days || "N/A"} days</li>
                            <li><strong>Delivery Time:</strong> ${product.lead_time_days || "N/A"} days</li>
                            <li><strong>Storage:</strong> Store in a cool, dry place</li>
                            <li><strong>Ingredients:</strong> Premium quality ingredients (see packaging for details)</li>
                        </ul>
                    </div>
                    
                    <div class="tab-content" id="reviews">
                        <p>Customer reviews will be displayed here. Be the first to review this product!</p>
                        <div style="margin-top: 2rem; padding: 1rem; background: linear-gradient(135deg, #f8f4ff 0%, #e8d5ff 100%); border-radius: 8px;">
                            <h4>Write a Review</h4>
                            <p>Share your experience with this product to help other customers make informed decisions.</p>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="shipping">
                        <h4>Shipping Information</h4>
                        <p>We ship all across India. Standard delivery takes 3-5 business days.</p>
                        <ul>
                            <li>Free shipping on orders above ₹500</li>
                            <li>Express delivery available in major cities</li>
                            <li>Secure packaging to ensure freshness</li>
                        </ul>
                        
                        <h4>Return Policy</h4>
                        <p>If you're not satisfied with your purchase, you can return it within 7 days for a full refund or replacement.</p>
                        <ul>
                            <li>Items must be in original packaging</li>
                            <li>Perishable items have different return policies</li>
                            <li>Contact customer service for return requests</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `
}

// Load related products from backend - Preserved from your original code
async function loadRelatedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)

    if (!response.ok) {
      throw new Error(`Failed to load related products: ${response.status}`)
    }

    const products = await response.json()

    // Filter out current product and get up to 4 related products
    const relatedProducts = products.filter((p) => currentProduct && p.id !== currentProduct.id).slice(0, 4)

    renderRelatedProducts(relatedProducts)
  } catch (error) {
    console.error("Error loading related products:", error)
    const container = document.getElementById("relatedGrid")
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Failed to load related products.</p>'
  }
}

// Render related products - Enhanced with purple theme
function renderRelatedProducts(products) {
  const container = document.getElementById("relatedGrid")

  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No related products found.</p>'
    return
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" onclick="goToProduct(${product.id})">
            <div class="product-image" onclick="goToProductDetails(${product.id})">
            <img src="${product.image_url || 'images/placeholder.png'}"
                 alt="${product.item_name}"
                 loading="lazy"
                 onload="this.parentElement.classList.add('loaded')"
                 onerror="this.src='images/placeholder.png'; this.classList.add('image-error');" />
          </div>
            <div class="product-info">
                <h3>${product.item_name}</h3>
                <p class="product-description">${(product.description || "").substring(0, 80)}...</p>
                <div class="product-price">₹${product.max_price?.toFixed(2) || "N/A"}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Utility functions - Preserved from your original code
function changeProductImage(emoji) {
  document.getElementById("mainProductImage").textContent = emoji

  // Update active thumbnail
  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.classList.remove("active")
    if (thumb.textContent.trim() === emoji) {
      thumb.classList.add("active")
    }
  })
}

function selectVariant(element, price) {
  document.querySelectorAll(".variant-item").forEach((item) => {
    item.classList.remove("active")
  })
  element.classList.add("active")
  document.getElementById("currentPrice").textContent = `₹${price.toFixed(2)}`
}

function updateQuantity(change) {
  const input = document.getElementById("quantity")
  const currentValue = Number.parseInt(input.value)
  const newValue = Math.max(1, Math.min(10, currentValue + change))
  input.value = newValue
}

function toggleWishlist(button) {
  button.classList.toggle("active")

  if (button.classList.contains("active")) {
    button.innerHTML = '<i class="fas fa-heart"></i>'
    showToast("Added to wishlist!", "success")
  } else {
    button.innerHTML = '<i class="far fa-heart"></i>'
    showToast("Removed from wishlist", "info")
  }
}

function switchTab(button, tabId) {
  // Update active button
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  button.classList.add("active")

  // Update active content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(tabId).classList.add("active")
}

// Cart functions - Preserved from your original code
function addToCartFromDetails(productId) {
  const quantity = Number.parseInt(document.getElementById("quantity").value)
  const selectedVariant = document.querySelector(".variant-item.active")
  let variantInfo = null

  if (selectedVariant) {
    const variantName = selectedVariant.querySelector(".variant-name").textContent
    const variantPrice = Number.parseFloat(selectedVariant.querySelector(".variant-price").textContent.replace("₹", ""))
    variantInfo = { name: variantName, price: variantPrice }
  }

  addToCart(productId, quantity, variantInfo)
}

async function addToCart(productId, quantity = 1, variantInfo = null) {
  const button = document.querySelector(".add-to-cart-btn") || event.target

  // Disable button temporarily
  if (button) {
    button.disabled = true
    const originalText = button.innerHTML
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...'

    setTimeout(() => {
      button.disabled = false
      button.innerHTML = originalText
    }, 1000)
  }

  try {
    let product = currentProduct

    // If we don't have the current product, fetch it from the backend
    if (!product) {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`)
      if (response.ok) {
        product = await response.json()
      } else {
        throw new Error("Product not found")
      }
    }

    if (!product) {
      showToast("Product not found", "error")
      return
    }

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === Number.parseInt(productId) &&
        ((!item.variant && !variantInfo) || item.variant === variantInfo?.name),
    )

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      const cartItem = {
        id: Number.parseInt(productId),
        name: product.item_name,
        price: variantInfo ? variantInfo.price : product.price_01,
        description: product.description,
        icon: product.icon || "🍪",
        category: product.category,
        quantity: quantity,
        variant: variantInfo ? variantInfo.name : null,
      }
      cart.push(cartItem)
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count
    updateCartCount()
    renderCartItems()

    // Show success message
    showToast(`${product.item_name} added to cart!`, "success")

    // Add animation effect
    animateAddToCart(button)

    // Try to sync with server if available - Preserved from your original code
    try {
      const response = await fetch("/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.data && result.data.cart) {
          localStorage.setItem("cart", JSON.stringify(result.data.cart))
        }
      }
    } catch (syncError) {
      console.warn("Failed to sync cart with server:", syncError)
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    showToast("Failed to add item to cart", "error")
  }
}

function animateAddToCart(button) {
  const cartIcon = document.querySelector(".cart-icon")
  if (cartIcon && button) {
    cartIcon.classList.add("pulse")
    setTimeout(() => cartIcon.classList.remove("pulse"), 300)
  }
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartCountElements = document.querySelectorAll("#cartCount, #cartBadge, #cartItemCount")

  cartCountElements.forEach((element) => {
    if (element) {
      element.textContent = totalItems
    }
  })
}

function toggleCart() {
  const popup = document.getElementById("cartPopup")
  const isActive = popup.classList.contains("active")

  if (isActive) {
    popup.classList.remove("active")
  } else {
    popup.classList.add("active")
    renderCartItems()
  }
}

function renderCartItems() {
  const container = document.getElementById("cartItems")

  if (cart.length === 0) {
    container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p style="color: #666; font-size: 1.1rem;">Your cart is empty</p>
                <p style="color: #999; font-size: 0.9rem;">Add some delicious snacks to get started!</p>
            </div>
        `
    document.getElementById("cartTotal").textContent = "0"
    return
  }

  const cartHTML = cart
    .map(
      (item) => `
        <div class="cart-item" style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
            <div style="width: 60px; height: 60px; background: var(--gradient-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                ${item.icon}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 0.25rem;">${item.name}</div>
                ${item.variant ? `<div style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.5rem;">${item.variant}</div>` : ""}
                <div style="font-weight: 600; color: var(--primary-color);">₹${item.price.toFixed(2)}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button onclick="updateCartItemQuantity(${item.id}, '${item.variant || ""}', -1)" style="background: var(--gradient-primary); border: none; color: white; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                        <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                        <button onclick="updateCartItemQuantity(${item.id}, '${item.variant || ""}', 1)" style="background: var(--gradient-primary); border: none; color: white; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                    </div>
                    <button onclick="removeFromCart(${item.id}, '${item.variant || ""}')" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1rem; margin-left: auto;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  container.innerHTML = cartHTML

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  document.getElementById("cartTotal").textContent = total.toFixed(2)
}

function updateCartItemQuantity(productId, variant, change) {
  const itemIndex = cart.findIndex(
    (item) => item.id === Number.parseInt(productId) && ((!item.variant && !variant) || item.variant === variant),
  )

  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    renderCartItems()
  }
}

function removeFromCart(productId, variant) {
  const itemIndex = cart.findIndex(
    (item) => item.id === Number.parseInt(productId) && ((!item.variant && !variant) || item.variant === variant),
  )

  if (itemIndex !== -1) {
    const removedItem = cart[itemIndex]
    cart.splice(itemIndex, 1)
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    renderCartItems()
    showToast(`${removedItem.name} removed from cart`, "info")
  }
}

// Navigation functions - Preserved from your original code
function goToProduct(productId) {
  window.location.href = `?id=${productId}`
}

function performSearch() {
  const searchInput = document.getElementById("searchInput")
  const query = searchInput.value.trim()

  if (query) {
    window.location.href = `/product?search=${encodeURIComponent(query)}`
  }
}

// Pincode functions - Matching index page functionality
function openPincodeModal() {
  document.getElementById("pincodeModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

function closePincodeModal() {
  document.getElementById("pincodeModal").classList.remove("active")
  document.body.style.overflow = ""
}

// Auth functions - Matching index page functionality
function toggleAuth() {
  try {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user && user.first_name) {
      const dropdown = document.getElementById("logoutDropdown")
      if (dropdown) dropdown.classList.toggle("active")
    } else {
      window.location.href = "/login"
    }
  } catch (err) {
    window.location.href = "/login"
  }
}

function confirmLogout() {
  localStorage.removeItem("user")
  const authText = document.getElementById("authText")
  if (authText) authText.textContent = "Sign In"
  const dropdown = document.getElementById("logoutDropdown")
  if (dropdown) dropdown.classList.remove("active")
  window.location.href = "/"
}

function cancelLogout() {
  const dropdown = document.getElementById("logoutDropdown")
  if (dropdown) dropdown.classList.remove("active")
}

function checkAuthState() {
  try {
    const user = JSON.parse(localStorage.getItem("user"))
    const authText = document.getElementById("authText")

    if (!authText) return

    if (user && typeof user.first_name === "string" && user.first_name.length > 0) {
      authText.textContent = `Hi ${user.first_name}`
    } else {
      authText.textContent = "Sign In"
    }
  } catch (err) {
    const authText = document.getElementById("authText")
    if (authText) authText.textContent = "Sign In"
  }
}

// Utility functions - Preserved from your original code
function updateBreadcrumb(productName) {
  document.getElementById("breadcrumbProduct").textContent = productName
  document.title = `${productName} - SnackMart`
}

function showError(title, message) {
  const container = document.getElementById("productContainer")
  container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h2 class="error-title">${title}</h2>
            <p class="error-message">${message}</p>
            <a href="/product" class="back-to-products">
                <i class="fas fa-arrow-left"></i>
                Back to Products
            </a>
        </div>
    `
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  const toastMessage = toast.querySelector(".toast-message")
  const toastIcon = toast.querySelector(".toast-icon")

  toastMessage.textContent = message

  // Reset classes
  toast.className = "toast"

  if (type === "success") {
    toastIcon.className = "toast-icon fas fa-check-circle"
  } else if (type === "error") {
    toastIcon.className = "toast-icon fas fa-exclamation-circle"
    toast.classList.add("error")
  } else {
    toastIcon.className = "toast-icon fas fa-info-circle"
  }

  toast.classList.add("show")

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

function hideToast() {
  document.getElementById("toast").classList.remove("show")
}

// Scroll to top functionality - Matching index page
function initializeScrollToTop() {
  const scrollTopBtn = document.getElementById("scrollTop")
  if (!scrollTopBtn) return

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("visible")
    } else {
      scrollTopBtn.classList.remove("visible")
    }
  })
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

// Event listeners - Enhanced to match index page functionality
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
  renderCartItems()

  // Close cart when clicking outside
  document.addEventListener("click", (e) => {
    const cartPopup = document.getElementById("cartPopup")
    const cartIcon = document.querySelector(".cart-icon")

    if (cartPopup.classList.contains("active") && !cartPopup.contains(e.target) && !cartIcon.contains(e.target)) {
      toggleCart()
    }
  })

  // Close auth dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".auth-container")) {
      const dropdown = document.getElementById("logoutDropdown")
      if (dropdown) dropdown.classList.remove("active")
    }
  })

  // Close pincode modal when clicking outside
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("pincodeModal")
    const modalContent = document.querySelector(".pincode-modal-content")

    if (modal.classList.contains("active") && !modalContent.contains(e.target)) {
      closePincodeModal()
    }
  })
})

// Handle URL changes for navigation - Preserved from your original code
window.addEventListener("popstate", () => {
  loadProductDetails()
})

// Handle search on Enter key - Preserved from your original code
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch()
      }
    })
  }
})

// Error handling for network requests - Preserved from your original code
window.addEventListener("online", () => {
  showToast("Connection restored", "success")
})

window.addEventListener("offline", () => {
  showToast("No internet connection", "error")
})

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const cartPopup = document.getElementById("cartPopup")
    const pincodeModal = document.getElementById("pincodeModal")

    if (cartPopup.classList.contains("active")) {
      toggleCart()
    }

    if (pincodeModal.classList.contains("active")) {
      closePincodeModal()
    }
  }
})
