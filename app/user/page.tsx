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
      <main>
        <h1>Profile not found</h1>
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
    <main style={{ maxWidth: "700px", margin: "0 auto", padding: "16px" }}>
      <h1>My Profile</h1>
      <p><strong>Username:</strong> {user.username}</p>
      <p>
        <strong>Average Rating Given:</strong>{" "}
        {avgRating === null ? "No ratings yet" : avgRating.toFixed(2)}
      </p>

      <h2 style={{ marginTop: "24px" }}>My Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reviews.map((review, i) => (
            <li key={i} style={{ borderTop: "1px solid #ddd", padding: "8px 0" }}>
              <p style={{ margin: "2px 0" }}>
                <strong>
                  <Link href={`/item/${review.itemId}`}>
                    {itemNames[review.itemId] ?? review.itemId}
                  </Link>
                </strong>
              </p>
              <p style={{ margin: "2px 0" }}><strong>Rating:</strong> {review.rating}/5</p>
              {review.text && <p style={{ margin: "2px 0" }}>{review.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
