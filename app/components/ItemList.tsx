"use client";

import { useState } from "react";
import Link from "next/link";

type Review = {
  username: string;
  text: string;
};

export type Item = {
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
  age?: number;
  material?: string;
  batteryLife?: string;
  size?: string;
};

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "vinyl", label: "Vinyls" },
  { value: "antique_furniture", label: "Antique Furniture" },
  { value: "gps_sport_watch", label: "GPS Sport Watches" },
  { value: "running_shoes", label: "Running Shoes" },
  { value: "camping_tent", label: "Camping Tents" },
];

function ItemCard({ item }: { item: Item }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", borderRadius: "6px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.name}
        style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "4px" }}
      />
      <h3 style={{ margin: "8px 0 4px" }}>{item.name}</h3>
      <p style={{ margin: "2px 0" }}>Category: {item.category}</p>
      <p style={{ margin: "2px 0" }}>Price: {item.currency}{item.price}</p>
      <p style={{ margin: "2px 0" }}>Condition: {item.condition}</p>
      <p style={{ margin: "2px 0" }}>Rating: {item.rating > 0 ? `${item.rating.toFixed(1)} / 5` : "No ratings yet"}</p>
      <Link href={`/item/${item._id}`} style={{ display: "inline-block", marginTop: "8px" }}>
        View Details
      </Link>
    </div>
  );
}

export default function ItemList({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState("all");

  const filtered =
    selected === "all" ? items : items.filter((item) => item.category === selected);

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelected(cat.value)}
            disabled={selected === cat.value}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No items in this category.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {filtered.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
