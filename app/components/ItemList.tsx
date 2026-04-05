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
  const ratingDisplay = item.numRatings > 0 ? item.rating.toFixed(1) : "—";

  return (
    <Link href={`/item/${item._id}`} className="item-card">
      {/* Image */}
      <div style={{ width: "100%", height: "220px", background: "#1a1a1a", overflow: "hidden" }}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
            No image
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "10px 12px" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: "0.95em", lineHeight: 1.3 }}>
          {item.name}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9em", color: "#aaa" }}>
          <span>{item.currency}{item.price}</span>
          <span>★ {ratingDisplay}</span>
        </div>
      </div>
    </Link>
  );
}

export default function ItemList({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState("all");

  const filtered =
    selected === "all" ? items : items.filter((item) => item.category === selected);

  return (
    <div>
      {/* Category filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
        }}>
          {filtered.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
