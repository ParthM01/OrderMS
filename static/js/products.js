// // Global variables
// let currentProduct = null
// let cart = JSON.parse(localStorage.getItem("cart")) || []
// let relatedProducts = []

// // API Configuration
// // const API_BASE_URL = "https://fakestoreapi.com" // Using fake store API for demo
// const PRODUCTS_API = "/api/products"

// // Initialize the page 
// document.addEventListener("DOMContentLoaded", () => {
//   initializePage()
// })

// async function initializePage() {
//   try {
//     // Get product ID from URL parameters
//     const urlParams = new URLSearchParams(window.location.search)
//     const productId = urlParams.get("id") || "1" // Default to product 1 if no ID

//     // Load product details
//     await loadProductDetails(productId)

//     // Load related products
//     await loadRelatedProducts()

//     // Update cart display
//     updateCartDisplay()
//   } catch (error) {
//     console.error("Error initializing page:", error)
//     showError("Failed to load product details. Please try again.")
//   }
// }

// // Fetch product details from API
// async function loadProductDetails(productId) {
//   try {
//     const response = await fetch(`${PRODUCTS_API}/${productId}`)
//     if (!response.ok) throw new Error("Product not found")

//     const product = await response.json()
//     currentProduct = transformProductData(product)

//     displayProductDetails(currentProduct)
//     updateBreadcrumb(currentProduct.title)
//   } catch (error) {
//     console.error("Error loading product:", error)
//     showError("Product not found or failed to load.")
//   }
// }

// // Transform API data to our format
// function transformProductData(apiProduct) {
//   return {
//     id: apiProduct.id,
//     title: apiProduct.title,
//     description: apiProduct.description,
//     price: Math.round(apiProduct.price * 80), // Convert to INR approximately
//     originalPrice: Math.round(apiProduct.price * 100), // Show discount
//     image: apiProduct.image,
//     images: [apiProduct.image, apiProduct.image, apiProduct.image], // Duplicate for demo
//     category: apiProduct.category,
//     rating: {
//       rate: apiProduct.rating.rate,
//       count: apiProduct.rating.count,
//     },
//     inStock: true,
//     isNew: Math.random() > 0.7,
//     onSale: Math.random() > 0.5,
//     details: {
//       Brand: "SnackMart Premium",
//       Category: apiProduct.category,
//       Weight: "250g",
//       "Shelf Life": "6 months",
//       Storage: "Store in cool, dry place",
//       Ingredients: "Premium quality ingredients",
//     },
//   }
// }

// // Display product details
// function displayProductDetails(product) {
//   // Hide loading state
//   document.getElementById("loadingState").style.display = "none"
//   document.getElementById("productContent").style.display = "block"

//   // Update product images
//   updateProductImages(product)

//   // Update product info
//   document.getElementById("productTitle").textContent = product.title
//   document.getElementById("productDescription").textContent = product.description

//   // Update pricing
//   updateProductPricing(product)

//   // Update rating
//   updateProductRating(product.rating)

//   // Update product details
//   updateProductDetails(product.details)

//   // Update badges
//   updateProductBadges(product)
// }

// function updateProductImages(product) {
//   const mainImage = document.getElementById("mainProductImage")
//   mainImage.src = product.image
//   mainImage.alt = product.title

//   const thumbnailContainer = document.getElementById("thumbnailImages")
//   thumbnailContainer.innerHTML = ""

//   product.images.forEach((image, index) => {
//     const thumbnail = document.createElement("div")
//     thumbnail.className = `thumbnail ${index === 0 ? "active" : ""}`
//     thumbnail.innerHTML = `<img src="${image}" alt="Product image ${index + 1}">`
//     thumbnail.onclick = () => changeMainImage(image, thumbnail)
//     thumbnailContainer.appendChild(thumbnail)
//   })
// }

// function changeMainImage(imageSrc, thumbnailElement) {
//   document.getElementById("mainProductImage").src = imageSrc

//   // Update active thumbnail
//   document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"))
//   thumbnailElement.classList.add("active")
// }

