import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatihbaba");
    const user = await db.collection("users").findOne({ username, password });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, username: user.username, role: user.role });

    res.cookies.set("session", JSON.stringify({ username: user.username, role: user.role }), {
      httpOnly: true,
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
