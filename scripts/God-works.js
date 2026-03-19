import {products} from "../data/products.js";
import {cart,addToCart} from "../data/cart.js";
import {formatCurrency} from "./money/utils.js";


let productsHTML = '';

products.forEach((product)=>{
  productsHTML +=`
  <div class="product-container">
            <img class="product-image" src=${product.image} alt="">
                <div class="product-info">${product.name}</div>
            <div class="product-rating">
            <div class="product-rating-container">
                <img class="product-rating-stars"  src="images/ratings/rating-${product.rating.stars * 10}.png" alt=""></div>
            <div class="product-rating-count">${product.rating.count}</div>
             </div>
             <div class="product-price">$${formatCurrency(product.priceCents)}</div>
            <div class="added-to-cart">
                <button class="add-to-cart-button  js-add-to-cart" data-product-id="${product.id}">add to cart</button></div>
        </div>
  `
});
document.querySelector('.js-products-grid').innerHTML = productsHTML;

function updateCartQuantity(){
    let cartQuantity = 0;

    cart.forEach((item)=>{
        cartQuantity += item.quantity;
    })

    document.querySelector('.js-cart-number').innerHTML = cartQuantity;
}

document.querySelectorAll('.js-add-to-cart')
 .forEach((button)=>{
   button.addEventListener('click',()=>{
      const productId = button.dataset.productId
      addToCart(productId);
      updateCartQuantity();
      console.log(cart);
   })
 })