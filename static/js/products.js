// Global variables
window.allProducts = []
window.filteredProducts = []
window.currentPage = 1
window.productsPerPage = 12
window.currentCategory = "all"
window.currentSearchQuery = ""
window.lastScrollY = 0

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite()
  checkAuthState()
  updateCartCount()
  fetchAndRenderProducts()
  setupScrollHandler()
})

// Initialize website functionality
function initializeWebsite() {
  // Set up search functionality for both desktop and mobile
  const searchBox = document.getElementById("searchBox")
  const mobileSearchBox = document.getElementById("mobileSearchBox")

  if (searchBox) {
    searchBox.addEventListener("input", debounce(handleSearchInput, 300))
    searchBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch()
      }
    })
    searchBox.addEventListener("focus", showAutocomplete)
  }

  if (mobileSearchBox) {
    mobileSearchBox.addEventListener("input", debounce(handleMobileSearchInput, 300))
    mobileSearchBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performMobileSearch()
      }
    })
    mobileSearchBox.addEventListener("focus", showMobileAutocomplete)
  }

  // Update welcome message
  updateWelcomeMessage()

  // Set up click outside handlers
  setupClickOutsideHandlers()

  // Sync mobile and desktop cart counts
  syncCartCounts()
}

// Setup scroll handler for mobile navbar hide/show
function setupScrollHandler() {
  if (window.innerWidth <= 768) {
    let ticking = false

    function updateNavbar() {
      const header = document.getElementById("header")
      const currentScrollY = window.scrollY

      if (currentScrollY > window.lastScrollY && currentScrollY > 100) {
        // Scrolling down
        header.classList.add("hidden")
      } else {
        // Scrolling up
        header.classList.remove("hidden")
      }

      window.lastScrollY = currentScrollY
      ticking = false
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar)
        ticking = true
      }
    })
  }
}

// Sync cart counts between mobile and desktop
function syncCartCounts() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const cartCountElement = document.getElementById("cartCount")
  const mobileCartCountElement = document.getElementById("mobileCartCount")

  if (cartCountElement) {
    cartCountElement.textContent = totalCount
  }
  if (mobileCartCountElement) {
    mobileCartCountElement.textContent = totalCount
  }
}

// Check authentication state and update UI
function checkAuthState() {
  try {
    const user = JSON.parse(localStorage.getItem("user"))
    const authText = document.getElementById("authText")
    const mobileAuthButton = document.getElementById("mobileAuthButton")
    const dropdownUserName = document.getElementById("dropdownUserName")
    const dropdownUserEmail = document.getElementById("dropdownUserEmail")

    if (user && user.first_name) {
      if (authText) {
        authText.textContent = `Hi ${user.first_name}`
      }
      if (dropdownUserName) {
        dropdownUserName.textContent = `${user.first_name} ${user.last_name || ""}`
      }
      if (dropdownUserEmail) {
        dropdownUserEmail.textContent = user.email || "user@example.com"
      }
    } else {
      if (authText) {
        authText.textContent = "Sign In"
      }
    }
  } catch (error) {
    console.error("Error checking auth state:", error)
  }
}

// Update welcome message - removed username
function updateWelcomeMessage() {
  // Welcome message now only shows "Welcome to Gokhale Bandu" without username
}

// Fetch and render products from API
async function fetchAndRenderProducts() {
  try {
    console.log("Fetching products from API...")
    showLoadingState()

    const response = await fetch("/api/products")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const products = await response.json()
    console.log("Products received from API:", products)

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error("No products received from API")
    }

    // Process products to ensure proper variant structure
    const processedProducts = products.map((product) => {
      if (!product.variants || product.variants.length === 0) {
        // Create default variants if none exist
        const basePrice = product.price_01 || 100
        product.variants = [
          { packing: "1000gm", price: Math.round(basePrice * 3.2) },
          { packing: "500gm", price: Math.round(basePrice * 1.8) },
          { packing: "250gm", price: basePrice },
        ]
      } else {
        // Sort variants by price (highest first) and weight (highest first)
        product.variants.sort((a, b) => {
          const priceA = a.price || 0
          const priceB = b.price || 0
          const weightA = Number.parseInt(a.packing) || 0
          const weightB = Number.parseInt(b.packing) || 0

          // First sort by price (descending), then by weight (descending)
          if (priceB !== priceA) {
            return priceB - priceA
          }
          return weightB - weightA
        })
      }

      return product
    })

    window.allProducts = processedProducts
    window.filteredProducts = processedProducts

    renderProducts(processedProducts)
    updateProductCount()
  } catch (error) {
    console.error("Error fetching products:", error)
    showError("Failed to load products. Please check your connection and try again.")
  }
}

