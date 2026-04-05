import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import ReviewSection from "@/app/components/ReviewSection";

type Session = { username: string; role: string };

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

async function getSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const raw = jar.get("session")?.value;
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function getItem(id: string): Promise<Item | null> {
  if (!ObjectId.isValid(id)) return null;
  const client = await clientPromise;
  const db = client.db("Fatihbaba");
  const doc = await db.collection("items").findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { ...doc, _id: doc._id.toString() } as Item;
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: "1px solid #1e1e1e" }}>
      <span style={{ minWidth: "110px", color: "#888", fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.03em", paddingTop: "1px" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.92em" }}>{value}</span>
    </div>
  );
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, session] = await Promise.all([getItem(id), getSession()]);

  if (!item) {
    return (
      <main style={{ padding: "48px", textAlign: "center", color: "#888" }}>
        <p>Item not found.</p>
      </main>
    );
  }

  const reviewCount = item.reviews?.length ?? 0;
  const ratingDisplay = reviewCount === 0 ? "No ratings yet" : `${item.rating.toFixed(1)} / 5 (${reviewCount})`;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px" }}>

      {/* ── Top section: image + details ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "32px",
        marginBottom: "40px",
        alignItems: "start",
      }}>
        {/* Left: image */}
        <div style={{
          background: "#1a1a1a",
          borderRadius: "8px",
          overflow: "hidden",
          aspectRatio: "1 / 1",
        }}>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
              No image
            </div>
          )}
        </div>

        {/* Right: details */}
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: "1.5em", fontWeight: 700, lineHeight: 1.2 }}>
            {item.name}
          </h1>

          <p style={{ margin: "0 0 16px", fontSize: "1.5em", fontWeight: 700, color: "#e8a020" }}>
            {item.currency} {item.price}
          </p>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "0.9em", color: "#aaa" }}>
              ★ {ratingDisplay}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <DetailRow label="Seller" value={item.seller} />
            <DetailRow label="Condition" value={item.condition} />
            <DetailRow label="Category" value={item.category} />
            {item.age !== undefined && <DetailRow label="Age" value={`${item.age} years`} />}
            {item.material && <DetailRow label="Material" value={item.material} />}
            {item.batteryLife && <DetailRow label="Battery Life" value={item.batteryLife} />}
            {item.size && <DetailRow label="Size" value={item.size} />}
          </div>

          {item.description && (
            <p style={{ margin: "16px 0 0", fontSize: "0.9em", color: "#aaa", lineHeight: 1.6 }}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom section: reviews ── */}
      <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "32px" }}>
        <ReviewSection
          itemId={item._id}
          session={session}
          reviews={item.reviews ?? []}
        />
      </div>

    </main>
  );
}