// function updateProductPricing(product) {
//   document.getElementById("currentPrice").textContent = `₹${product.price}`

//   if (product.originalPrice && product.originalPrice > product.price) {
//     const originalPriceEl = document.getElementById("originalPrice")
//     const discountBadgeEl = document.getElementById("discountBadge")
//     const savingsEl = document.getElementById("savings")
//     const savingsAmountEl = document.getElementById("savingsAmount")

//     originalPriceEl.textContent = `₹${product.originalPrice}`
//     originalPriceEl.style.display = "inline"

//     const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
//     discountBadgeEl.textContent = `${discount}% OFF`
//     discountBadgeEl.style.display = "inline"

//     const savings = product.originalPrice - product.price
//     savingsAmountEl.textContent = savings
//     savingsEl.style.display = "block"
//   }
// }

// function updateProductRating(rating) {
//   const starsContainer = document.getElementById("productStars")
//   const ratingText = document.getElementById("ratingText")

//   starsContainer.innerHTML = ""
//   const fullStars = Math.floor(rating.rate)
//   const hasHalfStar = rating.rate % 1 >= 0.5

//   for (let i = 0; i < 5; i++) {
//     const star = document.createElement("i")
//     if (i < fullStars) {
//       star.className = "fas fa-star star"
//     } else if (i === fullStars && hasHalfStar) {
//       star.className = "fas fa-star-half-alt star"
//     } else {
//       star.className = "far fa-star star empty"
//     }
//     starsContainer.appendChild(star)
//   }

//   ratingText.textContent = `${rating.rate}/5 (${rating.count} reviews)`
// }

// function updateProductDetails(details) {
//   const detailsList = document.getElementById("productDetailsList")
//   detailsList.innerHTML = ""

//   Object.entries(details).forEach(([key, value]) => {
//     const listItem = document.createElement("li")
//     listItem.innerHTML = `<strong>${key}:</strong> <span>${value}</span>`
//     detailsList.appendChild(listItem)
//   })
// }

// function updateProductBadges(product) {
//   const newBadge = document.getElementById("newBadge")
//   const saleBadge = document.getElementById("saleBadge")

//   newBadge.style.display = product.isNew ? "inline" : "none"
//   saleBadge.style.display = product.onSale ? "inline" : "none"
// }

// function updateBreadcrumb(productTitle) {
//   document.getElementById("breadcrumbProduct").textContent = productTitle
// }

// // Load related products
// async function loadRelatedProducts() {
//   try {
//     const response = await fetch(`${PRODUCTS_API}?limit=4`)
//     const products = await response.json()

//     relatedProducts = products.map(transformProductData)
//     displayRelatedProducts(relatedProducts)
//   } catch (error) {
//     console.error("Error loading related products:", error)
//     document.getElementById("relatedGrid").innerHTML = "<p>Failed to load related products.</p>"
//   }
// }

// function displayRelatedProducts(products) {
//   const relatedGrid = document.getElementById("relatedGrid")
//   relatedGrid.innerHTML = ""

//   products.forEach((product) => {
//     const productCard = createProductCard(product)
//     relatedGrid.appendChild(productCard)
//   })
// }

// function createProductCard(product) {
//   const card = document.createElement("div")
//   card.className = "product-card"
//   card.onclick = () => (window.location.href = `?id=${product.id}`)

//   const stars = generateStarsHTML(product.rating.rate)

//   card.innerHTML = `
//         <img src="${product.image}" alt="${product.title}" class="product-card-image">
//         <div class="product-card-content">
//             <h3 class="product-card-title">${product.title}</h3>
//             <div class="product-card-price">₹${product.price}</div>
//             <div class="product-card-rating">
//                 ${stars}
//                 <span>(${product.rating.count})</span>
//             </div>
//         </div>
//     `

//   return card
// }

// function generateStarsHTML(rating) {
//   let starsHTML = ""
//   const fullStars = Math.floor(rating)
//   const hasHalfStar = rating % 1 >= 0.5

