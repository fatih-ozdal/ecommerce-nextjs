import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

function buildUpdatedText(oldText: string, newText: string): string {
  if (newText === "") return oldText;
  if (oldText === "") return newText;
  return oldText + "\nEdit: " + newText;
}

export async function POST(req: NextRequest) {
  try {
    // Verify session
    const jar = await cookies();
    const raw = jar.get("session")?.value;
    if (!raw) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    const session = JSON.parse(raw) as { username: string; role: string };
    const username = session.username;

    const { itemId, rating, text } = await req.json();

    if (!itemId || !ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be a number between 1 and 5" }, { status: 400 });
    }
    const newText: string = typeof text === "string" ? text : "";

    const client = await clientPromise;
    const db = client.db("Fatihbaba");
    const itemsCol = db.collection("items");
    const usersCol = db.collection("users");

    const item = await itemsCol.findOne({ _id: new ObjectId(itemId) });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const reviews: Array<{ username: string; text: string; rating: number }> =
      item.reviews ?? [];
    const existingIndex = reviews.findIndex((r) => r.username === username);

    if (existingIndex === -1) {
      // New review
      reviews.push({ username, text: newText, rating });
    } else {
      // Update existing review
      const oldText = reviews[existingIndex].text;
      reviews[existingIndex] = {
        username,
        text: buildUpdatedText(oldText, newText),
        rating,
      };
    }

    // Recalculate aggregate fields
    const numRatings = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / numRatings;

    // Update items collection
    await itemsCol.updateOne(
      { _id: new ObjectId(itemId) },
      { $set: { reviews, rating: avgRating, numRatings } }
    );

    // Update users collection: replace this user's review for this item
    const userReview = { itemId, text: reviews[existingIndex === -1 ? reviews.length - 1 : existingIndex].text, rating };
    const userDoc = await usersCol.findOne({ username });
    if (userDoc) {
      const userReviews: Array<{ itemId: string; text: string; rating: number }> =
        userDoc.reviews ?? [];
      const userReviewIndex = userReviews.findIndex((r) => r.itemId === itemId);
      if (userReviewIndex === -1) {
        userReviews.push(userReview);
      } else {
        userReviews[userReviewIndex] = userReview;
      }
      await usersCol.updateOne({ username }, { $set: { reviews: userReviews } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
