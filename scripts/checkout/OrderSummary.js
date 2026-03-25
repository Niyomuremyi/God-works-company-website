import { cart, removeFromCart , updateDeliveryOptions } from "../../data/cart.js";
import { products , getProduct } from "../../data/products.js";
import { formatCurrency } from "../money/utils.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import {deliveryOptions , getDeliveryOption} from "../../data/deliveryOptions.js";


 export function renderOrderSummary(){
  
let addCartHTML = ""; 

cart.forEach((cartItem) => {
  const productId = cartItem.productId;
  

  const matchingProduct=getProduct(productId);


  const deliveryOptionId = cartItem.deliveryOptionId;

  let deliveryOption = getDeliveryOption(productId);
 


    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays,'days');
    const dateString=deliveryDate.format('dddd, MMMM D');


  addCartHTML += `
  <div class="cart-item-container  js-cart-item-container-${matchingProduct.id}">
          <div class="delivery-date">Delivery date:${dateString}</div>
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
             
            <div class="delivery-options-container">
            <div class="delivery-options-title">choose a delivery option</div>
            <div class="delivery-options js-delivery-options">
            ${deliveryOptionsHTML(matchingProduct,cartItem)}
            </div>
          </div>
        </div>
        </div>
  `;
});

function deliveryOptionsHTML(matchingProduct,cartItem){
let html = '';
 deliveryOptions.forEach((deliveryOption)=>{
 const today = dayjs();
 const deliveryDate = today.add(deliveryOption.deliveryDays,'days');
 const dateString=deliveryDate.format('dddd, MMMM D');
 const priceString = deliveryOption.priceCents === 0
 ? 'FREE'
 : `$${formatCurrency(deliveryOption.priceCents)}`;

 const isChecked = cartItem.deliveryOptionId === deliveryOption.id;
  html +=  `

   <div class="delivery-option">
                <input type="radio" name="delivery-${matchingProduct.id}" class="delivery-option-input
                 js-delivery-option-input" data-product-id="${matchingProduct.id}" 
                 data-delivery-option-id="${deliveryOption.id}"
                 ${isChecked ? 'checked' : ''}>
                <div class="delivery-text">
                  <div class="date">${dateString}</div>
                  <div class="shipping">${priceString} - shipping</div>
                </div>
              </div>
  `;
 })
 return html;
}

document.querySelector(".js-cart-items-container").innerHTML = addCartHTML;

document.querySelectorAll(".js-delete").forEach((link) => {
  link.addEventListener("click", () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);
    console.log(cart);
    document.querySelector(`.js-cart-item-container-${productId}`).remove();
  });
});

document.querySelectorAll('.js-delivery-option-input')
 .forEach((element)=>{
   element.addEventListener('click',()=>{
    const {productId,deliveryOptionId} = element.dataset;
    updateDeliveryOptions(productId , deliveryOptionId);
    renderOrderSummary();
   })
 })
 }

 renderOrderSummary();