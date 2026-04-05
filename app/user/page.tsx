import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import Link from "next/link";
import clientPromise from "@/lib/mongodb";

type Session = { username: string; role: string };

type UserReview = {
  itemId: string;
  text: string;
  rating: number;
};

type UserDoc = {
  username: string;
  reviews: UserReview[];
};

async function getSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const raw = jar.get("session")?.value;
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function getUserDoc(username: string): Promise<UserDoc | null> {
  const client = await clientPromise;
  const db = client.db("Fatihbaba");
  const doc = await db.collection("users").findOne({ username });
  if (!doc) return null;
  return {
    username: doc.username,
    reviews: doc.reviews ?? [],
  };
}

async function getItemNames(itemIds: string[]): Promise<Record<string, string>> {
  if (itemIds.length === 0) return {};
  const client = await clientPromise;
  const db = client.db("Fatihbaba");
  const validIds = itemIds.filter((id) => ObjectId.isValid(id));
  const items = await db
    .collection("items")
    .find({ _id: { $in: validIds.map((id) => new ObjectId(id)) } })
    .project({ _id: 1, name: 1 })
    .toArray();

  const map: Record<string, string> = {};
  for (const item of items) {
    map[item._id.toString()] = item.name;
  }
  return map;
}

export default async function UserPage() {
  const session = await getSession();

  if (!session || session.role !== "user") {
    redirect("/");
  }

  const user = await getUserDoc(session.username);

  if (!user) {
    return (
      <main style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ color: "#888" }}>Profile not found.</p>
      </main>
    );
  }

  const reviews = user.reviews ?? [];
  const avgRating =
    reviews.length === 0
      ? null
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const itemNames = await getItemNames(reviews.map((r) => r.itemId));

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.6em", fontWeight: 700 }}>My Profile</h1>
        <p style={{ margin: 0, color: "#888", fontSize: "0.9em" }}>Your account summary and reviews</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "36px" }}>
        <StatCard label="Username" value={user.username} />
        <StatCard
          label="Avg. Rating Given"
          value={avgRating === null ? "—" : `${avgRating.toFixed(2)} / 5`}
        />
        <StatCard label="Reviews Written" value={String(reviews.length)} />
      </div>

      <h2 style={{ margin: "0 0 16px", fontSize: "1.1em", fontWeight: 600 }}>My Reviews</h2>

      {reviews.length === 0 ? (
        <p style={{ color: "#888" }}>You haven&apos;t written any reviews yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reviews.map((review, i) => (
            <div
              key={i}
              style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <Link
                  href={`/item/${review.itemId}`}
                  style={{ fontWeight: 600, color: "#ededed", textDecoration: "none", fontSize: "0.95em" }}
                >
                  {itemNames[review.itemId] ?? review.itemId}
                </Link>
                <span style={{ color: "#e8a020", fontSize: "0.88em", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} {review.rating}/5
                </span>
              </div>
              {review.text ? (
                <p style={{ margin: 0, color: "#aaa", fontSize: "0.88em", lineHeight: 1.5 }}>{review.text}</p>
              ) : (
                <p style={{ margin: 0, color: "#555", fontSize: "0.85em", fontStyle: "italic" }}>No review text.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "#161616",
      border: "1px solid #2a2a2a",
      borderRadius: "8px",
      padding: "14px 16px",
    }}>
      <p style={{ margin: "0 0 4px", fontSize: "0.78em", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "1.05em", fontWeight: 600 }}>{value}</p>
    </div>
  );
}
