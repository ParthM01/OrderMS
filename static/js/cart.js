// Enhanced Cart functionality with Address Management and improved scrolling
let cart = []
let userDetails = {}
let selectedAddress = null

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadUserDetails()
  fetchCartFromBackend()
  initializeScrollHandling()
})

// Initialize scroll handling
function initializeScrollHandling() {
  // Prevent scroll issues with modals
  const modals = document.querySelectorAll(".pincode-modal, .address-modal")
  modals.forEach((modal) => {
    modal.addEventListener("scroll", (e) => {
      e.stopPropagation()
    })
  })
}

// Load user details from localStorage with enhanced data fetching
function loadUserDetails() {
  const storedUser = localStorage.getItem("userDetails")
  if (storedUser) {
    userDetails = JSON.parse(storedUser)
  } else {
    // Try to get user details from other localStorage keys
    const userName = localStorage.getItem("userName") || localStorage.getItem("user_name") || ""
    const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("user_email") || ""
    const userPhone = localStorage.getItem("userPhone") || localStorage.getItem("user_phone") || ""

    // Default user structure with fetched data
    userDetails = {
      name: userName,
      email: userEmail,
      phone: userPhone,
      addresses: [],
    }

    // Save the consolidated user details
    if (userName || userEmail || userPhone) {
      saveUserDetails()
    }
  }

  // Load selected address
  const storedAddress = localStorage.getItem("selectedAddress")
  if (storedAddress) {
    selectedAddress = JSON.parse(storedAddress)
  }
}

// Save user details to localStorage and backend
async function saveUserDetails() {
  localStorage.setItem("userDetails", JSON.stringify(userDetails))

  // Also save individual fields for compatibility
  localStorage.setItem("userName", userDetails.name || "")
  localStorage.setItem("userEmail", userDetails.email || "")
  localStorage.setItem("userPhone", userDetails.phone || "")

  try {
    const response = await fetch("/api/user/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    })

    if (!response.ok) {
      console.warn("Failed to save user details to backend")
    }
  } catch (error) {
    console.error("Error saving user details:", error)
  }
}

// Fetch cart data from backend with duplicate prevention
async function fetchCartFromBackend() {
  try {
    const response = await fetch("/cart")
    if (!response.ok) throw new Error("Failed to fetch cart")

    cart = await response.json()
    localStorage.setItem("cart", JSON.stringify(cart))
    loadCart()
    updateCartCount()
  } catch (error) {
    console.error("Error fetching cart:", error)
    cart = JSON.parse(localStorage.getItem("cart")) || []
    loadCart()
    updateCartCount()
  }
}

// Add item to cart with duplicate prevention
async function addToCart(productId, productData) {
  try {
    // Check if item already exists in cart
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      // If item exists, increase quantity instead of adding duplicate
      await updateQuantity(productId, 1)
      showToast(`${productData.name} quantity increased`, "success")
      return
    }

    const response = await fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        ...productData,
      }),
    })

    if (!response.ok) throw new Error("Failed to add item to cart")

    await fetchCartFromBackend()
    showToast(`${productData.name} added to cart`, "success")
  } catch (error) {
    console.error("Error adding to cart:", error)

    // Fallback to local storage
    const existingItem = cart.find((item) => item.id === productId)
    if (existingItem) {
      existingItem.quantity += 1
      showToast(`${productData.name} quantity increased`, "success")
    } else {
      cart.push({
        id: productId,
        quantity: 1,
        ...productData,
      })
      showToast(`${productData.name} added to cart`, "success")
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    loadCart()
    updateCartCount()
  }
}

