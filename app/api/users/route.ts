import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

async function verifyAdmin(): Promise<boolean> {
  try {
    const jar = await cookies();
    const raw = jar.get("session")?.value;
    if (!raw) return false;
    const session = JSON.parse(raw) as { role: string };
    return session.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { username, password, email, role = "user" } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json({ error: "Username, password, and email are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatihbaba");

    const existing = await db.collection("users").findOne({ username });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    await db.collection("users").insertOne({
      username,
      password,
      email,
      role,
      reviews: [],
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatihbaba");

    // Remove this user's reviews from all items and recalculate rating/numRatings
    const items = await db
      .collection("items")
      .find({ "reviews.username": username })
      .toArray();

    for (const item of items) {
      const updatedReviews = (item.reviews as Array<{ username: string; rating: number; text: string }>)
        .filter((r) => r.username !== username);
      const numRatings = updatedReviews.length;
      const rating =
        numRatings === 0
          ? 0
          : updatedReviews.reduce((sum, r) => sum + r.rating, 0) / numRatings;

      await db.collection("items").updateOne(
        { _id: item._id },
        { $set: { reviews: updatedReviews, rating, numRatings } }
      );
    }

    await db.collection("users").deleteOne({ username });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
