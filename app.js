// DOM Elements
const menuGrid = document.querySelector('.menu-grid');
const orderForm = document.querySelector('.order-form');
const ordersList = document.querySelector('.orders-list');
const selectedItemsContainer = document.querySelector('.selected-items');
const totalPriceElement = document.querySelector('.order-total span');
const carousel = document.querySelector('.carousel');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

// DOM Elements for Orders
const ordersTrack = document.querySelector('.orders-track');
const ordersPrevBtn = document.querySelector('.orders-btn.prev');
const ordersNextBtn = document.querySelector('.orders-btn.next');

// State
let menuItems = [];
let selectedItems = new Map();
let currentSlide = 0;
let itemsPerSlide = 3;

// Orders State
let orders = [];
let currentOrderSlide = 0;
let ordersPerView = 3;

// API URLs
const API_URL = 'http://localhost:3000/api';

// Fetch menu items from the server
async function fetchMenuItems() {
  try {
    const response = await fetch(`${API_URL}/menu`);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    menuItems = await response.json();
    console.log(menuItems);
    renderMenuItems();
  } catch (error) {
    console.error('Error fetching menu items:', error);
    if (menuGrid) {
      menuGrid.innerHTML = '<p class="loading">Failed to load menu items. Please try again later.</p>';
    }
  }
}

// Render menu items in the carousel
function renderMenuItems() {
  if (!carousel) return;
  
  if (!menuItems.length) {
    carousel.innerHTML = '<p class="loading">No menu items available.</p>';
    return;
  }

  // Clear the carousel first
  carousel.innerHTML = '';
  
  // Calculate total slides
  const totalSlides = Math.ceil(menuItems.length / itemsPerSlide);
  
  // Create slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'slides-container';
  slidesContainer.style.width = `${totalSlides * 100}%`;
  slidesContainer.style.display = 'flex';
  slidesContainer.style.transition = 'transform 0.3s ease-in-out';
  
  // Create slides
  for (let i = 0; i < totalSlides; i++) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.style.width = `${100 / totalSlides}%`;
    slide.style.display = 'flex';
    slide.style.gap = '20px';
    slide.style.padding = '10px';
    
    // Add items to this slide
    const startIdx = i * itemsPerSlide;
    const endIdx = Math.min(startIdx + itemsPerSlide, menuItems.length);
    
    for (let j = startIdx; j < endIdx; j++) {
      const item = menuItems[j];
      const menuItemDiv = document.createElement('div');
      menuItemDiv.className = 'menu-item';
      menuItemDiv.innerHTML = `
        <div class="menu-item-content">
          <h3>${item.name}</h3>
          <p>${item.description || 'No description available'}</p>
          <div class="price">$${parseFloat(item.price).toFixed(2)}</div>
          <div class="quantity-control">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <input type="number" class="quantity-input" value="0" min="0" data-id="${item.id}">
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
      `;
      slide.appendChild(menuItemDiv);
    }
    
    slidesContainer.appendChild(slide);
  }
  
  carousel.appendChild(slidesContainer);
  updateCarouselButtons();
  setupQuantityControls();
}

// Update carousel navigation
function updateCarousel() {
  if (!carousel) return;
  const slidesContainer = carousel.querySelector('.slides-container');
  if (!slidesContainer) return;
  
  const totalSlides = Math.ceil(menuItems.length / itemsPerSlide);
  const slideWidth = 100 / totalSlides;
  slidesContainer.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
  updateCarouselButtons();
}

// Update carousel navigation buttons
function updateCarouselButtons() {
  if (!prevBtn || !nextBtn) return;
  
  const totalSlides = Math.ceil(menuItems.length / itemsPerSlide);
  prevBtn.style.display = currentSlide === 0 ? 'none' : 'block';
  nextBtn.style.display = currentSlide === totalSlides - 1 ? 'none' : 'block';
}

// Setup quantity control event listeners
function setupQuantityControls() {
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', handleQuantityChange);
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', handleQuantityInput);
  });
}

// Handle quantity button clicks
function handleQuantityChange(e) {
  const btn = e.target;
  const input = btn.parentElement.querySelector('.quantity-input');
  const itemId = parseInt(btn.dataset.id);
  const currentValue = parseInt(input.value);
  
  if (btn.classList.contains('minus')) {
    if (currentValue > 0) {
      input.value = currentValue - 1;
      updateSelectedItems(itemId, currentValue - 1);
    }
  } else {
    input.value = currentValue + 1;
    updateSelectedItems(itemId, currentValue + 1);
  }
}