// Load cart content with address section
function loadCart() {
  const cartContent = document.getElementById("cartContent")

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <a href="/product" class="browse-products-btn">
          <i class="fas fa-cookie-bite"></i> Browse Products
        </a>
      </div>
    `
    return
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cart.reduce((sum, item) => sum + (item.original_price - item.price) * item.quantity, 0)
  const shipping = subtotal >= 500 ? 0 : 50
  const total = subtotal + shipping

  cartContent.innerHTML = `
    <div class="cart-layout">
      <div class="cart-main-section">
        <!-- Cart Items Section -->
        <div class="cart-items-section">
          <div class="cart-header">
            <h2 class="cart-title">My Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)} item${cart.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? "s" : ""})</h2>
            <button class="remove-all-btn" onclick="clearCart()">
              <i class="fas fa-trash"></i>
              Remove all
            </button>
          </div>
          
          <div class="cart-items">
            ${cart
              .map(
                (item) => `
                <div class="cart-item">
                  <div class="item-image">
                    ${
                      item.image
                        ? `<img src="${item.image}" alt="${item.name || item.item_name}">`
                        : `<div class="placeholder">${item.icon || "🍪"}</div>`
                    }
                  </div>
                  
                  <div class="item-details">
                    <div class="item-name">${item.name || item.item_name}</div>
                    <div class="item-variant">Variant: ${item.variant || "1U"}</div>
                  </div>
                  
                  <div class="item-pricing">
                    <div class="item-price">₹${item.price}</div>
                    ${
                      item.original_price && item.original_price > item.price
                        ? `<div class="item-savings">₹${item.original_price - item.price} saved</div>`
                        : ""
                    }
                  </div>
                  
                  <div class="quantity-controls">
                    <button class="quantity-btn decrease" onclick="updateQuantity(${item.id}, -1)">
                      <i class="fas fa-trash"></i>
                    </button>
                    <input type="number" class="quantity-display" value="${item.quantity}" readonly>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              `,
              )
              .join("")}
          </div>
        </div>

        <!-- Address Section -->
        <div class="address-section">
          <div class="address-header">
            <h3 class="address-title">
              <i class="fas fa-map-marker-alt"></i>
              Delivery Address
            </h3>
            <button class="change-address-btn" onclick="openAddressModal()">
              <i class="fas fa-edit"></i>
              ${selectedAddress ? "Change" : "Add"} Address
            </button>
          </div>
          
          <div class="address-content">
            ${selectedAddress ? renderSelectedAddress() : renderNoAddress()}
          </div>
        </div>
      </div>
      
      <!-- Price Summary -->
      <div class="price-summary">
        <h3 class="summary-title">Price Summary</h3>
        
        <div class="summary-row">
          <span>Cart Total</span>
          <span class="amount">₹${subtotal.toFixed(2)}</span>
        </div>
        
        <div class="summary-row">
          <span>Delivery Charge <i class="fas fa-info-circle" title="Free delivery on orders above ₹500"></i></span>
          <span class="amount ${shipping === 0 ? "" : "extra"}">
            ${shipping === 0 ? "Free" : "+ ₹" + shipping.toFixed(2)}
          </span>
        </div>
        
        ${
          savings > 0
            ? `
            <div class="summary-row">
              <span>Savings</span>
              <span class="amount savings">₹${savings.toFixed(2)}</span>
            </div>
          `
            : ""
        }
        
        <div class="summary-row total">
          <span>Total Amount</span>
          <span class="amount">₹${total.toFixed(2)}</span>
        </div>
        
        <button class="checkout-btn" onclick="proceedToCheckout()" ${subtotal < 500 || !selectedAddress ? "disabled" : ""}>
          ${subtotal < 500 ? "Minimum order ₹500" : !selectedAddress ? "Add delivery address" : "Proceed to Checkout"}
        </button>
        
        ${
          subtotal < 500
            ? `
            <p style="text-align: center; color: #ff6b6b; font-size: 0.85rem; margin-top: 0.5rem;">
              Add ₹${(500 - subtotal).toFixed(2)} more to place order
            </p>
          `
            : !selectedAddress
              ? `
            <p style="text-align: center; color: #ff6b6b; font-size: 0.85rem; margin-top: 0.5rem;">
              Please add a delivery address to continue
            </p>
          `
              : ""
        }
      </div>
    </div>

    <!-- Address Modal -->
    <div class="address-modal" id="addressModal">
      <div class="address-modal-content">
        <div class="address-modal-header">
          <h3>Manage Delivery Address</h3>
          <button class="modal-close" onclick="closeAddressModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="address-modal-body">
          <!-- User Details Form -->
          <div class="user-details-section">
            <h4>Personal Details</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="userName">Full Name *</label>
                <input type="text" id="userName" value="${userDetails.name || ""}" placeholder="Enter your full name">
              </div>
              <div class="form-group">
                <label for="userEmail">Email Address *</label>
                <input type="email" id="userEmail" value="${userDetails.email || ""}" placeholder="Enter your email">
              </div>
              <div class="form-group">
                <label for="userPhone">Phone Number *</label>
                <input type="tel" id="userPhone" value="${userDetails.phone || ""}" placeholder="Enter your phone number">
              </div>
            </div>
          </div>

          <!-- Address Form -->
          <div class="address-form-section">
            <h4>Add New Address</h4>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="addressLine1">Address Line 1 *</label>
                <input type="text" id="addressLine1" placeholder="House/Flat No, Building Name">
              </div>
              <div class="form-group full-width">
                <label for="addressLine2">Address Line 2</label>
                <input type="text" id="addressLine2" placeholder="Street, Area, Landmark">
              </div>
              <div class="form-group">
                <label for="city">City *</label>
                <input type="text" id="city" placeholder="Enter city">
              </div>
              <div class="form-group">
                <label for="state">State *</label>
                <input type="text" id="state" placeholder="Enter state">
              </div>
              <div class="form-group">
                <label for="pincode">Pincode *</label>
                <input type="text" id="pincode" placeholder="Enter pincode">
              </div>
              <div class="form-group">
                <label for="addressType">Address Type</label>
                <select id="addressType">
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button class="add-address-btn" onclick="addNewAddress()">
              <i class="fas fa-plus"></i>
              Add Address
            </button>
          </div>

          <!-- Saved Addresses -->
          <div class="saved-addresses-section">
            <h4>Saved Addresses</h4>
            <div id="savedAddressesList">
              ${renderSavedAddresses()}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}


