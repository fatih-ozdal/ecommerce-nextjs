import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type Review = {
  username: string;
  text: string;
  rating: number;
};

type Item = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  seller: string;
  image?: string;
  category: string;
  condition: string;
  rating: number;
  numRatings: number;
  reviews: Review[];
  age?: number;
  material?: string;
  batteryLife?: string;
  size?: string;
};

async function getItem(id: string): Promise<Item | null> {
  if (!ObjectId.isValid(id)) return null;

  const client = await clientPromise;
  const db = client.db("Fatihbaba");
  const doc = await db.collection("items").findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  return { ...doc, _id: doc._id.toString() } as Item;
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <p style={{ margin: "4px 0" }}>
      <strong>{label}:</strong> {value}
    </p>
  );
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    return (
      <main>
        <h1>Item not found</h1>
      </main>
    );
  }

  const reviewCount = item.reviews?.length ?? 0;
  const ratingDisplay =
    reviewCount === 0 ? "0" : `${item.rating.toFixed(1)} (${reviewCount})`;

  return (
    <main style={{ maxWidth: "700px", margin: "0 auto", padding: "16px" }}>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.name}
          style={{ width: "100%", maxHeight: "360px", objectFit: "cover", borderRadius: "6px" }}
        />
      )}
      <h1 style={{ margin: "16px 0 8px" }}>{item.name}</h1>
      <Field label="Category" value={item.category} />
      <Field label="Price" value={`${item.currency}${item.price}`} />
      <Field label="Condition" value={item.condition} />
      <Field label="Seller" value={item.seller} />
      <Field label="Rating" value={ratingDisplay} />
      {item.description && <Field label="Description" value={item.description} />}
      {item.age !== undefined && <Field label="Age" value={`${item.age} years`} />}
      {item.material && <Field label="Material" value={item.material} />}
      {item.batteryLife && <Field label="Battery Life" value={item.batteryLife} />}
      {item.size && <Field label="Size" value={item.size} />}

      <h2 style={{ marginTop: "24px" }}>Reviews</h2>
      {reviewCount === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {item.reviews.map((review, i) => (
            <li key={i} style={{ borderTop: "1px solid #ddd", padding: "8px 0" }}>
              <strong>{review.username}</strong> — {review.rating}/5
              <p style={{ margin: "4px 0 0" }}>{review.text}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
