const API_URL = "https://directus.aikedejongste.nl/items/products/";

//////////////////////// Fetch products from the API ////////////////
////////////////////////////////////////////////////////////////////
async function fetchProducts() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return [];
  }
}

////////////////////////// Display Products Function ///////////////
///////////////////////////////////////////////////////////////////
function displayProducts(products) {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";

    const productLink = document.createElement("a");
    productLink.className = "product-link";
    productLink.href = "#";
    productLink.dataset.productId = product.id;

    const productImg = document.createElement("img");
    productImg.className = "product-img";
    productImg.setAttribute(
      "src",
      "https://directus.aikedejongste.nl/assets/" + product.image
    );

    productLink.appendChild(productImg);

    const productContent = document.createElement("div");
    productContent.className = "product-content";

    const productLeft = document.createElement("div");
    productLeft.className = "product-left";

    const productTitle = document.createElement("h3");
    productTitle.className = "product-title";
    productTitle.textContent = product.name;

    const productMaterial = document.createElement("p");
    productMaterial.className = "product-material";
    productMaterial.textContent = product.material;

    const productTypeElem = document.createElement("p");
    productTypeElem.className = "product-type";
    productTypeElem.textContent = product.product_type;

    productLeft.appendChild(productTitle);
    productLeft.appendChild(productMaterial);
    productLeft.appendChild(productTypeElem);

    const productRight = document.createElement("div");
    productRight.className = "product-right";

    const productColorContainer = document.createElement("div");
    productColorContainer.className = "product-color-container";

    const productColorCircle = document.createElement("div");
    productColorCircle.className = "product-color-circle";
    productColorCircle.style.backgroundColor = product.colors;

    const productColor = document.createElement("p");
    productColor.className = "product-color";
    productColor.textContent = product.color;

    productColorContainer.appendChild(productColorCircle);
    productColorContainer.appendChild(productColor);

    const productPrice = document.createElement("p");
    productPrice.className = "product-price";
    productPrice.textContent = product.price;

    productRight.appendChild(productPrice);
    productRight.appendChild(productColorContainer);

    productContent.appendChild(productLeft);
    productContent.appendChild(productRight);

    productDiv.appendChild(productLink);
    productDiv.appendChild(productContent);

    productsContainer.appendChild(productDiv);
  });

  // Add event listeners to product links
  document.querySelectorAll(".product-link").forEach((link) => {
    link.addEventListener("click", handleProductClick);
  });
}

////////////////// Handle Product Click ///////////////////////////////
///////////////////////////////////////////////////////////////////////
async function handleProductClick(event) {
  event.preventDefault();
  const productId = event.currentTarget.dataset.productId;
  const product = await fetchProductDetails(productId);
  if (product) {
    showModal(product);
  }
}