// Render selected address
function renderSelectedAddress() {
  return `
    <div class="selected-address">
      <div class="address-info">
        <div class="address-type-badge ${selectedAddress.type}">
          <i class="fas fa-${selectedAddress.type === "home" ? "home" : selectedAddress.type === "office" ? "building" : "map-marker-alt"}"></i>
          ${selectedAddress.type.charAt(0).toUpperCase() + selectedAddress.type.slice(1)}
        </div>
        <div class="address-details">
          <p class="address-line">${selectedAddress.line1}</p>
          ${selectedAddress.line2 ? `<p class="address-line">${selectedAddress.line2}</p>` : ""}
          <p class="address-line">${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}</p>
        </div>
      </div>
      <div class="delivery-info-badge">
        <i class="fas fa-truck"></i>
        <span>Delivery in 30-45 mins</span>
      </div>
    </div>
  `
}

// Render no address state
function renderNoAddress() {
  return `
    <div class="no-address">
      <div class="no-address-icon">
        <i class="fas fa-map-marker-alt"></i>
      </div>
      <p>No delivery address selected</p>
      <p class="no-address-subtitle">Add an address to continue with your order</p>
    </div>
  `
}
async function fetchUserAddresses() {
  try {
    const response = await fetch('/api/user/addresses'); // Adjust the API route as per your backend
    if (!response.ok) throw new Error("Failed to fetch addresses");

    userAddresses = await response.json();
    document.getElementById("savedAddressesContainer").innerHTML = renderSavedAddresses();
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    document.getElementById("savedAddressesContainer").innerHTML = `
      <div class="no-saved-addresses">
        <i class="fas fa-map-marker-alt"></i>
        <p>Error fetching addresses</p>
      </div>
    `;
  }
}


