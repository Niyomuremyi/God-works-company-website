"use client";
import { useState } from "react";

const reviews = [
  {
    id: 1,
    name: "Kenji M.",
    verified: true,
    rating: 5,
    date: "March 12, 2026",
    title: "Best running shoes I've ever owned",
    text: "The carbon plate really makes a noticeable difference on long runs. My pace improved and my feet felt fresh even after 20km. Sizing is true to the EU scale.",
    photo: "/product-images/shoe1.jpg",
    helpful: 42,
    sellerReply: "Thank you Kenji! We're thrilled the carbon plate is making a real difference in your runs.",
  },
  {
    id: 2,
    name: "Sarah L.",
    verified: true,
    rating: 4,
    date: "February 28, 2026",
    title: "Great shoe, slightly narrow fit",
    text: "Love the responsiveness and aesthetics. My only note is the toe box runs a bit narrow — I'd recommend sizing up half a size if you have wider feet.",
    photo: null,
    helpful: 18,
    sellerReply: null,
  },
  {
    id: 3,
    name: "T. Watanabe",
    verified: false,
    rating: 5,
    date: "February 4, 2026",
    title: "Incredible — ran my first sub-4 hour marathon",
    text: "I've been training in these for 3 months. I finally broke 4 hours and I credit a lot of it to the energy return in these shoes. Absolutely worth every penny.",
    photo: "/product-images/shoe2.jpg",
    helpful: 30,
    sellerReply: null,
  },
];

const ratingBreakdown = [
  { star: 5, count: 193 },
  { star: 4, count: 51 },
  { star: 3, count: 23 },
  { star: 2, count: 9 },
  { star: 1, count: 8 },
];

const totalReviews = ratingBreakdown.reduce((a, b) => a + b.count, 0);
const avgRating = (
  ratingBreakdown.reduce((a, b) => a + b.star * b.count, 0) / totalReviews
).toFixed(1);

const REVIEWS_PER_PAGE = 2;

function Stars({ count }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= count ? "#f5a623" : "#dddddd", fontSize: "14px" }}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewItem({ review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  const handleHelpful = () => {
    if (voted) return;
    setHelpful((prev) => prev + 1);
    setVoted(true);
  };

  return (
    <div style={{
      borderBottom: "1px solid #cccccc",
      paddingBottom: "24px",
      marginBottom: "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <div>
          <span style={{ fontWeight: "600", fontSize: "14px", color:"#111111" }}>{review.name}</span>
          {review.verified && (
            <span style={{
              marginLeft: "8px", fontSize: "10px",
              background: "#1a3a2a", color: "#4caf82",
              padding: "2px 8px", borderRadius: "4px",
              fontWeight: "600", letterSpacing: "0.5px",
            }}>
              VERIFIED
            </span>
          )}
        </div>
        <span style={{ fontSize: "12px", color: "#888" }}>{review.date}</span>
      </div>

      {/* Stars */}
      <Stars count={review.rating} />

      {/* Title */}
      <div style={{ fontWeight: "600", marginTop: "8px", marginBottom: "6px", color:"#111111" }}>
        {review.title}
      </div>

      {/* Text */}
      <div style={{ fontSize: "14px", color: "#444444", lineHeight: "1.7" }}>
        {review.text}
      </div>

      {/* Photo */}
      {review.photo && (
        <img
          src={review.photo}
          alt="review"
          style={{
            width: "80px", height: "80px",
            objectFit: "cover", borderRadius: "6px",
            marginTop: "12px",
          }}
        />
      )}

      {/* Helpful */}
      <div style={{ marginTop: "12px" }}>
        <button
          onClick={handleHelpful}
          style={{
            fontSize: "12px",
            color: voted ? "#4caf82" : "#888",
            background: "none", border: "none",
            cursor: voted ? "default" : "pointer",
            padding: 0, fontWeight: "500",
          }}
        >
          👍 Helpful ({helpful})
        </button>
      </div>

      {/* Seller Reply */}
      {review.sellerReply && (
        <div style={{
          marginTop: "14px",
          borderLeft: "3px solid #f5a623",
          background: "#f0f0f0",
          borderRadius: "0 6px 6px 0",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "20px",
          paddingRight: "16px"
        }}>
          <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: "600", letterSpacing: "1px", marginBottom: "6px" }}>
            SELLER REPLY
          </div>
          <div style={{ fontSize: "13px", color: "#444444" }}>{review.sellerReply}</div>
        </div>
      )}
    </div>
  );
}

export default function Reviews() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginated = reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  return (
    <div style={{ marginTop: "40px", borderTop: "1px solid #cccccc", paddingTop: "32px" }}>
      <h2 style={{ marginBottom: "24px", fontSize: "22px", color:"#111111" }}>Customer Reviews</h2>

      {/* Rating Summary */}
      <div style={{ display: "flex", gap: "40px", marginBottom: "32px", flexWrap: "wrap" }}>

        {/* Average */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "56px", fontWeight: "300", lineHeight: 1, color:"#111111" }}>{avgRating}</div>
          <Stars count={Math.round(avgRating)} />
          <div style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>{totalReviews} reviews</div>
        </div>

        {/* Breakdown Bars */}
        <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
          {ratingBreakdown.map((row) => (
            <div key={row.star} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
              <span style={{ width: "20px", textAlign: "right", color: "#888" }}>{row.star}</span>
              <div style={{ flex: 1, height: "6px", background: "#e0e0e0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  width: `${(row.count / totalReviews) * 100}%`,
                  height: "100%", background: "#f5a623", borderRadius: "3px",
                }} />
              </div>
              <span style={{ width: "28px", color: "#888", fontSize: "12px" }}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      {paginated.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}

      {/* Pagination */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{
              width: "36px", height: "36px",
              borderRadius: "50%",
              border: "1px solid #cccccc",
              background: page === i + 1 ? "#111111" : "transparent",
              color: page === i + 1 ? "white" : "#111111",
              cursor: "pointer", fontWeight: "600",
              fontSize: "13px",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}