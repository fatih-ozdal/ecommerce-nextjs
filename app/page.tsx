type Review = {
  username: string;
  text: string;
};

type Item = {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  seller: string;
  image: string;
  category: string;
  condition: string;
  rating: number;
  numRatings: number;
  ratings: Record<string, number>;
  reviews: Review[];
  // category-specific optional fields
  age?: number;
  material?: string;
  batteryLife?: string;
  size?: string;
};

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
      {items.length === 0 ? (
        <p>No items available.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              <strong>{item.name}</strong> — {item.category} — {item.currency}{item.price}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
