// Enhanced Cart functionality with Address Management - COMPLETE WORKING VERSION
let cart = []
let userDetails = {}
let selectedAddress = null
let savedAddresses = []

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadUserDetails()
  fetchCartFromBackend()
  initializeScrollHandling()
  loadCart()
})

// Initialize scroll handling
function initializeScrollHandling() {
  const modals = document.querySelectorAll(".pincode-modal, .address-modal")
  modals.forEach((modal) => {
    modal.addEventListener("scroll", (e) => {
      e.stopPropagation()
    })
  })
}

// Load user details and addresses
async function loadUserDetails() {
  const user = JSON.parse(localStorage.getItem("user"))
  console.log("User from localStorage:", user)

  if (user) {
    userDetails = user
    await loadSavedAddresses()
  } else {
    console.log("No user found in localStorage")
    // Set default user structure
    userDetails = {
      id: 1, // Default ID if no user
      name: "Guest User",
      email: "guest@example.com",
      phone: "9999999999",
    }
  }
}

// Load all saved addresses
async function loadSavedAddresses() {
  try {
    const response = await fetch(`/api/user/addresses?id=${userDetails.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const addresses = await response.json()
      console.log("Loaded addresses from API:", addresses)

      savedAddresses = addresses
      userDetails.addresses = addresses

      // Load previously selected address from localStorage
      const storedAddress = addresses[0]
      if (storedAddress) {
        try {
          selectedAddress = storedAddress
          console.log("Loaded stored address:", selectedAddress)
        } catch (e) {
          console.log("Error parsing stored address")
        }
      }

      // If no stored address but we have addresses, select first one
      if (!selectedAddress && addresses.length > 0) {
        selectedAddress = addresses[0]
        // localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress))
        console.log("Auto-selected first address:", selectedAddress)
      }

      loadCart()
    } else {
      console.log("No addresses found or API error")
      savedAddresses = []
    }
  } catch (error) {
    console.error("Error loading saved addresses:", error)
    savedAddresses = []
  }
}

// Save user details
async function saveUserDetails() {
  localStorage.setItem("user", JSON.stringify(userDetails))
}

// Fetch cart data from backend
async function fetchCartFromBackend() {
  try {
    const response = await fetch("/cart")
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

// Add item to cart
async function addToCart(productId, productData) {
  try {
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
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

// Load and render cart
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
  const savings = cart.reduce(
    (sum, item) => sum + ((item.original_price || item.price + 20) - item.price) * item.quantity,
    0,
  )
  const shipping = subtotal >= 500 ? 0 : 50
  const total = subtotal + shipping

  // Check if ready for checkout
  const isReadyForCheckout = selectedAddress !== null

  cartContent.innerHTML = `
  <div class="cart-layout">
    <div class="cart-main-section">
      <!-- Cart Items Section -->
      <div class="cart-items-section">
        <div class="cart-header">
          <h2 class="cart-title">
            My Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)} item${cart.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? "s" : ""})
          </h2>
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
                <div class="item-variant">Variant: ${item.variant || "250gm"}${item.variant && !item.variant.includes("gm") ? "gm" : ""}</div>
              </div>

              <div class="item-pricing">
                <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                ${
                  item.original_price && item.original_price > item.price
                    ? `<div class="item-savings">₹${((item.original_price - item.price) * item.quantity).toFixed(2)} saved</div>`
                    : ""
                }
              </div>

              <div class="quantity-controls">
                <button class="quantity-btn decrease" onclick="updateQuantity(${item.id}, -1)">
                  ${item.quantity === 1 ? '<i class="fas fa-trash"></i>' : "-"}
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
          ${renderSelectedAddress()}
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

      <!-- FIXED CHECKOUT BUTTON -->
      <button class="checkout-btn ${isReadyForCheckout ? "enabled" : "disabled"}" 
              onclick="proceedToCheckout()" 
              ${!isReadyForCheckout ? "disabled" : ""}>
        <i class="fas fa-${isReadyForCheckout ? "credit-card" : "map-marker-alt"}"></i>
        ${!isReadyForCheckout ? "Select Address to Checkout" : "Proceed to Checkout - ₹" + total.toFixed(2)}
      </button>

      ${
        !isReadyForCheckout
          ? `
        <div class="checkout-help">
          <i class="fas fa-info-circle"></i>
          <span>Please add a delivery address to continue</span>
        </div>
      `
          : `
        <div class="checkout-ready">
          <i class="fas fa-check-circle"></i>
          <span>Ready for checkout</span>
        </div>
      `
      }

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
            <h4>Saved Addresses (${savedAddresses.length})</h4>
            <div id="savedAddressesList">
              ${renderSavedAddresses()}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`
}

// Render selected address
function renderSelectedAddress() {
  if (!selectedAddress) {
    return renderNoAddress()
  }

  return `
    <div class="selected-address">
      <div class="address-info">
        <div class="address-type-badge ${selectedAddress.type || "home"}">
          <i class="fas fa-${selectedAddress.type === "home" ? "home" : selectedAddress.type === "office" ? "building" : "map-marker-alt"}"></i>
          ${(selectedAddress.type || "home").charAt(0).toUpperCase() + (selectedAddress.type || "home").slice(1)}
        </div>
        <div class="address-details">
          <p class="address-line">${selectedAddress.line1 || selectedAddress.address_line1}</p>
          ${selectedAddress.line2 || selectedAddress.address_line2 ? `<p class="address-line">${selectedAddress.line2 || selectedAddress.address_line2}</p>` : ""}
          <p class="address-line">${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}</p>
        </div>
      </div>
      <div class="delivery-info-badge">
        <i class="fas fa-truck"></i>
        <span>Delivery in 30-45 mins</span>
      </div>
      <div class="address-selected-badge">
        <i class="fas fa-check-circle"></i>
        <span>Selected for Delivery</span>
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
      <p class="no-address-subtitle">Please add an address to continue with your order</p>
    </div>
  `
}

// Render saved addresses
function renderSavedAddresses() {
  if (!savedAddresses || savedAddresses.length === 0) {
    return `
      <div class="no-saved-addresses">
        <i class="fas fa-home"></i>
        <p>No saved addresses found</p>
        <p>Add your first address above</p>
      </div>
    `
  }

  return savedAddresses
    .map((address, index) => {
      const isSelected =
        selectedAddress &&
        ((selectedAddress.id && selectedAddress.id === address.id) ||
          (selectedAddress.line1 === (address.line1 || address.address_line1) &&
            selectedAddress.pincode === address.pincode))

      return `
        <div class="saved-address-item ${isSelected ? "selected" : ""}" onclick="selectSavedAddress(${index})">
          <div class="address-item-content">
            <div class="address-type-badge ${address.type || "home"}">
              <i class="fas fa-${(address.type || "home") === "home" ? "home" : (address.type || "home") === "office" ? "building" : "map-marker-alt"}"></i>
              ${(address.type || "home").charAt(0).toUpperCase() + (address.type || "home").slice(1)}
            </div>
            <div class="address-details">
              <p class="address-line">${address.line1 || address.address_line1}</p>
              ${address.line2 || address.address_line2 ? `<p class="address-line">${address.line2 || address.address_line2}</p>` : ""}
              <p class="address-line">${address.city}, ${address.state} - ${address.pincode}</p>
            </div>
            ${
              isSelected
                ? `
              <div class="selected-indicator">
                <i class="fas fa-check-circle"></i>
                <span>Selected</span>
              </div>
            `
                : `
              <div class="select-indicator">
                <i class="fas fa-circle"></i>
                <span>Click to Select</span>
              </div>
            `
            }
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
      `
    })
    .join("")
}

// Address modal functions
function openAddressModal() {
  const modal = document.getElementById("addressModal")
  modal.classList.add("active")
  document.body.classList.add("modal-open")

  const scrollY = window.scrollY
  document.body.style.position = "fixed"
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = "100%"
  document.body.dataset.scrollY = scrollY.toString()

  // Refresh addresses list
  document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()
}

function closeAddressModal() {
  const modal = document.getElementById("addressModal")
  modal.classList.remove("active")
  document.body.classList.remove("modal-open")

  const scrollY = Number.parseInt(document.body.dataset.scrollY || "0")
  document.body.style.position = ""
  document.body.style.top = ""
  document.body.style.width = ""
  delete document.body.dataset.scrollY
  window.scrollTo(0, scrollY)
}

// Add new address
async function addNewAddress() {
  const line1 = document.getElementById("addressLine1").value.trim()
  const line2 = document.getElementById("addressLine2").value.trim()
  const city = document.getElementById("city").value.trim()
  const state = document.getElementById("state").value.trim()
  const pincode = document.getElementById("pincode").value.trim()
  const type = document.getElementById("addressType").value

  // Validation
  if (!line1 || !city || !state || !pincode) {
    showToast("Please fill all required fields", "error")
    return
  }

  // Pincode validation
  const pincodeRegex = /^\d{6}$/
  if (!pincodeRegex.test(pincode)) {
    showToast("Please enter a valid 6-digit pincode", "error")
    return
  }

  const newAddress = {
    id: Date.now(),
    line1,
    line2,
    city,
    state,
    pincode,
    type,
  }

  try {
    // Save to database
    const response = await fetch("/api/user/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userDetails.id,
        address: newAddress,
      }),
    })

    if (response.ok) {
      console.log("Address saved to database")
    }
  } catch (error) {
    console.error("Error saving address:", error)
  }

  // Add to local arrays
  savedAddresses.push(newAddress)
  if (!userDetails.addresses) {
    userDetails.addresses = []
  }
  userDetails.addresses.push(newAddress)

  // Auto-select the new address
  selectedAddress = newAddress
  localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress))

  // Clear form
  document.getElementById("addressLine1").value = ""
  document.getElementById("addressLine2").value = ""
  document.getElementById("city").value = ""
  document.getElementById("state").value = ""
  document.getElementById("pincode").value = ""

  // Update UI
  document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()
  loadCart()

  showToast("Address added and selected successfully", "success")
}

// FIXED: Select saved address function
function selectSavedAddress(index) {
  console.log("Selecting address at index:", index)

  if (index >= 0 && index < savedAddresses.length) {
    selectedAddress = savedAddresses[index]
    console.log("Selected address:", selectedAddress)

    // Save to localStorage
    localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress))

    // Update UI immediately
    document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()
    loadCart() // This will update the checkout button state

    showToast("Address selected successfully", "success")

    // Close modal after selection
    setTimeout(() => {
      closeAddressModal()
    }, 1000)
  } else {
    console.error("Invalid address index:", index)
    showToast("Error selecting address", "error")
  }
}

// Backward compatibility
function selectAddress(index) {
  selectSavedAddress(index)
}

// Edit address
function editAddress(index) {
  const address = savedAddresses[index]

  document.getElementById("addressLine1").value = address.line1 || address.address_line1
  document.getElementById("addressLine2").value = address.line2 || address.address_line2 || ""
  document.getElementById("city").value = address.city
  document.getElementById("state").value = address.state
  document.getElementById("pincode").value = address.pincode
  document.getElementById("addressType").value = address.type || "home"

  deleteAddress(index, false)
  showToast("Address loaded for editing", "success")
}

// Delete address
async function deleteAddress(index, showConfirm = true) {
  if (showConfirm && !confirm("Are you sure you want to delete this address?")) {
    return
  }

  const deletedAddress = savedAddresses[index]
  savedAddresses.splice(index, 1)

  if (userDetails.addresses) {
    userDetails.addresses.splice(index, 1)
  }

  // Clear selection if deleted address was selected
  if (
    selectedAddress &&
    ((selectedAddress.id && selectedAddress.id === deletedAddress.id) ||
      (selectedAddress.line1 === (deletedAddress.line1 || deletedAddress.address_line1) &&
        selectedAddress.pincode === deletedAddress.pincode))
  ) {
    selectedAddress = null
    localStorage.removeItem("selectedAddress")
  }

  try {
    await fetch(`/api/user/address/${deletedAddress.id}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error("Error deleting address:", error)
  }

  // Update UI
  document.getElementById("savedAddressesList").innerHTML = renderSavedAddresses()
  loadCart()

  if (showConfirm) {
    showToast("Address deleted", "success")
  }
}