//   for (let i = 0; i < 5; i++) {
//     if (i < fullStars) {
//       starsHTML += '<i class="fas fa-star star"></i>'
//     } else if (i === fullStars && hasHalfStar) {
//       starsHTML += '<i class="fas fa-star-half-alt star"></i>'
//     } else {
//       starsHTML += '<i class="far fa-star star empty"></i>'
//     }
//   }

//   return starsHTML
// }

// // Quantity controls
// function increaseQuantity() {
//   const quantityInput = document.getElementById("quantity")
//   const currentValue = Number.parseInt(quantityInput.value)
//   const maxValue = Number.parseInt(quantityInput.max)

//   if (currentValue < maxValue) {
//     quantityInput.value = currentValue + 1
//   }
// }

// function decreaseQuantity() {
//   const quantityInput = document.getElementById("quantity")
//   const currentValue = Number.parseInt(quantityInput.value)
//   const minValue = Number.parseInt(quantityInput.min)

//   if (currentValue > minValue) {
//     quantityInput.value = currentValue - 1
//   }
// }

// // Cart functionality
// function addToCart() {
//   if (!currentProduct) return

//   const quantity = Number.parseInt(document.getElementById("quantity").value)
//   const existingItem = cart.find((item) => item.id === currentProduct.id)

//   if (existingItem) {
//     existingItem.quantity += quantity
//   } else {
//     cart.push({
//       id: currentProduct.id,
//       title: currentProduct.title,
//       price: currentProduct.price,
//       image: currentProduct.image,
//       quantity: quantity,
//     })
//   }

//   localStorage.setItem("cart", JSON.stringify(cart))
//   updateCartDisplay()
//   showToast("Item added to cart!")
// }

// function buyNow() {
//   addToCart()
//   // Redirect to checkout or show checkout modal
//   alert("Redirecting to checkout...")
// }

// function updateCartDisplay() {
//   const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
//   const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

//   document.getElementById("cartCount").textContent = cartCount
//   document.getElementById("cartBadge").textContent = cartCount
//   document.getElementById("cartTotal").textContent = cartTotal

//   // Update cart content
//   const cartContent = document.getElementById("cartContent")

//   if (cart.length === 0) {
//     cartContent.innerHTML = `
//             <div class="empty-cart">
//                 <div class="empty-icon">🛒</div>
//                 <h4>Your cart is empty</h4>
//                 <p>Add some delicious snacks to get started!</p>
//             </div>
//         `
//     document.getElementById("checkoutBtn").disabled = true
//   } else {
//     cartContent.innerHTML = cart
//       .map(
//         (item) => `
//             <div class="cart-item">
//                 <img src="${item.image}" alt="${item.title}" class="cart-item-image">
//                 <div class="cart-item-details">
//                     <div class="cart-item-title">${item.title}</div>
//                     <div class="cart-item-price">₹${item.price}</div>
//                     <div class="cart-item-quantity">
//                         <button onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
//                         <span>${item.quantity}</span>
//                         <button onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
//                         <button onclick="removeFromCart(${item.id})" style="margin-left: 1rem; color: #ff6b6b;">
//                             <i class="fas fa-trash"></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         `,
//       )
//       .join("")
//     document.getElementById("checkoutBtn").disabled = false
//   }
// }

// function updateCartItemQuantity(productId, change) {
//   const item = cart.find((item) => item.id === productId)
//   if (item) {
//     item.quantity += change
//     if (item.quantity <= 0) {
//       removeFromCart(productId)
//     } else {
//       localStorage.setItem("cart", JSON.stringify(cart))
//       updateCartDisplay()
//     }
//   }
// }

// function removeFromCart(productId) {
//   cart = cart.filter((item) => item.id !== productId)
//   localStorage.setItem("cart", JSON.stringify(cart))
//   updateCartDisplay()
//   showToast("Item removed from cart")
// }

// // Cart sidebar toggle
// function toggleCart() {
//   const cartSidebar = document.getElementById("cartSidebar")
//   const cartOverlay = document.getElementById("cartOverlay")

//   cartSidebar.classList.toggle("open")
//   cartOverlay.classList.toggle("active")
// }

// // Toast notification
// function showToast(message) {
//   const toast = document.getElementById("toast")
//   const toastMessage = document.querySelector(".toast-message")