//////////////////// Fetch Product Details //////////////////////////////
////////////////////////////////////////////////////////////////////////
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`${API_URL}${productId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return null;
  }
}

///////////// Load products when the document is ready ///////////////
////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", async () => {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = "Loading products...";
  const products = await fetchProducts();
  if (products.length > 0) {
    displayProducts(products);
  } else {
    productsContainer.innerHTML = "Failed to load products";
  }

  // Fetch and insert the navbar HTML
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;

      // Add event listener to the cart button after the navbar is loaded
      const cartButton = document.getElementById("btn--cart");
      if (cartButton) {
        cartButton.addEventListener("click", function () {
          console.log("Cart button clicked");
          showCart();
        });
      } else {
        console.error("Cart button not found");
      }
    });
});

////////////////////////// SHOW MODAL  //////////////////////////////////
////////////////////////////////////////////////////////////////////////

function showModal(product) {
  const modal = document.getElementById("product-modal");
  const modalContent = document.getElementById("modal-product-details");

  modalContent.innerHTML = `
    <div class="modal-container">
     <div class="modal-left">
      <h3 class="modal-title">${product.name}</h3>
      <p class="modal-price">${product.price}</p>
      <p class="modal-material">${product.material}</p>
      <p class="stars">★★★★★ <span class="review-text">130 reviews</span></p>
      <p class="modal-description">${product.description}</p>
      <p class="modal-description">${product.descriptio_2}</p>
      
      <p class="modal-color">Color - ${product.color}</p>
      <p class="modal-fit">Fit - ${product.fit}</p>
      <button class="modal-button" data-product-id="${product.id}">Add to Cart</button>
     </div>
     <div class="modal-right">
       <img class="modal-image" src="https://directus.aikedejongste.nl/assets/${product.img_2}" alt="${product.name}" />
       <img class="modal-image" src="https://directus.aikedejongste.nl/assets/${product.image}" alt="${product.name}" />
     </div>
    </div>
  `;

  modal.style.display = "block";

  // Add event listener to close button
  const closeButton = modal.querySelector(".close");
  closeButton.onclick = function () {
    modal.style.display = "none";
  };

  // Add event listener to close modal on outside click
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Add event listener to 'Add to Cart' button
  const modalButton = document.querySelector(".modal-button");
  modalButton.addEventListener("click", function () {
    const productId = this.dataset.productId;
    addProductToCart(productId);
  });
}

////////////////////////////////// Add Product to cart  //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

let clickedProducts = [];

function addProductToCart(productId) {
  clickedProducts.push(productId);

  updateCartButton();
}

function updateCartButton() {
  const addCartBtn = document.getElementById("btn--cart");
  let currentNumber = clickedProducts.length;
  addCartBtn.innerHTML = `<b><u>CART (${currentNumber})</u></b>`;
}

////////////////////////////////// CART MODAL  //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

async function showCart() {
  const cart = document.getElementById("cart");
  const cartContent = document.getElementById("cart-product-details");

  // Fetch product details for each ID
  const productDetails = await Promise.all(
    clickedProducts.map(async (productId) => {
      const product = await fetchProductDetails(productId);
      return product || {};
    })
  );

  // Check if cart is empty and update display accordingly
  if (productDetails.length === 0) {
    cartContent.innerHTML = `
    <div class="cart-container">
      <div class="voucher-banner-cart">
        <p class="voucher-text">Use code XYZ123 for a 10% discount on your purchase!</p>
      </div>
      <h3 class="cart-title">CART</h3>
      <p class="empty-cart"> YOU HAVEN’T ADDED ANYTHING, YET.</p>
      <button class="cart-button-empty">Start shopping</button>
    </div>`;
  } else {
    cartContent.innerHTML = `
    <div class="cart-container">
      <div class="voucher-banner-cart">
        <p class="voucher-text">Use code XYZ123 for a 10% discount on your purchase!</p>
      </div>
      <h3 class="cart-title">CART</h3>
      ${productDetails
        .map(
          (product) => `
        <div class="cart-item">
          <div class="cart-product-left">
            <h3 class="product-name-cart">${
              product.name || "Unknown Product"
            }</h3>
            <p class="product-material-cart">${
              product.material || "Unknown Material"
            }</p>
            <p class="product-fit-cart">${product.fit || "Unknown Fit"}</p>
            <p class="product-price-cart">${
              product.price || "Unknown Price"
            }</p>
            <a href="#" class="remove-link" data-product-id="${
              product.id
            }">Remove</a>
          </div>
          <div class="cart-product-right">
            <img class="cart-image" src="https://directus.aikedejongste.nl/assets/${
              product.img_2 || "default.jpg"
            }" alt="${product.name || "Unknown Product"}" />
          </div>
        </div>`
        )
        .join("")}
      <div class="cart-message">
        <p class="cart-carbon">We've balanced the carbon footprint of this product</p>
        <a href="#" class="learn-link">Learn More</a>
      </div>
      <button class="cart-button">Checkout</button>
    </div>`;
  }

  cart.style.display = "block";

  // Add event listener to close button
  const cartCloseButton = cart.querySelector(".cart-close");
  cartCloseButton.onclick = function () {
    cart.style.display = "none";
  };

  // Add event listener to close modal on outside click
  window.onclick = function (event) {
    if (event.target == cart) {
      cart.style.display = "none";
    }
  };

  // Add event listeners to remove links
  const removeLinks = cart.querySelectorAll(".remove-link");
  removeLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const productId = this.dataset.productId;
      clickedProducts = clickedProducts.filter((id) => id !== productId);
      updateCartButton();
      showCart();
    });
  });

  const cartButtonEmpty = cart.querySelector(".cart-button-empty");
  cartButtonEmpty.onclick = function () {
    cart.style.display = "none";
  };
}
