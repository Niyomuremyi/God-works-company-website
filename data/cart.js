export let cart = JSON.parse(localStorage.getItem('cart'));

if(!cart){
 cart =[
  {
    productId:"3fdfe8d6-9a15-4979-b459-585b0d0545b9",
    quantity:1,
    deliveryOptionId:'1'
  },
  {
   productId:"e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
   quantity:1,
   deliveryOptionId:'2'
  }
];
}

function addToLocalStorage(){
  localStorage.setItem('cart',JSON.stringify(cart));
}

export function addToCart(productId){
  let matchingItem;
cart.forEach((cartItem)=>{
  if(productId === cartItem.productId){
    matchingItem = cartItem;
  }
});

if(matchingItem){
  matchingItem.quantity += 1;
}

else{ 
  cart.push({
    productId:productId,
    quantity:1,
    deliveryOptionId:'1'
  })
}

addToLocalStorage();
}

export function removeFromCart(productId){
  const newArray = [];

cart.forEach((cartItem)=>{
  if(cartItem.productId !== productId){
    newArray.push(cartItem);
  }
});

cart = newArray;

addToLocalStorage();
}

export function updateDeliveryOptions(productId , deliveryOptionId){
    let matchingItem;
   cart.forEach((cartItem)=>{
    if(cartItem.productId === productId){
       matchingItem = cartItem;
    }
  });

  if(matchingItem){
    matchingItem.deliveryOptionId = deliveryOptionId;
  }

  addToLocalStorage();
}