// Handle quantity input changes
function handleQuantityInput(e) {
  const input = e.target;
  const itemId = parseInt(input.dataset.id);
  const value = Math.max(0, parseInt(input.value) || 0);
  input.value = value;
  updateSelectedItems(itemId, value);
}

// Update selected items and total price
function updateSelectedItems(itemId, quantity) {
  if (quantity === 0) {
    selectedItems.delete(itemId);
  } else {
    selectedItems.set(itemId, quantity);
  }
  renderSelectedItems();
  updateTotalPrice();
}

// Render selected items in the order form
function renderSelectedItems() {
  if (!selectedItemsContainer) return;
  
  if (selectedItems.size === 0) {
    selectedItemsContainer.innerHTML = '<p class="empty-message">No items selected</p>';
    return;
  }

  const itemsList = document.createElement('ul');
  itemsList.style.listStyle = 'none';
  itemsList.style.padding = '0';

  selectedItems.forEach((quantity, itemId) => {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      const li = document.createElement('li');
      li.style.marginBottom = '10px';
      li.innerHTML = `
        <strong>${item.name}</strong> x ${quantity} - $${(item.price * quantity).toFixed(2)}
      `;
      itemsList.appendChild(li);
    }
  });

  selectedItemsContainer.innerHTML = '';
  selectedItemsContainer.appendChild(itemsList);
}

// Update total price
function updateTotalPrice() {
  if (!totalPriceElement) return;
  
  let total = 0;
  selectedItems.forEach((quantity, itemId) => {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      const price = parseFloat(item.price) || 0;
      total += price * quantity;
    }
  });
  totalPriceElement.textContent = total.toFixed(2);
}

// Handle order form submission
async function handleOrderSubmit(e) {
  e.preventDefault();
  
  if (selectedItems.size === 0) {
    alert('Please select at least one item');
    return;
  }

  const formData = new FormData(orderForm);
  const orderData = {
    customerName: formData.get('customerName'),
    tableNumber: parseInt(formData.get('tableNumber')),
    items: Array.from(selectedItems.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity
    }))
  };

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to place order');
    }

    const result = await response.json();
    alert('Order placed successfully!');
    orderForm.reset();
    selectedItems.clear();
    renderSelectedItems();
    updateTotalPrice();
    fetchOrders();
  } catch (error) {
    console.error('Error placing order:', error);
    alert(`Failed to place order: ${error.message}`);
  }
}

// Fetch and render recent orders
async function fetchOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    console.log('Fetched orders:', data); // Debug log
    
    // Ensure we have an array of orders
    const orders = Array.isArray(data) ? data : [];
    
    if (orders.length === 0) {
      const ordersTrack = document.querySelector('.orders-track');
      if (ordersTrack) {
        ordersTrack.innerHTML = '<p class="loading">No orders yet</p>';
      }
      return;
    }
    
    renderOrders(orders);
    console.log('Orders rendered:', orders); // Debug log
    updateOrdersNavigation();
  } catch (error) {
    console.error('Error fetching orders:', error);
    const ordersTrack = document.querySelector('.orders-track');
    if (ordersTrack) {
      ordersTrack.innerHTML = '<p class="loading">Failed to load orders. Please try again later.</p>';
    }
  }
}

