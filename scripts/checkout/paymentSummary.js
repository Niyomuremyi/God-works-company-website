import {cart} from '../../data/cart.js';
import {getProduct} from '../../data/products.js';
import {getDeliveryOption} from '../../data/deliveryOptions.js';
import {formatCurrency} from '../money/utils.js';

export function renderPaymentSummary(){
let productPriceCents = 0;
let shippingPriceCents = 0;
  cart.forEach((cartItem)=>{
  const product = getProduct(cartItem.productId);
  productPriceCents += product.priceCents * cartItem.quantity;
  const deliveryOption = getDeliveryOption(cartItem.productId);
  shippingPriceCents += deliveryOption.priceCents
});

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;
    
 const  paymentSummaryHTML =`
        <div class="order-summary-title">Payment Summary</div>
        <div class="order-summary-items-grid">
          <div>items(3):</div>
          <div class="order-summary-price">$${formatCurrency(productPriceCents)}</div>
        </div>
        <div class="order-summary-shipping-grid">
          <div>shipping & handling</div>
          <div class="order-summary-shipping">$${formatCurrency(shippingPriceCents)}</div>
        </div>
        <div class="small-line-container">
          <div class="small-line"></div>
        </div>
        <div class="order-summary-tax-grid">
          <div>Total before tax:</div>
          <div class="order-summary-tax">$${formatCurrency(totalBeforeTaxCents)}</div>
        </div>
        <div class="order-summary-estimated-grid">
          <div>Estimated(10%)</div>
          <div class="order-summary-shipping">$${formatCurrency(taxCents)}</div>
        </div>
        <div class="big-line-container">
          <div class="big-line"></div>
        </div>
        <div class="order-summary-total-grid">
          <div>Order Total:</div>
          <div class="order-summary-total">$${formatCurrency(totalCents)}</div>
        </div>
        <button class="place-order-button">Place order</button>

    `
    document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;
}