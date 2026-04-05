import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Fatihbaba");
    const items = await db.collection("items").find({}).toArray();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, price, currency, seller, category, condition } = body;

    if (!name || price === undefined || !currency || !seller || !category || !condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item: Record<string, unknown> = {
      name,
      price: Number(price),
      currency,
      seller,
      category,
      condition,
      rating: 0,
      numRatings: 0,
      reviews: [],
    };

    if (body.description) item.description = body.description;
    if (body.image) item.image = body.image;
    if (body.age) item.age = Number(body.age);
    if (body.material) item.material = body.material;
    if (body.batteryLife) item.batteryLife = body.batteryLife;
    if (body.size) item.size = body.size;

    const client = await clientPromise;
    const db = client.db("Fatihbaba");
    await db.collection("items").insertOne(item);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { itemId } = await req.json();
    if (!itemId || !ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatihbaba");

    await db.collection("users").updateMany(
      { "reviews.itemId": itemId },
      { $pull: { reviews: { itemId } } } as object
    );

    await db.collection("items").deleteOne({ _id: new ObjectId(itemId) });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