function renderSavedAddresses() {
  if (!userAddresses || userAddresses.length === 0) {
    return `
      <div class="no-saved-addresses">
        <i class="fas fa-map-marker-alt"></i>
        <p>No saved addresses</p>
      </div>
    `;
  }

  return userAddresses
    .map(
      (address, index) => `
    <div class="saved-address-item ${selectedAddress && selectedAddress.id === address.id ? "selected" : ""}" onclick="selectAddress(${index})">
      <div class="address-item-content">
        <div class="address-type-badge ${address.type}">
          <i class="fas fa-${address.type === "home" ? "home" : address.type === "office" ? "building" : "map-marker-alt"}"></i>
          ${address.type.charAt(0).toUpperCase() + address.type.slice(1)}
        </div>
        <div class="address-details">
          <p class="address-line">${address.line1}</p>
          ${address.line2 ? `<p class="address-line">${address.line2}</p>` : ""}
          <p class="address-line">${address.city}, ${address.state} - ${address.pincode}</p>
        </div>
      </div>
      <div class="address-actions">
        <button class="edit-address-btn" onclick="editAddress(${index}); event.stopPropagation();">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-address-btn" onclick="deleteAddress(${index}); event.stopPropagation();">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}


// Address management functions with improved scroll handling
function openAddressModal() {
  const modal = document.getElementById("addressModal")
  modal.classList.add("active")
  document.body.classList.add("modal-open")

  // Prevent background scroll
  const scrollY = window.scrollY
  document.body.style.position = "fixed"
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = "100%"
}

function closeAddressModal() {
  const modal = document.getElementById("addressModal")
  modal.classList.remove("active")
  document.body.classList.remove("modal-open")

  // Restore scroll position
  const scrollY = document.body.style.top
  document.body.style.position = ""
  document.body.style.top = ""
  document.body.style.width = ""
  window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
}

// Enhanced address addition with database integration
async function addNewAddress() {
  // Get user details and update userDetails object
  const name = document.getElementById("userName").value.trim()
  const email = document.getElementById("userEmail").value.trim()
  const phone = document.getElementById("userPhone").value.trim()

  // Get address details
  const line1 = document.getElementById("addressLine1").value.trim()
  const line2 = document.getElementById("addressLine2").value.trim()
  const city = document.getElementById("city").value.trim()
  const state = document.getElementById("state").value.trim()
  const pincode = document.getElementById("pincode").value.trim()
  const type = document.getElementById("addressType").value

  // Validation
  if (!name || !email || !phone || !line1 || !city || !state || !pincode) {
    showToast("Please fill all required fields", "error")
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address", "error")
    return
  }

  // Phone validation
  const phoneRegex = /^[6-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    showToast("Please enter a valid 10-digit phone number", "error")
    return
  }

  // Pincode validation
  const pincodeRegex = /^\d{6}$/
  if (!pincodeRegex.test(pincode)) {
    showToast("Please enter a valid 6-digit pincode", "error")
    return
  }

  // Update user details
  userDetails.name = name
  userDetails.email = email
  userDetails.phone = phone

  // Create new address
  const newAddress = {
    id: Date.now(),
    line1,
    line2,
    city,
    state,
    pincode,
    type,
    createdAt: new Date().toISOString(),
  }

  // Add to addresses array
  if (!userDetails.addresses) {
    userDetails.addresses = []
  }
  userDetails.addresses.push(newAddress)

  try {
    // Save to database
    const response = await fetch("/api/user/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userDetails: userDetails,
        address: newAddress,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to save address to database")
    }

    const result = await response.json()
    console.log("Address saved to database:", result)
  } catch (error) {
    console.error("Error saving address to database:", error)
    showToast("Address saved locally, but failed to sync with server", "warning")
  }

  // Save to localStorage
  await saveUserDetails()

  // Select the new address
  selectedAddress = newAddress
  localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress))

  // Clear form
  document.getElementById("addressLine1").value = ""
  document.getElementById("addressLine2").value = ""
  document.getElementById("city").value = ""
  document.getElementById("state").value = ""
  document.getElementById("pincode").value = ""

  // Refresh the addresses list
  document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()

  // Reload cart to update address section
  loadCart()

  showToast("Address added successfully", "success")
}

function selectAddress(index) {
  selectedAddress = userDetails.addresses[index]
  localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress))

  // Update the saved addresses list
  document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()

  // Reload cart to update address section
  loadCart()

  showToast("Address selected", "success")
}

function editAddress(index) {
  const address = userDetails.addresses[index]

  // Fill the form with existing data
  document.getElementById("addressLine1").value = address.line1
  document.getElementById("addressLine2").value = address.line2 || ""
  document.getElementById("city").value = address.city
  document.getElementById("state").value = address.state
  document.getElementById("pincode").value = address.pincode
  document.getElementById("addressType").value = address.type

  // Remove the address (it will be re-added when form is submitted)
  deleteAddress(index, false)

  showToast("Address loaded for editing", "success")
}

async function deleteAddress(index, showConfirm = true) {
  if (showConfirm && !confirm("Are you sure you want to delete this address?")) {
    return
  }

  const deletedAddress = userDetails.addresses[index]
  userDetails.addresses.splice(index, 1)

  // If deleted address was selected, clear selection
  if (selectedAddress && selectedAddress.id === deletedAddress.id) {
    selectedAddress = null
    localStorage.removeItem("selectedAddress")
  }

  try {
    // Delete from database
    const response = await fetch(`/api/user/address/${deletedAddress.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete address from database")
    }
  } catch (error) {
    console.error("Error deleting address from database:", error)
  }

  // Save changes
  await saveUserDetails()

  // Update UI
  document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()
  loadCart()

  if (showConfirm) {
    showToast("Address deleted", "success")
  }
}

// Update quantity - automatically reloads page when item is removed
async function updateQuantity(productId, change) {
  try {
    const response = await fetch("/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        change: change,
      }),
    })

    if (!response.ok) throw new Error("Failed to update cart")

    // Check if item was removed (quantity became 0)
    const item = cart.find((item) => item.id === productId)
    if (item && item.quantity + change <= 0) {
      showToast(`${item.name || item.item_name} removed from cart`, "success")
      // Auto-reload page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      await fetchCartFromBackend()
      showToast("Cart updated", "success")
    }
  } catch (error) {
    console.error("Error updating cart:", error)
    const item = cart.find((item) => item.id === productId)
    if (item) {
      item.quantity += change
      if (item.quantity <= 0) {
        cart = cart.filter((cartItem) => cartItem.id !== productId)
        showToast(`${item.name || item.item_name} removed from cart`, "success")
        // Auto-reload page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        localStorage.setItem("cart", JSON.stringify(cart))
        loadCart()
        updateCartCount()
      }
    }
  }
}