//   toastMessage.textContent = message
//   toast.classList.add("show")

//   setTimeout(() => {
//     toast.classList.remove("show")
//   }, 3000)
// }

// function hideToast() {
//   document.getElementById("toast").classList.remove("show")
// }

// // Location modal
// function openLocationModal() {
//   document.getElementById("locationModal").classList.add("active")
// }

// function closeLocationModal() {
//   document.getElementById("locationModal").classList.remove("active")
// }

// function updateLocation() {
//   const pincode = document.getElementById("pincodeInput").value
//   if (pincode) {
//     // Update location display (simplified)
//     document.querySelector(".pincode").textContent = pincode
//     document.querySelector(".location-name").textContent = "Updated Location"
//     closeLocationModal()
//     showToast("Location updated successfully!")
//   }
// }

// // Search functionality
// function performSearch() {
//   const searchTerm = document.getElementById("searchInput").value
//   if (searchTerm.trim()) {
//     // Redirect to search results page
//     window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`
//   }
// }

// // Handle search on Enter key
// document.getElementById("searchInput").addEventListener("keypress", (e) => {
//   if (e.key === "Enter") {
//     performSearch()
//   }
// })

// // Error handling
// function showError(message) {
//   const productContainer = document.getElementById("productContainer")
//   productContainer.innerHTML = `
//         <div class="error-state">
//             <div class="error-icon">⚠️</div>
//             <h3>Oops! Something went wrong</h3>
//             <p>${message}</p>
//             <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
//         </div>
//     `
// }

// // Checkout functionality
// document.getElementById("checkoutBtn").addEventListener("click", () => {
//   if (cart.length > 0) {
//     alert("Proceeding to checkout...\nTotal: ₹" + cart.reduce((total, item) => total + item.price * item.quantity, 0))
//     // Here you would typically redirect to a checkout page
//   }
// })

// // Close modals on escape key
// document.addEventListener("keydown", (e) => {
//   if (e.key === "Escape") {
//     closeLocationModal()
//     if (document.getElementById("cartSidebar").classList.contains("open")) {
//       toggleCart()
//     }
//   }
// })

// // Handle window resize for responsive cart
// window.addEventListener("resize", () => {
//   if (window.innerWidth > 768) {
//     const cartSidebar = document.getElementById("cartSidebar")
//     if (cartSidebar.classList.contains("open")) {
//       cartSidebar.style.width = "400px"
//     }
//   }
// })

// Make functions globally accessible
// Global variables - Keep your existing structure
window.filteredProducts = []
window.currentPage = 1
window.productsPerPage = 9

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality from index.js if available
  const initializeWebsite = window.initializeWebsite || (() => {})
  const checkAuthState = window.checkAuthState || (() => {})
  const updateCartCount = window.updateCartCount || (() => {})

  initializeWebsite()
  checkAuthState()
  updateCartCount()

  // Fetch and render products
  window.fetchAndRenderProducts()
})

// Get DOM elements
const productsContainer = document.getElementById("productsContainer")

