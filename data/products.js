export function getProduct(productId){
  let matchingProduct;
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  return matchingProduct;
}

export const products = [
  {
    id: "3fdfe8d6-9a15-4979-b459-585b0d0545b9",
    image: "images/products/electric-kettle.jpg",
    name: "Fast Boil Electric kettle",
    rating: {
      stars: 4.5,
      count: 10,
    },
    priceCents: 2020,
  },
  {
    id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image: "images/products/honey(1kg).jpg",
    name: "Natural honey(1kg)",
    rating: {
      stars: 4,
      count: 7,
    },
    priceCents: 1530,
  },
  {
    id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    image: "images/products/jug-glass.jpg",
    name: "Glass Jug",
    rating: {
      stars: 5,
      count: 6,
    },
    priceCents: 790,
  },
  {
    id: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
    image: "images/products/mug.jpg",
    name: "Tea Mug",
    rating: {
      stars: 4.5,
      count: 9,
    },
    priceCents: 200,
  },
  {
    id: "54e0eccd-8f36-462b-b68a-8182611d9add",
    image: "images/products/plates.jpg",
    name: "Breakfast Plates",
    rating: {
      stars: 5,
      count: 8,
    },
    priceCents: 3145,
  },
  {
    id: "3ebe75dc-64d2-4137-8860-1f5a963e534b",
    image: "images/products/rice(25kg).webp",
    name: "Premium Rice(25kg)",
    rating: {
      stars: 4,
      count: 6,
    },
    priceCents: 3030,
  },
  {
    id: "dd82ca78-a18b-4e2a-9250-31e67412f98d",
    image: "images/products/vaseline.jpg",
    name: "the lotion for applying on the body",
    rating:{
      stars:4.5,
      count:8
    },
    priceCents:8118
  },
  {
    id:"77919bbe-0e56-475b-adde-4f24dfed3a04",
    image:"images/products/fork.jpg",
    name:"fork used for eating",
    rating:{
      stars:5,
      count:5
    },
    priceCents:1123
  },
  {
    id:"c2a82c5e-aff4-435f-9975-517cfaba2ece",
    image:"images/products/spoon.jpg",
    name:"spoon for sauce",
    rating:{
      stars:4.5,
      count:6
    },
    priceCents:1234
  },
  {
    id:"58b4fc92-e98c-42aa-8c55-b6b79996769a",
    image:"images/products/take-away.webp",
    name:"Good for keeping food",
    rating:{
      stars:4,
      count:8
    },
   priceCents:2222
  },
  {
    id:"5968897c-4d27-4872-89f6-5bcb052746d7",
    image:"images/products/sauvage-spray.avif",
    name:"The best spray for body",
    rating:{
      stars:5,
      count:9
    },
    priceCents:4125
  },
  {
    id: "aad29d11-ea98-41ee-9285-b916638cac4a",
    image:"images/products/air-fresher.avif",
    name:"For providing good scents",
    rating:{
      stars:4,
      count:2
    },
    priceCents:3367
  },
  {
    id:"04701903-bc79-49c6-bc11-1af7e3651358",
    image:"images/products/american-garden.avif",
    name:"It makes food too delicious",
    rating:{
      stars:4.5,
      count:5
    },
    priceCents:5785
  },
  {
    id: "901eb2ca-386d-432e-82f0-6fb1ee7bf969",
    image:"images/products/bible.webp",
    name:"This is life",
    rating:{
      stars:5,
      count:1
    },
    priceCents:1020
  }
];
