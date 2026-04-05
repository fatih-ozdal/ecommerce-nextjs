import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { username, password, email } = await req.json();

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
      role: "user",
      reviews: [],
    });

    const res = NextResponse.json({ success: true, username, role: "user" });
    res.cookies.set("session", JSON.stringify({ username, role: "user" }), {
      httpOnly: true,
      path: "/",
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
