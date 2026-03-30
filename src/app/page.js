"use client";

import { useState } from "react";
import ImageGallery from "../components/ImageGallery";
import VariantSelector from "../components/VariantSelector";

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState(null);

  return (
    <div>
      <h1>Product Page</h1>

      {/* Image Gallery */}
      <ImageGallery selectedVariant={selectedVariant} />

      {/* Variant Selector */}
      <VariantSelector onChange={setSelectedVariant} />
    </div>
  );
}