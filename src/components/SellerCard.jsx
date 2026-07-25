"use client";
import { useState } from "react";

export default function SellerCard({ seller }) {
  const [following, setFollowing] = useState(false);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #cccccc",
      borderRadius: "10px",
      padding: "16px",
      marginTop: "24px",
      gap: "16px"
    }}>

      {/* Left: Logo + Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Store Logo */}
        <div style={{
          width: "52px", height: "52px",
          borderRadius: "50%",
          background: "#1a1a1a",
          color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", fontWeight: "700",
          flexShrink: 0,
        }}>
          {seller.name.charAt(0)}
        </div>

        {/* Store Info */}
        <div>
          <div style={{ fontWeight: "600", fontSize: "15px", color:"#111111" }}>{seller.name}</div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
            ⭐ {seller.rating} · {seller.followers.toLocaleString()} followers
          </div>
        </div>
      </div>

      {/* Right: Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
        
        <button
  onClick={() => window.open(seller.storeUrl, "_blank")}
  style={{
    fontSize: "12px", fontWeight: "600",
    color: "#111111", textDecoration: "underline",
    letterSpacing: "0.5px", background: "none",
    border: "none", cursor: "pointer", padding: 0,
  }}
>
  Visit Store
</button>
        <button
  onClick={() => setFollowing((prev) => !prev)}
  style={{
    padding: "6px 16px",
    borderRadius: "20px",
    border: "1px solid #111111",
    background: following ? "#111111" : "transparent",
    color: following ? "white" : "#111111",
    fontSize: "12px", fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  }}
>
  {following ? "✓ Following" : "+ Follow"}
</button>
      </div>
    </div>
  );
}