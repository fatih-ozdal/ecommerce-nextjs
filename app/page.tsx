import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import AuthBar from "./components/AuthBar";
import ItemList, { type Item } from "./components/ItemList";

type Session = { username: string; role: string };

async function getSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const raw = jar.get("session")?.value;
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function getItems(): Promise<Item[]> {
  const client = await clientPromise;
  const db = client.db("Fatihbaba");
  const docs = await db.collection("items").find({}).toArray();
  return docs.map((doc) => ({ ...doc, _id: doc._id.toString() })) as Item[];
}

export default async function Home() {
  const [session, items] = await Promise.all([getSession(), getItems()]);

  return (
    <main>
      <div>
        <h1>E-Commerce App</h1>
        <AuthBar session={session} callbackUrl="/" />
      </div>
      <ItemList items={items} />
    </main>
  );
}