// Your existing fetchAndRenderProducts function - PRESERVED
window.fetchAndRenderProducts = async () => {
  try {
    console.log("Fetching products...")
    const response = await fetch("/api/products")
    if (!response.ok) throw new Error("Failed to fetch products")

    const products = await response.json()
    console.log("Products received:", products)

    if (!products || !Array.isArray(products)) {
      throw new Error("Invalid products data received")
    }

    window.filteredProducts = products
    console.log("Filtered products:", window.filteredProducts)
    window.renderProducts(products)
    updateProductCount(products.length)
  } catch (error) {
    console.error("Error fetching products:", error)
    productsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `
  }
}

// Enhanced renderProducts function with variant dropdowns and + icon
window.renderProducts = (products) => {
  productsContainer.innerHTML = "" // clear loading spinner

  if (!products.length) {
    productsContainer.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-box-open"></i>
                <p>No products available at the moment.</p>
            </div>
        `
    return
  }

  // Calculate pagination
  const totalPages = Math.ceil(products.length / window.productsPerPage)
  const startIndex = (window.currentPage - 1) * window.productsPerPage
  const endIndex = startIndex + window.productsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  // Render products with enhanced design and variant dropdowns
  currentProducts.forEach((product) => {
    const card = document.createElement("div")
    card.className = "product-card"
    card.setAttribute("data-category", product.category || "uncategorized")
    card.setAttribute("data-product-id", product.id)

    // Create mock variants with different prices if not available
    const variants =
      product.variants && product.variants.length > 0
        ? product.variants
        : [
            { packing: "250g", price: product.price_01 || 100 },
            { packing: "500g", price: (product.price_01 || 100) * 1.8 },
          ]

    // Show max price prominently
    const maxPrice = Math.max(...variants.map((v) => v.price))
    const minPrice = Math.min(...variants.map((v) => v.price))

    card.innerHTML = `
    <div class="product-image" onclick="goToProductDetails(${product.id})">
  <img src="${product.image_url|| 'images/.png'}"
       alt="${product.item_name}"
       loading="lazy"
       onload="this.parentElement.classList.add('loaded')"
       onerror="this.src='images/placeholder.png'; this.classList.add('image-error');" />
</div>
            <div class="product-info">
                <h3 onclick="goToProductDetails(${product.id})">${product.item_name || "Unnamed Product"}</h3>
                
                <div class="product-price-container">
                    <div class="product-price" id="price-${product.id}">₹${maxPrice.toFixed(2)}</div>
                    <div class="price-info">Starting from ₹${minPrice.toFixed(2)}</div>
                </div>
                
                <p class="product-description" onclick="goToProductDetails(${product.id})">${product.description || "Delicious snack made with premium ingredients"}</p>
                
                <div class="product-variants">
                    <select class="variants-dropdown" id="variant-${product.id}" onclick="event.stopPropagation();" onchange="updateProductPrice(${product.id}, this.value, this.options[this.selectedIndex].text)">
                        ${variants
                          .map(
                            (v, i) => `
                            <option value="${v.price}" ${i === 0 ? "selected" : ""}>
                                ${v.packing} - ₹${v.price.toFixed(2)}
                            </option>
                        `,
                          )
                          .join("")}
                    </select>
                </div>
                
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `

    // Add function to window object for onclick handlers
    window.goToProductDetails = (productId) => {
      window.location.href = `/product-details.html?id=${productId}`
    }

    // Add the updateProductPrice function to handle variant selection
    window.updateProductPrice = (productId, price, variantText) => {
      // Update the displayed price
      const priceElement = document.getElementById(`price-${productId}`)
      if (priceElement) {
        priceElement.textContent = `₹${Number.parseFloat(price).toFixed(2)}`
      }

      // Store selected variant data for cart
      const productCard = document.querySelector(`[data-product-id="${productId}"]`)
      if (productCard) {
        productCard.setAttribute("data-selected-price", price)
        productCard.setAttribute("data-selected-variant", variantText.split(" - ")[0])
      }

      // Prevent navigation
      event.preventDefault()
      return false
    }

    productsContainer.appendChild(card)
  })

  // Update pagination UI
  const pagination = document.getElementById("pagination")
  if (totalPages > 1) {
    pagination.style.display = "flex"
    const pageNumbers = document.getElementById("pageNumbers")
    pageNumbers.innerHTML = `Page ${window.currentPage} of ${totalPages}`

    // Update button states
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")
    if (prevBtn) prevBtn.disabled = window.currentPage === 1
    if (nextBtn) nextBtn.disabled = window.currentPage === totalPages
  } else {
    pagination.style.display = "none"
  }
}

