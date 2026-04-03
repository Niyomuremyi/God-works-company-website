"use client";
import { useState, useEffect, useRef } from "react";

export default function ImageGallery({ selectedVariant }) {
  const items = [
    { type: "image", src: "/product-images/shoe1.jpg" },
    { type: "image", src: "/product-images/shoe2.jpg" },
    { type: "image", src: "/product-images/shoe3.jpg" },
    { type: "video", src: "/product-images/shoe-video.mp4" },
  ];

  const [selected, setSelected] = useState(items[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const lastDist = useRef(null);

  useEffect(() => {
    if (selectedVariant) {
      setSelected({ type: "image", src: selectedVariant.image });
    }
  }, [selectedVariant]);

  useEffect(() => {
    setScale(1);
  }, [selected]);

  // Close fullscreen with Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const getDistance = (touches) =>
    Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      lastDist.current = getDistance(e.touches);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastDist.current) {
      const newDist = getDistance(e.touches);
      const delta = newDist / lastDist.current;
      setScale((prev) => Math.min(Math.max(prev * delta, 1), 4));
      lastDist.current = newDist;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      lastDist.current = null;
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>

      {/* Main Display */}
      <div
        style={{ overflow: "hidden", borderRadius: "10px", background: "#000", position: "relative" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {selected.type === "video" ? (
          <video
            src={selected.src}
            controls
            autoPlay
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        ) : (
          <img
            src={selected.src}
            alt="product"
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "10px",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: scale === 1 ? "transform 0.3s ease" : "none",
            }}
          />
        )}

        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ⛶
        </button>
      </div>

      {/* Thumbnails */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto" }}>
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelected(item)}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "6px",
              overflow: "hidden",
              cursor: "pointer",
              border: selected.src === item.src ? "2px solid black" : "1px solid gray",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.src}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  muted
                />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.35)",
                }}>
                  <span style={{ color: "#fff", fontSize: "20px" }}>▶</span>
                </div>
              </>
            ) : (
              <img
                src={item.src}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {selected.type === "video" ? (
            <video
              src={selected.src}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px" }}
            />
          ) : (
            <img
              src={selected.src}
              alt="product"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }}
            />
          )}
        </div>
      )}
    </div>
  );
} 