import { cart, removeFromCart } from "../data/cart.js";
import { products } from "../data/products.js";
import { formatCurrency } from "./money/utils.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js"

let addCartHTML = "";

cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  let matchingProduct;
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  addCartHTML += `
  <div class="cart-item-container  js-cart-item-container-${matchingProduct.id}">
          <div class="delivery-date">Delivery date:Friday, March 20</div>
          <div class="cart-item-details-grid">
            <img class="product-image" src="${matchingProduct.image}" alt="">
            <div class="cart-item-details">
              <div class="product-name">${matchingProduct.name}</div>
              <div class="product-price">$${formatCurrency(matchingProduct.priceCents)}</div>
              <div class="product-quantity">
                <span>Quantiy: ${cartItem.quantity}</span>
                <span class="update">Update</span>
                <span class="delete  js-delete" data-product-id="${matchingProduct.id}">Delete</span>
              </div>
            </div>

            <div class="delivery-options">
              <div class="delivery-options-title">choose a delivery option</div>
              <div class="delivery-option">
                <input type="radio" name="delivery-${matchingProduct.id}" class="delivery-option-input">
                <div class="delivery-text">
                  <div class="date">Sunday, March 22</div>
                  <div class="shipping">FREE Shipping</div>
                </div>
              </div>
              <div class="delivery-option">
                <input type="radio" name="delivery-${matchingProduct.id}" class="delivery-option-input">
                <div class="delivery-text">
                  <div class="date">Wednesday, March 18</div>
                  <div class="shipping">$4.99 - Shipping</div>
                </div>
              </div>
              <div class="delivery-option">
                <input type="radio" name="delivery-${matchingProduct.id}" class="delivery-option-input">
                <div class="delivery-text">
                  <div class="date">Monday, March 16</div>
                  <div class="shipping">$9.99 - shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  `;
});

document.querySelector(".js-cart-items-container").innerHTML = addCartHTML;

document.querySelectorAll(".js-delete").forEach((link) => {
  link.addEventListener("click", () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);
    console.log(cart);
    document.querySelector(`.js-cart-item-container-${productId}`).remove();
  });
});