// Your existing filter functions - PRESERVED
window.applyFilters = () => {
  const category = document.getElementById("categoryFilter").value
  const priceRange = document.getElementById("priceFilter").value
  const sortBy = document.getElementById("sortFilter").value
  const searchQuery = document.getElementById("searchBox").value.toLowerCase()

  const filtered = window.filteredProducts.filter((product) => {
    if (category && product.category !== category) return false
    if (searchQuery && !product.item_name.toLowerCase().includes(searchQuery)) return false

    if (priceRange) {
      const price = Number.parseFloat(product.price_01)
      const [min, max] = priceRange.split("-").map((p) => (p === "+" ? Number.POSITIVE_INFINITY : Number.parseFloat(p)))
      if (price < min || price > max) return false
    }

    return true
  })

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price_01 || 0) - (b.price_01 || 0)
      case "price-high":
        return (b.price_01 || 0) - (a.price_01 || 0)
      case "name":
        return (a.item_name || "").localeCompare(b.item_name || "")
      default:
        return 0
    }
  })

  window.currentPage = 1 // Reset to first page when filtering
  window.renderProducts(filtered)
  updateProductCount(filtered.length)
}

// Your existing setQuickFilter function - PRESERVED
window.setQuickFilter = (category) => {
  document.getElementById("categoryFilter").value = category === "all" ? "" : category
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase().includes(category) || (category === "all" && btn.textContent.includes("All")),
    )
  })
  window.applyFilters()
}

// Your existing changePage function - PRESERVED
window.changePage = (delta) => {
  const totalPages = Math.ceil(window.filteredProducts.length / window.productsPerPage)
  window.currentPage = Math.max(1, Math.min(window.currentPage + delta, totalPages))
  window.renderProducts(window.filteredProducts)
}

// Enhanced addToCart function with variant support - ENHANCED VERSION OF YOUR EXISTING FUNCTION
window.addToCart = async (productId) => {
  console.log("Adding product to cart, ID:", productId)
  console.log("Current filtered products:", window.filteredProducts)

  // Disable button and show loading state
  const button = document.querySelector(`button[onclick*="addToCart(${productId})"]`)
  if (button) {
    button.disabled = true
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  }

  try {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    console.log("Current cart:", cart)

    // Get selected variant data from dropdown
    const variantDropdown = document.getElementById(`variant-${productId}`)
    const selectedPrice = variantDropdown ? Number.parseFloat(variantDropdown.value) : null
    const selectedVariant = variantDropdown
      ? variantDropdown.options[variantDropdown.selectedIndex].text.split(" - ")[0]
      : null

    // Find the product in filteredProducts
    const product = window.filteredProducts.find((p) => p.id === Number.parseInt(productId))
    console.log("Found product:", product)

    if (!product) {
      throw new Error("Product not found")
    }

    // Use selected price or fallback to default
    const finalPrice = selectedPrice || product.price_01 || 100
    const finalVariant = selectedVariant || "250g"

    // Check if product already exists in cart with same variant
    const existingItemIndex = cart.findIndex(
      (item) => item.id === Number.parseInt(productId) && item.variant === finalVariant,
    )

    if (existingItemIndex !== -1) {
      // Update quantity if product exists with same variant
      cart[existingItemIndex].quantity += 1
    } else {
      // Add new item if product doesn't exist or different variant
      const cartItem = {
        id: Number.parseInt(productId),
        name: product.item_name,
        price: finalPrice,
        description: product.description,
        icon: product.icon || "🍪",
        image: product.image_url,
        category: product.category,
        quantity: 1,
        variant: finalVariant,
        originalPrice: finalPrice + 20, // Mock original price for savings calculation
      }
      cart.push(cartItem)
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count and display
    const updateCartCount = window.updateCartCount || (() => {})
    const updateCartDisplay = window.updateCartDisplay || (() => {})

    updateCartCount()
    updateCartDisplay()

    // Show success message
    const toast = document.createElement("div")
    toast.className = "toast success"
    toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${product.item_name} (${finalVariant}) added to cart!
        `
    document.body.appendChild(toast)

    // Add floating animation
    const cartIcon = document.querySelector(".cart-icon")
    if (cartIcon && button) {
      // Add pulse animation to cart icon
      cartIcon.classList.add("pulse")
      setTimeout(() => cartIcon.classList.remove("pulse"), 300)

      // Add floating animation from button to cart
      const floatingItem = document.createElement("div")
      floatingItem.className = "floating-cart-item"
      floatingItem.innerHTML = product.icon || "🍪"
      document.body.appendChild(floatingItem)

      // Get positions
      const cartRect = cartIcon.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()

      // Set initial position
      floatingItem.style.top = `${buttonRect.top}px`
      floatingItem.style.left = `${buttonRect.left}px`

      // Animate to cart
      requestAnimationFrame(() => {
        floatingItem.style.top = `${cartRect.top}px`
        floatingItem.style.left = `${cartRect.left}px`
        floatingItem.style.opacity = "0"
        floatingItem.style.transform = "scale(0.5)"
      })

      // Remove floating item and success message after animation
      setTimeout(() => {
        floatingItem.remove()
        toast.remove()
      }, 500)
    } else {
      // If no animation possible, just remove the toast after a delay
      setTimeout(() => toast.remove(), 3000)
    }

    // Try to sync with server if available - YOUR EXISTING SERVER SYNC CODE
    try {
      const response = await fetch("/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      })

      if (!response.ok) {
        throw new Error(`Failed to sync cart: ${response.status}`)
      }

      const result = await response.json()
      if (result.data && result.data.cart) {
        // Update local cart if server made any changes
        localStorage.setItem("cart", JSON.stringify(result.data.cart))
        updateCartCount()
      }
    } catch (syncError) {
      console.warn("Failed to sync cart with server:", syncError)
      // Don't show error to user as the item was still added locally
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    const toast = document.createElement("div")
    toast.className = "toast error"
    toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Failed to add item to cart. Please try again.
        `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  } finally {
    const button = document.querySelector(`button[onclick*="addToCart(${productId})"]`)
    if (button) {
      button.disabled = false
      button.innerHTML = '<i class="fas fa-plus"></i>'
    }
  }
}

// Additional functions for enhanced functionality
window.setGridView = (columns) => {
  const productGrid = document.getElementById("productsContainer")
  const viewBtns = document.querySelectorAll(".view-btn")

  // Remove active class from all buttons
  viewBtns.forEach((btn) => btn.classList.remove("active"))

  // Add active class to clicked button
  event.target.closest(".view-btn").classList.add("active")

  // Update grid columns
  switch (columns) {
    case 2:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(400px, 1fr))"
      break
    case 3:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))"
      break
    case 4:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))"
      break
    default:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))"
  }
}