// Clear entire cart - automatically reloads page
async function clearCart() {
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    try {
      const response = await fetch("/cart/clear", {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to clear cart")

      showToast("Cart cleared", "success")
      // Auto-reload page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error clearing cart:", error)
      cart = []
      localStorage.setItem("cart", JSON.stringify(cart))
      showToast("Cart cleared", "success")
      // Auto-reload page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }
}

// Update cart count
function updateCartCount() {
  const cartCount = document.getElementById("cartCount")
  if (cartCount) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = total
    cartCount.style.display = total > 0 ? "flex" : "none"
  }
}

// Enhanced checkout with address validation
async function proceedToCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error")
    return
  }

  if (!selectedAddress) {
    showToast("Please select a delivery address", "error")
    openAddressModal()
    return
  }

  if (!userDetails.name || !userDetails.email || !userDetails.phone) {
    showToast("Please complete your profile details", "error")
    openAddressModal()
    return
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (totalAmount < 500) {
    showToast("Minimum order amount is ₹500", "error")
    return
  }

  try {
    // Save order details with address
    const orderData = {
      amount: totalAmount,
      items: cart,
      userDetails: userDetails,
      deliveryAddress: selectedAddress,
      orderDate: new Date().toISOString(),
    }

    const res = await fetch("http://localhost:8000/create-order/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })

    const data = await res.json()

    if (!res.ok || !data.order_id) {
      throw new Error(data.detail || "Failed to initiate payment")
    }

    const options = {
      key: data.key,
      amount: totalAmount * 100,
      currency: "INR",
      name: "SnackMart",
      description: "Purchase Items",
      order_id: data.order_id,
      handler: async (response) => {
        const verifyRes = await fetch("http://localhost:8000/verify-payment/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            user_details: userDetails,
            delivery_address: selectedAddress,
          }),
        })

        const verifyResult = await verifyRes.json()

        if (verifyRes.ok && verifyResult.status === "success") {
          showToast("Payment successful! Order placed.", "success")
          cart = []
          localStorage.setItem("cart", JSON.stringify(cart))
          loadCart()
          updateCartCount()

          // Redirect to order confirmation page
          setTimeout(() => {
            window.location.href = `/order-confirmation?order_id=${verifyResult.order_id}`
          }, 2000)
        } else {
          showToast("Payment verification failed", "error")
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: "#667eea",
      },
    }

    const Razorpay = window.Razorpay
    const rzp = new Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error("Checkout error:", error)
    showToast("Error during checkout: " + error.message, "error")
  }
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    ${message}
  `
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

// Pincode modal functions with improved scroll handling
function openPincodeModal() {
  const modal = document.getElementById("pincodeModal")
  modal.classList.add("active")
  document.body.classList.add("modal-open")

  // Prevent background scroll
  const scrollY = window.scrollY
  document.body.style.position = "fixed"
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = "100%"
}

function closePincodeModal() {
  const modal = document.getElementById("pincodeModal")
  modal.classList.remove("active")
  document.body.classList.remove("modal-open")

  // Restore scroll position
  const scrollY = document.body.style.top
  document.body.style.position = ""
  document.body.style.top = ""
  document.body.style.width = ""
  window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
}

// Auth functions
function toggleAuth() {
  // Implement auth logic
  console.log("Auth toggle clicked")
}

function confirmLogout() {
  // Implement logout logic
  localStorage.clear()
  window.location.href = "/"
}

function cancelLogout() {
  document.getElementById("logoutDropdown").classList.remove("active")
}

// Export functions for global access
window.addToCart = addToCart
window.updateQuantity = updateQuantity
window.clearCart = clearCart
window.proceedToCheckout = proceedToCheckout
window.openAddressModal = openAddressModal
window.closeAddressModal = closeAddressModal
window.addNewAddress = addNewAddress
window.selectAddress = selectAddress
window.editAddress = editAddress
window.deleteAddress = deleteAddress
window.openPincodeModal = openPincodeModal
window.closePincodeModal = closePincodeModal
window.toggleAuth = toggleAuth
window.confirmLogout = confirmLogout
window.cancelLogout = cancelLogout