// Show loading state
function showLoadingState() {
  const productsContainer = document.getElementById("productsContainer")
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Loading delicious products...</div>
      </div>
    `
  }
}

// Handle search input with autocomplete
function handleSearchInput() {
  const searchBox = document.getElementById("searchBox")
  if (searchBox) {
    window.currentSearchQuery = searchBox.value.toLowerCase().trim()
    updateAutocomplete()

    if (window.currentSearchQuery === "") {
      hideAutocomplete()
      applyFilters()
    }
  }
}

// Handle mobile search input
function handleMobileSearchInput() {
  const mobileSearchBox = document.getElementById("mobileSearchBox")
  if (mobileSearchBox) {
    window.currentSearchQuery = mobileSearchBox.value.toLowerCase().trim()
    updateMobileAutocomplete()

    if (window.currentSearchQuery === "") {
      hideMobileAutocomplete()
      applyFilters()
    }
  }
}

// Show autocomplete dropdown
function showAutocomplete() {
  const autocompleteDropdown = document.getElementById("autocompleteDropdown")
  if (autocompleteDropdown && window.allProducts.length > 0) {
    updateAutocomplete()
  }
}

// Show mobile autocomplete dropdown
function showMobileAutocomplete() {
  const mobileAutocompleteDropdown = document.getElementById("mobileAutocompleteDropdown")
  if (mobileAutocompleteDropdown && window.allProducts.length > 0) {
    updateMobileAutocomplete()
  }
}

// Update autocomplete suggestions
function updateAutocomplete() {
  const autocompleteDropdown = document.getElementById("autocompleteDropdown")
  const searchBox = document.getElementById("searchBox")

  if (!autocompleteDropdown || !searchBox) return

  const query = searchBox.value.toLowerCase().trim()

  if (query === "") {
    hideAutocomplete()
    return
  }

  // Get matching products
  const matches = window.allProducts
    .filter(
      (product) =>
        (product.item_name && product.item_name.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query)),
    )
    .slice(0, 5) // Limit to 5 suggestions

  if (matches.length === 0) {
    hideAutocomplete()
    return
  }

  autocompleteDropdown.innerHTML = matches
    .map(
      (product) => `
    <div class="autocomplete-item" onclick="selectProduct('${product.item_name}')">
      <i class="fas fa-search"></i>
      <span>${product.item_name}</span>
    </div>
  `,
    )
    .join("")

  autocompleteDropdown.classList.add("active")
}

// Update mobile autocomplete suggestions
function updateMobileAutocomplete() {
  const mobileAutocompleteDropdown = document.getElementById("mobileAutocompleteDropdown")
  const mobileSearchBox = document.getElementById("mobileSearchBox")

  if (!mobileAutocompleteDropdown || !mobileSearchBox) return

  const query = mobileSearchBox.value.toLowerCase().trim()

  if (query === "") {
    hideMobileAutocomplete()
    return
  }

  // Get matching products
  const matches = window.allProducts
    .filter(
      (product) =>
        (product.item_name && product.item_name.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query)),
    )
    .slice(0, 5) // Limit to 5 suggestions

  if (matches.length === 0) {
    hideMobileAutocomplete()
    return
  }

  mobileAutocompleteDropdown.innerHTML = matches
    .map(
      (product) => `
    <div class="autocomplete-item" onclick="selectMobileProduct('${product.item_name}')">
      <i class="fas fa-search"></i>
      <span>${product.item_name}</span>
    </div>
  `,
    )
    .join("")

  mobileAutocompleteDropdown.classList.add("active")
}

// Hide autocomplete dropdown
function hideAutocomplete() {
  const autocompleteDropdown = document.getElementById("autocompleteDropdown")
  if (autocompleteDropdown) {
    autocompleteDropdown.classList.remove("active")
  }
}

// Hide mobile autocomplete dropdown
function hideMobileAutocomplete() {
  const mobileAutocompleteDropdown = document.getElementById("mobileAutocompleteDropdown")
  if (mobileAutocompleteDropdown) {
    mobileAutocompleteDropdown.classList.remove("active")
  }
}

// Select product from autocomplete
function selectProduct(productName) {
  const searchBox = document.getElementById("searchBox")
  const mobileSearchBox = document.getElementById("mobileSearchBox")

  if (searchBox) {
    searchBox.value = productName
  }
  if (mobileSearchBox) {
    mobileSearchBox.value = productName
  }

  window.currentSearchQuery = productName.toLowerCase()
  hideAutocomplete()
  hideMobileAutocomplete()
  performSearch()
}

// Select product from mobile autocomplete
function selectMobileProduct(productName) {
  const mobileSearchBox = document.getElementById("mobileSearchBox")
  const searchBox = document.getElementById("searchBox")

  if (mobileSearchBox) {
    mobileSearchBox.value = productName
  }
  if (searchBox) {
    searchBox.value = productName
  }

  window.currentSearchQuery = productName.toLowerCase()
  hideMobileAutocomplete()
  hideAutocomplete()
  performSearch()
}

// Perform search - prioritize matching products
function performSearch() {
  const searchBox = document.getElementById("searchBox")
  if (!searchBox) return

  window.currentSearchQuery = searchBox.value.toLowerCase().trim()
  hideAutocomplete()
  hideMobileAutocomplete()

  if (window.currentSearchQuery === "") {
    applyFilters()
    return
  }

  // Get exact matches and partial matches
  const exactMatches = []
  const partialMatches = []
  const otherProducts = []

  window.allProducts.forEach((product) => {
    const name = (product.item_name || "").toLowerCase()
    const description = (product.description || "").toLowerCase()
    const category = (product.category || "").toLowerCase()

    if (name === window.currentSearchQuery) {
      exactMatches.push(product)
    } else if (
      name.includes(window.currentSearchQuery) ||
      description.includes(window.currentSearchQuery) ||
      category.includes(window.currentSearchQuery)
    ) {
      partialMatches.push(product)
    } else {
      otherProducts.push(product)
    }
  })

  // Combine results: exact matches first, then partial matches, then other products
  const searchResults = [...exactMatches, ...partialMatches, ...otherProducts]

  // Reset category filter when searching
  window.currentCategory = "all"
  updateActiveFilterButton("all")

  window.filteredProducts = searchResults
  window.currentPage = 1
  renderProducts(searchResults)
  updateProductCount()

  // Show search results message
  if (exactMatches.length === 0 && partialMatches.length === 0) {
    showToast(`No direct matches found for "${window.currentSearchQuery}", showing all products`, "info")
  } else {
    showToast(
      `Found ${exactMatches.length + partialMatches.length} matches for "${window.currentSearchQuery}"`,
      "success",
    )
  }
}

// Perform mobile search
function performMobileSearch() {
  const mobileSearchBox = document.getElementById("mobileSearchBox")
  if (!mobileSearchBox) return

  window.currentSearchQuery = mobileSearchBox.value.toLowerCase().trim()
  hideAutocomplete()
  hideMobileAutocomplete()

  // Sync with desktop search box
  const searchBox = document.getElementById("searchBox")
  if (searchBox) {
    searchBox.value = mobileSearchBox.value
  }

  performSearch()
}

// Render products with enhanced design
function renderProducts(products) {
  const productsContainer = document.getElementById("productsContainer")
  if (!productsContainer) return

  productsContainer.innerHTML = ""

  if (!products.length) {
    showNoResults("No products available at the moment.")
    return
  }

  // Check if mobile view
  const isMobile = window.innerWidth <= 768

  if (isMobile) {
    // Mobile: Show all products without pagination
    renderMobileProducts(products)
  } else {
    // Desktop: Use pagination
    renderDesktopProducts(products)
  }
}

// Render mobile products (no pagination)
function renderMobileProducts(products) {
  const productsContainer = document.getElementById("productsContainer")

  products.forEach((product, index) => {
    const card = document.createElement("div")
    card.className = "product-card"
    card.setAttribute("data-category", product.category || "uncategorized")
    card.setAttribute("data-product-id", product.id)
    card.style.animationDelay = `${index * 0.1}s`

    // Get highest price and weight variant (already sorted)
    const maxVariant = product.variants[0]
    const minVariant = product.variants[product.variants.length - 1]

    // Calculate discount percentage - using mobile version
    const originalPrice = maxVariant.price + Math.round(maxVariant.price * 0.2) // 20% markup for original price
    const discountPercent = Math.round(((originalPrice - maxVariant.price) / originalPrice) * 100)

    card.innerHTML = `
      <div class="product-row">
        <div class="product-image" onclick="goToProductDetails(${product.id})">
          <img src="${product.image_url || "/placeholder.svg?height=100&width=120"}"
               alt="${product.item_name}"
               loading="lazy"
               onerror="this.src='/placeholder.svg?height=100&width=120';" />
        </div>
        <div class="product-details">
          <h3 class="product-name" onclick="goToProductDetails(${product.id})">${product.item_name || "Unnamed Product"}</h3>
          
          <div class="price-info-line">
            <span>Gokhale's MRP</span>
          </div>
          
          <div class="price-values-line">
            <span class="mrp">₹${originalPrice.toFixed(2)}</span>
            <span class="discounted-price" id="price-${product.id}">₹${maxVariant.price.toFixed(2)}</span>
          </div>
          
          <div class="tax-note">Inclusive of all taxes</div>
          
          <div class="discount-box">${discountPercent}% OFF</div>
          
        </div>
      </div>
      
      <div class="product-bottom">
        <div class="variant-left">
          <select class="variants-dropdown" id="variant-${product.id}" onchange="updateProductPrice(${product.id}, this.value, this.options[this.selectedIndex].text)">
            ${product.variants
              .map(
                (variant, i) => `
                <option value="${variant.price}" ${i === 0 ? "selected" : ""}>
                  ${variant.packing} - ₹${variant.price.toFixed(2)}
                </option>
              `,
              )
              .join("")}
          </select>
        </div>
        <button class="add-to-cart" onclick="addToCart(${product.id})">
          <i class="fas fa-shopping-cart"></i>
          Add
        </button>
      </div>
    `

    productsContainer.appendChild(card)
  })
}

// Render desktop products (with pagination) - Updated to match mobile discount style
function renderDesktopProducts(products) {
  const productsContainer = document.getElementById("productsContainer")

  // Calculate pagination
  const totalPages = Math.ceil(products.length / window.productsPerPage)
  const startIndex = (window.currentPage - 1) * window.productsPerPage
  const endIndex = startIndex + window.productsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  // Render products with staggered animation
  currentProducts.forEach((product, index) => {
    const card = document.createElement("div")
    card.className = "product-card"
    card.setAttribute("data-category", product.category || "uncategorized")
    card.setAttribute("data-product-id", product.id)
    card.style.animationDelay = `${index * 0.1}s`

    // Get highest price and weight variant (already sorted)
    const maxVariant = product.variants[0]
    const minVariant = product.variants[product.variants.length - 1]

    // Calculate discount percentage - using same logic as mobile
    const originalPrice = maxVariant.price + Math.round(maxVariant.price * 0.2) // 20% markup for original price
    const discountPercent = Math.round(((originalPrice - maxVariant.price) / originalPrice) * 100)

    card.innerHTML = `
      <div class="product-image" onclick="goToProductDetails(${product.id})">
        <img src="${product.image_url || "/placeholder.svg?height=200&width=300"}"
             alt="${product.item_name}"
             loading="lazy"
             onerror="this.src='/placeholder.svg?height=200&width=300';" />
      </div>
      <div class="product-info">
        <h3 onclick="goToProductDetails(${product.id})">${product.item_name || "Unnamed Product"}</h3>
        
        <p class="product-description" onclick="goToProductDetails(${product.id})">${product.description || "Delicious traditional snack made with premium ingredients"}</p>
        
        <div class="product-price-container">
          <div class="product-pricing">
            <div class="product-price" id="price-${product.id}">₹${maxVariant.price.toFixed(2)}</div>
            <div class="original-price">₹${originalPrice.toFixed(2)}</div>
            <div class="discount-badge">${discountPercent}% OFF</div>
          </div>
          <div class="price-info">Starting from ₹${minVariant.price.toFixed(2)} </div>
        </div>
        
        <div class="product-actions">
          <select class="variants-dropdown" id="variant-${product.id}" onchange="updateProductPrice(${product.id}, this.value, this.options[this.selectedIndex].text)">
            ${product.variants
              .map(
                (variant, i) => `
                <option value="${variant.price}" ${i === 0 ? "selected" : ""}>
                  ${variant.packing} - ₹${variant.price.toFixed(2)}
                </option>
              `,
              )
              .join("")}
          </select>
          <button class="add-to-cart" onclick="addToCart(${product.id})" title="Add to Cart">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    `

    productsContainer.appendChild(card)
  })

  // Update pagination
  updatePagination(totalPages)
}

// Update product price when variant changes
function updateProductPrice(productId, price, variantText) {
  const priceElement = document.getElementById(`price-${productId}`)
  if (priceElement) {
    priceElement.textContent = `₹${Number.parseFloat(price).toFixed(2)}`
  }

  // Store selected variant data
  const productCard = document.querySelector(`[data-product-id="${productId}"]`)
  if (productCard) {
    productCard.setAttribute("data-selected-price", price)
    productCard.setAttribute("data-selected-variant", variantText.split(" - ")[0])
  }
}

// Apply filters
function applyFilters() {
  let filtered = [...window.allProducts]

  // Apply category filter
  if (window.currentCategory && window.currentCategory !== "all") {
    filtered = filtered.filter(
      (product) => product.category && product.category.toLowerCase() === window.currentCategory.toLowerCase(),
    )
  }

  // Apply search filter if there's a search query
  if (window.currentSearchQuery) {
    const exactMatches = []
    const partialMatches = []
    const otherProducts = []

    filtered.forEach((product) => {
      const name = (product.item_name || "").toLowerCase()
      const description = (product.description || "").toLowerCase()
      const category = (product.category || "").toLowerCase()

      if (name === window.currentSearchQuery) {
        exactMatches.push(product)
      } else if (
        name.includes(window.currentSearchQuery) ||
        description.includes(window.currentSearchQuery) ||
        category.includes(window.currentSearchQuery)
      ) {
        partialMatches.push(product)
      } else {
        otherProducts.push(product)
      }
    })

    filtered = [...exactMatches, ...partialMatches, ...otherProducts]
  }

  window.filteredProducts = filtered
  window.currentPage = 1
  renderProducts(filtered)
  updateProductCount()
}

// Set quick filter
function setQuickFilter(category) {
  window.currentCategory = category
  window.currentSearchQuery = "" // Clear search when using category filter

  // Clear search boxes
  const searchBox = document.getElementById("searchBox")
  const mobileSearchBox = document.getElementById("mobileSearchBox")
  if (searchBox) {
    searchBox.value = ""
  }
  if (mobileSearchBox) {
    mobileSearchBox.value = ""
  }

  hideAutocomplete()
  hideMobileAutocomplete()
  updateActiveFilterButton(category)
  applyFilters()
}

// Update active filter button
function updateActiveFilterButton(category) {
  // Update desktop filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Update mobile category buttons
  document.querySelectorAll(".category-item").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Find and activate the correct buttons
  const buttons = document.querySelectorAll(".filter-btn, .category-item")
  buttons.forEach((btn) => {
    const btnText = btn.textContent.toLowerCase()
    if ((category === "all" && btnText.includes("all")) || (category !== "all" && btnText.includes(category))) {
      btn.classList.add("active")
    }
  })
}

// Add to cart without minimum order requirement
async function addToCart(productId) {
  const button = document.querySelector(`button[onclick*="addToCart(${productId})"]`)
  if (button) {
    button.disabled = true
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  }

  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    // Get selected variant data
    const variantDropdown = document.getElementById(`variant-${productId}`)
    const selectedPrice = variantDropdown ? Number.parseFloat(variantDropdown.value) : null
    const selectedVariant = variantDropdown
      ? variantDropdown.options[variantDropdown.selectedIndex].text.split(" - ")[0]
      : null

    // Find the product
    const product = window.allProducts.find((p) => p.id === Number.parseInt(productId))
    if (!product) {
      throw new Error("Product not found")
    }

    const finalPrice = selectedPrice || product.variants[0].price
    const finalVariant = selectedVariant || product.variants[0].packing

    // Check if product exists in cart with same variant
    const existingItemIndex = cart.findIndex(
      (item) => item.id === Number.parseInt(productId) && item.variant === finalVariant,
    )

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1
    } else {
      const cartItem = {
        id: Number.parseInt(productId),
        name: product.item_name,
        price: finalPrice,
        description: product.description,
        image: product.image_url,
        category: product.category,
        quantity: 1,
        variant: finalVariant,
      }
      cart.push(cartItem)
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count and display
    updateCartCount()
    syncCartCounts()
    updateCartDisplay()

    // Show success toast
    showToast(`${product.item_name} (${finalVariant}) added to cart!`, "success")

    // Add pulse animation to cart icons
    const cartIcon = document.querySelector(".cart-icon")
    const mobileCartIcon = document.querySelector(".mobile-cart-icon")
    if (cartIcon) {
      cartIcon.style.animation = "pulse 0.6s ease"
      setTimeout(() => {
        cartIcon.style.animation = ""
      }, 600)
    }
    if (mobileCartIcon) {
      mobileCartIcon.style.animation = "pulse 0.6s ease"
      setTimeout(() => {
        mobileCartIcon.style.animation = ""
      }, 600)
    }

    // Try to sync with server
    try {
      await fetch("/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      })
    } catch (syncError) {
      console.warn("Failed to sync cart with server:", syncError)
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    showToast("Failed to add item to cart. Please try again.", "error")
  } finally {
    if (button) {
      button.disabled = false
      const isMobile = window.innerWidth <= 768
      button.innerHTML = isMobile ? '<i class="fas fa-shopping-cart"></i> Add' : '<i class="fas fa-shopping-cart"></i>'
    }
  }
}

// Show toast notification
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer")
  if (!toastContainer) return

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
    ${message}
  `

  toastContainer.appendChild(toast)

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 400)
  }, 3000)
}

