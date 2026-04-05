"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Session = { username: string; role: string };

export type Review = {
  username: string;
  text: string;
  rating: number;
};

type Props = {
  itemId: string;
  session: Session | null;
  reviews: Review[];
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: "4px",
  border: "1px solid #444",
  background: "#0f0f0f",
  color: "#ededed",
  fontSize: "0.9em",
  resize: "vertical",
};

const ratingInputStyle: React.CSSProperties = {
  width: "60px",
  padding: "6px 10px",
  borderRadius: "4px",
  border: "1px solid #444",
  background: "#0f0f0f",
  color: "#ededed",
  fontSize: "0.9em",
  textAlign: "center",
};

function ReviewForm({
  itemId,
  existingRating,
  onSuccess,
}: {
  itemId: string;
  existingRating?: number;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(existingRating ?? 1);
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMsg("Rating must be between 1 and 5.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, rating, text }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErrorMsg(data.error ?? "Submission failed.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label style={{ fontSize: "0.85em", color: "#888" }}>Rating (1–5)</label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={ratingInputStyle}
          required
        />
      </div>

      <textarea
        placeholder="Write your review (optional)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={textareaStyle}
      />

      {errorMsg && <p style={{ margin: 0, fontSize: "0.85em", color: "#cc6666" }}>{errorMsg}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        {existingRating !== undefined && (
          <button type="button" onClick={onSuccess}>Cancel</button>
        )}
        <button type="submit" disabled={submitting}>
          {existingRating !== undefined ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
}

export default function ReviewSection({ itemId, session, reviews }: Props) {
  const router = useRouter();
  const [updateOpen, setUpdateOpen] = useState(false);

  const ownReview = session
    ? reviews.find((r) => r.username === session.username) ?? null
    : null;

  const sorted = ownReview
    ? [ownReview, ...reviews.filter((r) => r.username !== session!.username)]
    : reviews;

  function handleSuccess() {
    setUpdateOpen(false);
    router.refresh();
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 12px", fontSize: "1.1em", fontWeight: 600, textAlign: "center" }}>
        Add Review
      </h2>

      {session && !ownReview && (
        <div style={{ marginBottom: "24px" }}>
          <ReviewForm itemId={itemId} onSuccess={handleSuccess} />
        </div>
      )}

      {!session && (
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", color: "#888", fontSize: "0.9em" }}>
            You must be logged in to leave a review.
          </p>
          <Link href={`/login?callbackUrl=/item/${itemId}`} className="nav-btn">Login</Link>
        </div>
      )}

      <h2 style={{ margin: "0 0 12px", fontSize: "1.1em", fontWeight: 600 }}>Reviews</h2>

      {sorted.length === 0 ? (
        <p style={{ color: "#888", fontSize: "0.9em" }}>No reviews yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sorted.map((review, i) => {
            const isOwn = session?.username === review.username;
            return (
              <li key={i} style={{ borderTop: "1px solid #1e1e1e", padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "0.9em" }}>{review.username}</strong>
                  <span style={{ color: "#e8a020", fontSize: "0.85em" }}>★ {review.rating}/5</span>
                  {isOwn && (
                    <button
                      onClick={() => setUpdateOpen((v) => !v)}
                      style={{ marginLeft: "auto", fontSize: "0.8em", padding: "3px 10px" }}
                    >
                      {updateOpen ? "Cancel" : "Update"}
                    </button>
                  )}
                </div>
                {review.text && (
                  <p style={{ margin: "0 0 8px", fontSize: "0.88em", color: "#aaa", lineHeight: 1.5 }}>
                    {review.text}
                  </p>
                )}
                {isOwn && updateOpen && (
                  <ReviewForm
                    itemId={itemId}
                    existingRating={review.rating}
                    onSuccess={handleSuccess}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