// Update product count display
function updateProductCount(count) {
  const productCountElement = document.getElementById("productCount")
  if (productCountElement) {
    productCountElement.textContent = count
  }
}

// Cart toggle function
window.toggleCart = () => {
  const cartPopup = document.getElementById("cartPopup")
  if (cartPopup) {
    cartPopup.classList.toggle("active")
    if (cartPopup.classList.contains("active")) {
      document.body.style.overflow = "hidden"
      if (typeof window.renderCartItems === "function") {
        window.renderCartItems()
      }
    } else {
      document.body.style.overflow = ""
    }
  }
}

// Update cart count function
function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const cartCountElement = document.getElementById("cartCount")
    if (cartCountElement) {
      cartCountElement.textContent = totalCount
    }
  } catch (error) {
    console.error("Error updating cart count:", error)
  }
}

// Auth functions - integrate with index.js functionality
window.toggleAuth = () => {
  if (typeof window.toggleAuth !== "undefined") {
    // Use index.js auth function if available
    return
  }

  // Fallback auth toggle
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

window.confirmLogout = () => {
  localStorage.removeItem("user")
  const authText = document.getElementById("authText")
  if (authText) authText.textContent = "Sign In"
  const dropdown = document.getElementById("logoutDropdown")
  if (dropdown) dropdown.classList.remove("active")
  window.location.href = "/"
}

window.cancelLogout = () => {
  const dropdown = document.getElementById("logoutDropdown")
  if (dropdown) dropdown.classList.remove("active")
}

// Pincode functions - integrate with index.js functionality
window.openPincodeModal = () => {
  if (typeof window.openPincodeModal !== "undefined") {
    return
  }
  document.getElementById("pincodeModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

window.closePincodeModal = () => {
  document.getElementById("pincodeModal").classList.remove("active")
  document.body.style.overflow = ""
}