// Show error message
function showError(message) {
  const productsContainer = document.getElementById("productsContainer")
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button onclick="fetchAndRenderProducts()" class="retry-btn" style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #6a4c93, #9b59b6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>
    `
  }
}

// Show no results message
function showNoResults(message) {
  const productsContainer = document.getElementById("productsContainer")
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="no-products-message">
        <i class="fas fa-search"></i>
        <p>${message}</p>
        ${
          window.currentSearchQuery
            ? `
          <button onclick="clearSearch()" class="clear-search-btn" style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #6a4c93, #9b59b6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            <i class="fas fa-times"></i> Clear Search
          </button>
        `
            : ""
        }
      </div>
    `
  }
}

// Clear search
function clearSearch() {
  const searchBox = document.getElementById("searchBox")
  const mobileSearchBox = document.getElementById("mobileSearchBox")
  if (searchBox) {
    searchBox.value = ""
  }
  if (mobileSearchBox) {
    mobileSearchBox.value = ""
  }
  window.currentSearchQuery = ""
  hideAutocomplete()
  hideMobileAutocomplete()
  applyFilters()
}

// Update product count display - show only current page count for desktop
function updateProductCount() {
  const currentPageCountElement = document.getElementById("currentPageCount")

  if (currentPageCountElement) {
    const isMobile = window.innerWidth <= 768

    if (isMobile) {
      // Mobile: Don't show product count
      return
    }

    const totalPages = Math.ceil(window.filteredProducts.length / window.productsPerPage)
    const startIndex = (window.currentPage - 1) * window.productsPerPage
    const endIndex = Math.min(startIndex + window.productsPerPage, window.filteredProducts.length)
    const currentPageCount = endIndex - startIndex

    currentPageCountElement.textContent = currentPageCount
  }
}