// Update quantity
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

    await fetchCartFromBackend()

    const item = cart.find((item) => item.id === productId)
    if (!item) {
      showToast("Item removed from cart", "success")
    } else {
      showToast("Cart updated", "success")
    }
  } catch (error) {
    console.error("Error updating cart:", error)

    const item = cart.find((item) => item.id === productId)
    if (item) {
      item.quantity += change
      if (item.quantity <= 0) {
        cart = cart.filter((i) => i.id !== productId)
        showToast("Item removed from cart", "success")
      } else {
        showToast("Cart updated", "info")
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      loadCart()
      updateCartCount()
    }
  }
}

// Clear cart
async function clearCart() {
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    try {
      const response = await fetch("/cart/clear", {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to clear cart")

      showToast("Cart cleared", "success")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error clearing cart:", error)
      cart = []
      localStorage.setItem("cart", JSON.stringify(cart))
      showToast("Cart cleared", "success")
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

// FIXED: Proceed to checkout - REMOVED PROFILE VALIDATION
async function proceedToCheckout() {
  console.log("Checkout initiated")
  console.log("Cart:", cart)
  console.log("Selected Address:", selectedAddress)

  // Basic validations only
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error")
    return
  }

  if (!selectedAddress) {
    showToast("Please select a delivery address", "error")
    openAddressModal()
    return
  }

  // Show loading state
  const checkoutBtn = document.querySelector(".checkout-btn")
  const originalText = checkoutBtn.innerHTML
  checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
  checkoutBtn.disabled = true

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = totalAmount >= 500 ? 0 : 50
  const finalAmount = totalAmount + shipping

  try {
    const orderData = {
      amount: finalAmount,
      items: cart,
      userDetails: userDetails,
      deliveryAddress: selectedAddress,
      orderDate: new Date().toISOString(),
    }

    console.log("Sending order data:", orderData)

    const res = await fetch("http://localhost:8000/create-order/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })

    const data = await res.json()
    console.log("Order response:", data)

    if (!res.ok || !data.order_id) {
      throw new Error(data.detail || "Failed to initiate payment")
    }

    // Razorpay options
    const options = {
      key: data.key,
      amount: finalAmount * 100, // Convert to paise
      currency: "INR",
      name: "SnackMart",
      description: "Purchase Items",
      order_id: data.order_id,
      handler: async (response) => {
        console.log("Payment successful:", response)

        try {
          const verifyRes = await fetch("http://localhost:8000/verify-payment/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              user_details: userDetails,
              delivery_address: selectedAddress,
              items: cart,
              amount: finalAmount,
            }),
          })

          const verifyResult = await verifyRes.json()
          console.log("Verification result:", verifyResult)

          if (verifyRes.ok && verifyResult.status === "success") {
            showToast("Payment successful! Order placed.", "success")

            // Clear cart
            cart = []
            localStorage.setItem("cart", JSON.stringify(cart))

            // Redirect to order confirmation
            setTimeout(() => {
              window.location.href = `/orders.html?order_id=${userDetails.id}`
            }, 2000)
          } else {
            throw new Error("Payment verification failed")
          }
        } catch (verifyError) {
          console.error("Verification error:", verifyError)
          showToast("Payment verification failed", "error")
        }
      },
      prefill: {
        name: userDetails.name || "Customer",
        email: userDetails.email || "customer@example.com",
        contact: userDetails.phone || "9999999999",
      },
      theme: {
        color: "#667eea",
      },
      modal: {
        ondismiss: () => {
          // Reset button when payment modal is closed
          checkoutBtn.innerHTML = originalText
          checkoutBtn.disabled = false
        },
      },
    }

    // Initialize Razorpay
    const Razorpay = window.Razorpay // Declare Razorpay variable
    if (typeof Razorpay !== "undefined") {
      const rzp = new Razorpay(options)
      rzp.open()
    } else {
      throw new Error("Razorpay not loaded")
    }
  } catch (error) {
    console.error("Checkout error:", error)
    showToast("Error during checkout: " + error.message, "error")

    // Reset button
    checkoutBtn.innerHTML = originalText
    checkoutBtn.disabled = false
  }
}

// Toast notification
function showToast(message, type = "success") {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast")
  existingToasts.forEach((toast) => toast.remove())

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
    ${message}
  `

  // Add styles if not already present
  if (!document.querySelector("style[data-toast-styles]")) {
    const style = document.createElement("style")
    style.setAttribute("data-toast-styles", "true")
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }
      .toast.success { border-left: 4px solid #10b981; }
      .toast.error { border-left: 4px solid #ef4444; }
      .toast.info { border-left: 4px solid #3b82f6; }
      .toast.warning { border-left: 4px solid #f59e0b; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)
  }

  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}

// Pincode modal functions
function openPincodeModal() {
  const modal = document.getElementById("pincodeModal")
  if (modal) {
    modal.classList.add("active")
    document.body.classList.add("modal-open")

    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = "100%"
    document.body.dataset.scrollY = scrollY.toString()
  }
}

function closePincodeModal() {
  const modal = document.getElementById("pincodeModal")
  if (modal) {
    modal.classList.remove("active")
    document.body.classList.remove("modal-open")

    const scrollY = Number.parseInt(document.body.dataset.scrollY || "0")
    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.width = ""
    delete document.body.dataset.scrollY
    window.scrollTo(0, scrollY)
  }
}

// Auth functions
function toggleAuth() {
  console.log("Auth toggle clicked")
}

function confirmLogout() {
  localStorage.clear()
  window.location.href = "/"
}

function cancelLogout() {
  const dropdown = document.getElementById("logoutDropdown")
  if (dropdown) {
    dropdown.classList.remove("active")
  }
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
window.selectSavedAddress = selectSavedAddress
window.editAddress = editAddress
window.deleteAddress = deleteAddress
window.openPincodeModal = openPincodeModal
window.closePincodeModal = closePincodeModal
window.toggleAuth = toggleAuth
window.confirmLogout = confirmLogout
window.cancelLogout = cancelLogout