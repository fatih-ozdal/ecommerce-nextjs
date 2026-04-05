import { cookies } from "next/headers";
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
  const res = await fetch("http://localhost:3000/api/items", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export default async function Home() {
  const session = await getSession();
  const items = await getItems();

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