// Update pagination
function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination")
  const pageNumbers = document.getElementById("pageNumbers")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  const isMobile = window.innerWidth <= 768

  if (isMobile || totalPages <= 1) {
    if (pagination) pagination.style.display = "none"
    return
  }

  if (pagination) pagination.style.display = "flex"

  if (pageNumbers) {
    pageNumbers.textContent = `Page ${window.currentPage} of ${totalPages}`
  }

  if (prevBtn) {
    prevBtn.disabled = window.currentPage === 1
  }

  if (nextBtn) {
    nextBtn.disabled = window.currentPage === totalPages
  }
}

// Change page
function changePage(delta) {
  const totalPages = Math.ceil(window.filteredProducts.length / window.productsPerPage)
  const newPage = window.currentPage + delta

  if (newPage >= 1 && newPage <= totalPages) {
    window.currentPage = newPage
    renderProducts(window.filteredProducts)
    updateProductCount()

    // Scroll to top of products section
    const productsSection = document.querySelector(".products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" })
    }
  }
}

// Set grid view
function setGridView(columns) {
  const productGrid = document.getElementById("productsContainer")
  const viewBtns = document.querySelectorAll(".view-btn")

  // Remove active class from all buttons
  viewBtns.forEach((btn) => btn.classList.remove("active"))

  // Add active class to clicked button
  event.target.closest(".view-btn").classList.add("active")

  // Update grid columns
  switch (columns) {
    case 3:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))"
      break
    case 4:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))"
      break
    default:
      productGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))"
  }
}

