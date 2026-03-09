import {products} from "../data/products.js"



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
             <div class="product-price">$${product.priceCents}</div>
            <div class="added-to-cart">
                <button class="add-to-cart-button">add to cart</button></div>
        </div>
  `
});
document.querySelector('.products-grid').innerHTML = productsHTML;