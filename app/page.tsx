import ItemList, { type Item } from "./components/ItemList";

async function getItems(): Promise<Item[]> {
  const res = await fetch("http://localhost:3000/api/items", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export default async function Home() {
  const items = await getItems();

  return (
    <main>
      <h1>E-Commerce App</h1>
      <ItemList items={items} />
    </main>
  );
}