// Update cart count
function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const cartCountElement = document.getElementById("cartCount")
    const mobileCartCountElement = document.getElementById("mobileCartCount")
    const cartItemCountElement = document.getElementById("cartItemCount")
    const cartTotalItemsElement = document.getElementById("cartTotalItems")

    if (cartCountElement) {
      cartCountElement.textContent = totalCount
    }
    if (mobileCartCountElement) {
      mobileCartCountElement.textContent = totalCount
    }
    if (cartItemCountElement) {
      cartItemCountElement.textContent = `${totalCount} items`
    }
    if (cartTotalItemsElement) {
      cartTotalItemsElement.textContent = totalCount
    }
  } catch (error) {
    console.error("Error updating cart count:", error)
  }
}

// Update cart display - removed minimum order requirement
function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems")
  const cartSubtotal = document.getElementById("cartSubtotal")
  const cartTotal = document.getElementById("cartTotal")
  const checkoutBtn = document.getElementById("checkoutBtn")

  if (!cartItems) return

  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <h4>Your cart is empty</h4>
          <p>Add some delicious snacks to get started!</p>
          <button class="browse-products-btn" onclick="toggleCart()">
            <i class="fas fa-plus"></i> Browse Products
          </button>
        </div>
      `
      if (cartSubtotal) cartSubtotal.textContent = "₹0"
      if (cartTotal) cartTotal.textContent = "₹0"
      if (checkoutBtn) checkoutBtn.disabled = true
      return
    }

    let totalAmount = 0

    cartItems.innerHTML = cart
      .map((item) => {
        const itemTotal = item.price * item.quantity
        totalAmount += itemTotal

        return `
          <div class="cart-item">
            <div class="cart-item-image">
              <img src="${item.image || "/placeholder.svg?height=60&width=60"}" alt="${item.name}" />
            </div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-variant">${item.variant}</div>
              <div class="cart-item-price">
                <span class="cart-item-current-price">₹${itemTotal.toFixed(2)}</span>
              </div>
              <div class="cart-item-actions">
                <div class="quantity-control">
                  <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.variant}', -1)">-</button>
                  <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                  <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.variant}', 1)">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id}, '${item.variant}')" title="Remove item">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `
      })
      .join("")

    if (cartSubtotal) cartSubtotal.textContent = `₹${totalAmount.toFixed(2)}`
    if (cartTotal) cartTotal.textContent = `₹${totalAmount.toFixed(2)}`
    // Remove minimum order requirement - allow checkout for any amount
    if (checkoutBtn) checkoutBtn.disabled = totalAmount === 0
  } catch (error) {
    console.error("Error updating cart display:", error)
  }
}

