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
    <form onSubmit={handleSubmit} style={{ marginBottom: "12px" }}>
      <div>
        <label>
          Rating (1–5):&nbsp;
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Review (optional):
          <br />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
        </label>
      </div>
      {errorMsg && <p>{errorMsg}</p>}
      <button type="submit" disabled={submitting}>
        {existingRating !== undefined ? "Update" : "Submit"}
      </button>
      {existingRating !== undefined && (
        <button type="button" onClick={onSuccess} style={{ marginLeft: "8px" }}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default function ReviewSection({ itemId, session, reviews }: Props) {
  const router = useRouter();
  const [updateOpen, setUpdateOpen] = useState(false);

  const ownReview = session
    ? reviews.find((r) => r.username === session.username) ?? null
    : null;

  // Current user's review first, then the rest
  const sorted = ownReview
    ? [ownReview, ...reviews.filter((r) => r.username !== session!.username)]
    : reviews;

  function handleSuccess() {
    setUpdateOpen(false);
    router.refresh();
  }

  return (
    <div>
      <h2 style={{ marginTop: "24px" }}>Add Review</h2>

      {/* Create form — shown only when logged in and no existing review */}
      {session && !ownReview && (
        <div style={{ marginBottom: "16px" }}>
          <ReviewForm itemId={itemId} onSuccess={handleSuccess} />
        </div>
      )}

      {/* Login prompt for guests */}
      {!session && (
        <div style={{ marginBottom: "16px" }}>
          <p>You must be logged in to leave a review.</p>
          <Link href={`/login?callbackUrl=/item/${itemId}`}>Login</Link>
        </div>
      )}

      <h2 style={{ marginTop: "24px" }}>Reviews</h2>

      {/* Reviews list */}
      {sorted.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {sorted.map((review, i) => {
            const isOwn = session?.username === review.username;
            return (
              <li key={i} style={{ borderTop: "1px solid #ddd", padding: "8px 0" }}>
                <strong>{review.username}</strong> — {review.rating}/5
                {isOwn && (
                  <button
                    onClick={() => setUpdateOpen((v) => !v)}
                    style={{ marginLeft: "12px", fontSize: "0.85em" }}
                  >
                    {updateOpen ? "Cancel" : "Update"}
                  </button>
                )}
                <p style={{ margin: "4px 0 0" }}>{review.text}</p>
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
