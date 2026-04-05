"use client";

import { useState } from "react";

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

export default function ItemList({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState("all");

  const filtered =
    selected === "all" ? items : items.filter((item) => item.category === selected);

  return (
    <div>
      <div>
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
        <ul>
          {filtered.map((item) => (
            <li key={item._id}>
              <strong>{item.name}</strong> — {item.category} — {item.currency}{item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