// Update cart quantity
function updateCartQuantity(productId, variant, change) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const itemIndex = cart.findIndex((item) => item.id === productId && item.variant === variant)

    if (itemIndex !== -1) {
      cart[itemIndex].quantity += change

      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1)
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      updateCartCount()
      syncCartCounts()
      updateCartDisplay()
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error)
  }
}

// Remove from cart
function removeFromCart(productId, variant) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const filteredCart = cart.filter((item) => !(item.id === productId && item.variant === variant))

    localStorage.setItem("cart", JSON.stringify(filteredCart))
    updateCartCount()
    syncCartCounts()
    updateCartDisplay()

    showToast("Item removed from cart", "success")
  } catch (error) {
    console.error("Error removing from cart:", error)
  }
}

// Toggle cart popup - only close with X button
function toggleCart() {
  const cartPopup = document.getElementById("cartPopup")
  if (cartPopup) {
    cartPopup.classList.toggle("active")
    if (cartPopup.classList.contains("active")) {
      updateCartDisplay()
    }
  }
}

// Authentication functions
function toggleAuth() {
  try {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user && user.first_name) {
      const dropdown = document.getElementById("userDropdown")
      if (dropdown) {
        dropdown.classList.toggle("active")
      }
    } else {
      window.location.href = "/login"
    }
  } catch (err) {
    console.error("Error in toggleAuth:", err)
    window.location.href = "/login"
  }
}

