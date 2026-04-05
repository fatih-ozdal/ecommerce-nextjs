import clientPromise from "@/lib/mongodb";
import ItemList, { type Item } from "./components/ItemList";

async function getItems(): Promise<Item[]> {
  const client = await clientPromise;
  const db = client.db("Fatihbaba");
  const docs = await db.collection("items").find({}).toArray();
  return docs.map((doc) => ({ ...doc, _id: doc._id.toString() })) as Item[];
}

export default async function Home() {
  const items = await getItems();

  return (
    <main style={{ padding: "16px" }}>
      <ItemList items={items} />
    </main>
  );
}
