"use client";
import { useState } from "react";

const initialQuestions = [
  {
    id: 1,
    question: "Is this shoe suitable for trail running, or strictly road use?",
    upvotes: 14,
    answer: "The Aero Velocity Pro Runner is designed primarily for road and track surfaces. For light gravel or packed dirt the shoe performs well, but we wouldn't recommend technical trail use.",
  },
  {
    id: 2,
    question: "Do these run true to size? I'm usually between EU 42 and 43.",
    upvotes: 8,
    answer: "These run true to EU sizing. If you're between sizes we'd suggest going with the 43, as the performance fit is snug.",
  },
  {
    id: 3,
    question: "Can I machine wash these after long runs?",
    upvotes: 3,
    answer: null,
  },
];

export default function QandA() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [voted, setVoted] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [sort, setSort] = useState("relevant");

  const handleUpvote = (id) => {
    if (voted.includes(id)) return;
    setVoted((prev) => [...prev, id]);
    setQuestions((prev) =>
      prev.map((q) => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q)
    );
  };

  const handleSubmit = () => {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    const newQ = {
      id: Date.now(),
      question: trimmed,
      upvotes: 0,
      answer: null,
    };
    setQuestions((prev) => [newQ, ...prev]);
    setNewQuestion("");
  };

  const sorted = [...questions].sort((a, b) => {
    if (sort === "relevant") return b.upvotes - a.upvotes;
    if (sort === "recent") return b.id - a.id;
    return 0;
  });

  return (
    <div style={{ marginTop: "40px", borderTop: "1px solid #cccccc", paddingTop: "32px" }}>
      <h2 style={{ marginBottom: "24px", fontSize: "22px", color: "#111111" }}>Questions & Answers</h2>

      {/* Sort */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #cccccc",
            background: "#ffffff",
            color: "#111111",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <option value="relevant">Most Relevant</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

      {/* Question List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
        {sorted.map((q) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #cccccc",
              borderRadius: "10px",
              padding: "18px 20px",
              background: "#ffffff",
            }}
          >
            {/* Question Row */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flex: 1 }}>
                {/* Q Icon */}
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: "#111111", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700", flexShrink: 0,
                }}>
                  Q
                </div>
                <div style={{ fontWeight: "500", fontSize: "15px", color: "#111111" }}>{q.question}</div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexShrink: 0 }}>
                {/* Unanswered Badge */}
                {!q.answer && (
                  <div style={{
                    fontSize: "10px", fontWeight: "600",
                    background: "#fde8e0", color: "#e44d26",
                    padding: "3px 8px", borderRadius: "4px",
                    letterSpacing: "0.5px", whiteSpace: "nowrap",
                  }}>
                    UNANSWERED
                  </div>
                )}

                {/* Upvote */}
                <button
                  onClick={() => handleUpvote(q.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "2px", fontSize: "11px",
                    color: voted.includes(q.id) ? "#4caf82" : "#888",
                    background: "none",
                    border: `1px solid ${voted.includes(q.id) ? "#4caf82" : "#cccccc"}`,
                    borderRadius: "6px", padding: "6px 10px",
                    cursor: voted.includes(q.id) ? "default" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ▲
                  <span>{q.upvotes}</span>
                </button>
              </div>
            </div>

            {/* Answer */}
            {q.answer && (
              <div style={{
                marginTop: "14px", paddingTop: "14px",
                borderTop: "1px solid #cccccc",
                display: "flex", gap: "12px",
              }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: "#f5a623", color: "black",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700", flexShrink: 0,
                }}>
                  A
                </div>
                <div style={{ fontSize: "14px", color: "#444444", lineHeight: "1.6" }}>
                  {q.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ask a Question */}
      <div style={{
        border: "1px solid #cccccc", borderRadius: "10px",
        padding: "18px 20px", background: "#ffffff",
      }}>
        <div style={{ fontWeight: "600", marginBottom: "12px", color: "#111111" }}>Ask a question</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Type your question here…"
            style={{
              flex: 1, padding: "10px 14px",
              borderRadius: "6px", border: "1px solid #cccccc",
              background: "#f5f5f5", color: "#111111",
              fontSize: "14px", outline: "none",
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "0 20px", background: "#111111",
              color: "white", border: "none",
              borderRadius: "6px", fontSize: "13px",
              fontWeight: "600", cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}