function confirmLogout() {
  localStorage.removeItem("user")
  const authText = document.getElementById("authText")

  if (authText) authText.textContent = "Sign In"

  const dropdown = document.getElementById("userDropdown")
  if (dropdown) dropdown.classList.remove("active")

  showToast("Logged out successfully!", "success")
  setTimeout(() => {
    window.location.href = "/"
  }, 1000)
}

// Navigate to product details
function goToProductDetails(productId) {
  window.location.href = `/product-details.html?id=${productId}`
}

// Setup click outside handlers - modified for cart
function setupClickOutsideHandlers() {
  document.addEventListener("click", (e) => {
    // Handle auth dropdown
    const authContainer = document.querySelector(".auth-container")
    const mobileAuthContainer = document.querySelector(".mobile-auth-container")
    const userDropdown = document.getElementById("userDropdown")

    if (
      authContainer &&
      !authContainer.contains(e.target) &&
      mobileAuthContainer &&
      !mobileAuthContainer.contains(e.target)
    ) {
      if (userDropdown) {
        userDropdown.classList.remove("active")
      }
    }

    // Handle autocomplete dropdown
    const searchContainer = document.querySelector(".search-container")
    const mobileSearchContainer = document.querySelector(".mobile-search-container")
    const autocompleteDropdown = document.getElementById("autocompleteDropdown")
    const mobileAutocompleteDropdown = document.getElementById("mobileAutocompleteDropdown")

    if (searchContainer && !searchContainer.contains(e.target)) {
      if (autocompleteDropdown) {
        hideAutocomplete()
      }
    }

    if (mobileSearchContainer && !mobileSearchContainer.contains(e.target)) {
      if (mobileAutocompleteDropdown) {
        hideMobileAutocomplete()
      }
    }

    // Cart popup only closes with X button - removed outside click handler
  })

  // Handle escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const cartPopup = document.getElementById("cartPopup")
      if (cartPopup && cartPopup.classList.contains("active")) {
        toggleCart()
      }

      const userDropdown = document.getElementById("userDropdown")
      if (userDropdown && userDropdown.classList.contains("active")) {
        userDropdown.classList.remove("active")
      }

      hideAutocomplete()
      hideMobileAutocomplete()
    }
  })
}

// Handle window resize for responsive behavior
window.addEventListener("resize", () => {
  renderProducts(window.filteredProducts)
  updateProductCount()
  syncCartCounts()

  // Re-setup scroll handler for mobile
  if (window.innerWidth <= 768) {
    setupScrollHandler()
  } else {
    // Remove hidden class for desktop
    const header = document.getElementById("header")
    if (header) {
      header.classList.remove("hidden")
    }
  }
})

// Utility function for debouncing
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Initialize cart display on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartDisplay()
  syncCartCounts()
})