// Render orders in the slider
function renderOrders(orders) {
  const ordersTrack = document.querySelector('.orders-track');
  if (!ordersTrack) return;

  ordersTrack.innerHTML = '';
  
  orders.forEach(order => {
    console.log('Processing order:', order); // Debug log
    
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    // Format the order time
    const orderTime = order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A';
    
    // Calculate total price from items if total is not available
    let totalPrice = 0;
    if (typeof order.total === 'number') {
      totalPrice = order.total;
    } else if (Array.isArray(order.items)) {
      totalPrice = order.items.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
    }
    
    orderCard.innerHTML = `
      <div class="order-header">
        <h3>Order #${order.id || 'N/A'}</h3>
        <span class="order-status ${(order.status || 'pending').toLowerCase()}">${order.status || 'Pending'}</span>
      </div>
      <div class="order-customer">Customer: ${order.customerName || 'N/A'}</div>
      <div class="order-items">
        ${(order.items || []).map(item => {
          const itemPrice = parseFloat(item.price) || 0;
          const itemQuantity = parseInt(item.quantity) || 0;
          const itemTotal = itemPrice * itemQuantity;
          return `
            <div class="order-item">
              <span class="order-item-name">${item.name || 'Unknown Item'}</span>
              <span class="order-item-quantity">x ${itemQuantity}</span>
              <span class="order-item-price">$${itemTotal.toFixed(2)}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="order-footer">
        <span class="order-total">Total: $${totalPrice.toFixed(2)}</span>
        <span class="order-time">${orderTime}</span>
      </div>
    `;
    ordersTrack.appendChild(orderCard);
  });

  updateOrdersSlider();
}

// Update orders navigation buttons
function updateOrdersNavigation() {
  if (!ordersPrevBtn || !ordersNextBtn) return;
  
  const totalSlides = Math.ceil(orders.length / ordersPerView);
  ordersPrevBtn.style.display = currentOrderSlide === 0 ? 'none' : 'block';
  ordersNextBtn.style.display = currentOrderSlide >= totalSlides - 1 ? 'none' : 'block';
}

// Slide to next orders
function slideOrdersNext() {
  const totalSlides = Math.ceil(orders.length / ordersPerView);
  if (currentOrderSlide < totalSlides - 1) {
    currentOrderSlide++;
    updateOrdersSlider();
  }
}

// Slide to previous orders
function slideOrdersPrev() {
  if (currentOrderSlide > 0) {
    currentOrderSlide--;
    updateOrdersSlider();
  }
}

// Update orders slider position
function updateOrdersSlider() {
  if (!ordersTrack) return;
  
  const slideWidth = 100 / Math.ceil(orders.length / ordersPerView);
  ordersTrack.style.transform = `translateX(-${currentOrderSlide * slideWidth}%)`;
  updateOrdersNavigation();
}

// Handle window resize for orders
function handleOrdersResize() {
  if (window.innerWidth <= 768) {
    ordersPerView = 1;
  } else if (window.innerWidth <= 992) {
    ordersPerView = 2;
  } else {
    ordersPerView = 3;
  }
  
  currentOrderSlide = 0;
  updateOrdersSlider();
}

// Carousel navigation
function slideNext() {
  const totalSlides = Math.ceil(menuItems.length / itemsPerSlide);
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateCarousel();
  }
}

function slidePrev() {
  if (currentSlide > 0) {
    currentSlide--;
    updateCarousel();
  }
}

// Orders Slider Functionality
const ordersPerSlide = 3;

function initializeOrdersSlider() {
  const ordersTrack = document.querySelector('.orders-track');
  const prevBtn = document.querySelector('.orders-btn.prev');
  const nextBtn = document.querySelector('.orders-btn.next');

  if (!ordersTrack || !prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    if (currentOrderSlide > 0) {
      currentOrderSlide--;
      updateOrdersSlider();
    }
  });

  nextBtn.addEventListener('click', () => {
    const orders = document.querySelectorAll('.order-card');
    if (currentOrderSlide < Math.ceil(orders.length / ordersPerSlide) - 1) {
      currentOrderSlide++;
      updateOrdersSlider();
    }
  });
}

function updateOrdersSlider() {
  const ordersTrack = document.querySelector('.orders-track');
  const slideWidth = 100 / ordersPerSlide;
  ordersTrack.style.transform = `translateX(-${currentOrderSlide * slideWidth}%)`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchMenuItems();
  fetchOrders();
  
  if (prevBtn) prevBtn.addEventListener('click', slidePrev);
  if (nextBtn) nextBtn.addEventListener('click', slideNext);
  if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);
  
  if (ordersPrevBtn) ordersPrevBtn.addEventListener('click', slideOrdersPrev);
  if (ordersNextBtn) ordersNextBtn.addEventListener('click', slideOrdersNext);
  
  // Add touch support for orders slider
  if (ordersTrack) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    ordersTrack.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    ordersTrack.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleOrdersSwipe();
    }, false);
    
    function handleOrdersSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left
          slideOrdersNext();
        } else {
          // Swipe right
          slideOrdersPrev();
        }
      }
    }
  }
  
  initializeOrdersSlider();
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth <= 992) {
    itemsPerSlide = 2;
  } else if (window.innerWidth <= 768) {
    itemsPerSlide = 1;
  } else {
    itemsPerSlide = 3;
  }
  
  // Re-render menu items with new items per slide
  if (carousel) {
    carousel.innerHTML = '';
    renderMenuItems();
    updateCarousel();
  }
  
  // Update orders slider
  handleOrdersResize();
});
