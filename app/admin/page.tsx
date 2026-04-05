import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import AdminDashboard from "@/app/components/AdminDashboard";

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

export type UserEntry = {
  username: string;
  email: string;
  role: string;
};

export type ItemEntry = {
  _id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
};

async function getData(): Promise<{ users: UserEntry[]; items: ItemEntry[] }> {
  const client = await clientPromise;
  const db = client.db("Fatihbaba");

  const [userDocs, itemDocs] = await Promise.all([
    db.collection("users").find({}).project({ username: 1, email: 1, role: 1 }).toArray(),
    db.collection("items").find({}).project({ name: 1, category: 1, price: 1, currency: 1 }).toArray(),
  ]);

  const users: UserEntry[] = userDocs.map((u) => ({
    username: u.username,
    email: u.email ?? "",
    role: u.role,
  }));

  const items: ItemEntry[] = itemDocs.map((i) => ({
    _id: i._id.toString(),
    name: i.name,
    category: i.category,
    price: i.price,
    currency: i.currency,
  }));

  return { users, items };
}

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const { users, items } = await getData();

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "16px" }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: 700,
          marginBottom: "24px",
        }}
      > Admin Dashboard</h1>
      <AdminDashboard users={users} items={items} />
    </main>
  );
}
