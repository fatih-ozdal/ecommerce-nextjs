"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserEntry, ItemEntry } from "@/app/admin/page";

const CATEGORIES = [
  "vinyl",
  "antique_furniture",
  "gps_sport_watch",
  "running_shoes",
  "camping_tent",
];

// Declares which category-specific fields are relevant per category
const CATEGORY_FIELDS: Record<string, Array<"age" | "material" | "batteryLife" | "size">> = {
  vinyl:             ["age"],
  antique_furniture: ["age", "material"],
  gps_sport_watch:   ["batteryLife"],
  running_shoes:     ["size", "material"],
  camping_tent:      [],
};

const emptyUserForm = { username: "", password: "", email: "", role: "user" };

const emptyItemForm = {
  name: "",
  description: "",
  price: "",
  currency: "$",
  seller: "",
  image: "",
  category: "vinyl",
  condition: "new",
  age: "",
  material: "",
  batteryLife: "",
  size: "",
};

export default function AdminDashboard({
  users,
  items,
}: {
  users: UserEntry[];
  items: ItemEntry[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "items">("users");

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userMsg, setUserMsg] = useState("");

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [itemMsg, setItemMsg] = useState("");

  // Returns true if the given optional field is relevant for the currently selected category
  function showField(field: "age" | "material" | "batteryLife" | "size") {
    return CATEGORY_FIELDS[itemForm.category]?.includes(field) ?? false;
  }

  // When category changes, reset all category-specific fields to prevent stale values being submitted
  function handleCategoryChange(category: string) {
    setItemForm({
      ...itemForm,
      category,
      age: "",
      material: "",
      batteryLife: "",
      size: "",
    });
  }

  // --- User handlers ---
  async function handleAddUser(e: React.SyntheticEvent) {
    e.preventDefault();
    setUserMsg("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    const data = await res.json();
    if (!res.ok) { setUserMsg(data.error ?? "Failed to add user."); return; }
    setUserForm(emptyUserForm);
    setUserMsg("User added.");
    router.refresh();
  }

  async function handleDeleteUser(username: string) {
    setUserMsg("");
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) { setUserMsg(data.error ?? "Failed to delete user."); return; }
    setUserMsg(`User "${username}" deleted.`);
    router.refresh();
  }

  // --- Item handlers ---
  async function handleAddItem(e: React.SyntheticEvent) {
    e.preventDefault();
    setItemMsg("");
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    const data = await res.json();
    if (!res.ok) { setItemMsg(data.error ?? "Failed to add item."); return; }
    setItemForm(emptyItemForm);
    setItemMsg("Item added.");
    router.refresh();
  }

  async function handleDeleteItem(itemId: string) {
    setItemMsg("");
    const res = await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    if (!res.ok) { setItemMsg(data.error ?? "Failed to delete item."); return; }
    setItemMsg("Item deleted.");
    router.refresh();
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ marginBottom: "16px" }}>
        <button onClick={() => setTab("users")} disabled={tab === "users"} style={{ marginRight: "8px" }}>
          Manage Users
        </button>
        <button onClick={() => setTab("items")} disabled={tab === "items"}>
          Manage Items
        </button>
      </div>

      {/* ── Users tab ── */}
      {tab === "users" && (
        <div>
          {userMsg && <p>{userMsg}</p>}

          <h2>Users</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Username</th>
                <th style={{ textAlign: "left" }}>Email</th>
                <th style={{ textAlign: "left" }}>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username} style={{ borderTop: "1px solid #ddd" }}>
                  <td style={{ padding: "6px 0" }}>{u.username}</td>
                  <td style={{ padding: "6px 0" }}>{u.email}</td>
                  <td style={{ padding: "6px 0" }}>{u.role}</td>
                  <td style={{ padding: "6px 0" }}>
                    <button onClick={() => handleDeleteUser(u.username)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Add User</h2>
          <form onSubmit={handleAddUser}>
            <div><label>Username&nbsp;
              <input value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required />
            </label></div>
            <div><label>Password&nbsp;
              <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
            </label></div>
            <div><label>Email&nbsp;
              <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
            </label></div>
            <div><label>Role&nbsp;
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label></div>
            <button type="submit" style={{ marginTop: "8px" }}>Add User</button>
          </form>
        </div>
      )}

      {/* ── Items tab ── */}
      {tab === "items" && (
        <div>
          {itemMsg && <p>{itemMsg}</p>}

          <h2>Items</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "left" }}>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderTop: "1px solid #ddd" }}>
                  <td style={{ padding: "6px 0" }}>{item.name}</td>
                  <td style={{ padding: "6px 0" }}>{item.category}</td>
                  <td style={{ padding: "6px 0" }}>{item.currency}{item.price}</td>
                  <td style={{ padding: "6px 0" }}>
                    <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Add Item</h2>
          <form onSubmit={handleAddItem}>
            {/* Required shared fields */}
            <div><label>Name&nbsp;
              <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
            </label></div>
            <div><label>Price&nbsp;
              <input type="number" min="0" step="0.01" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
            </label></div>
            <div><label>Currency&nbsp;
              <input value={itemForm.currency} onChange={(e) => setItemForm({ ...itemForm, currency: e.target.value })} required />
            </label></div>
            <div><label>Seller&nbsp;
              <input value={itemForm.seller} onChange={(e) => setItemForm({ ...itemForm, seller: e.target.value })} required />
            </label></div>
            <div><label>Category&nbsp;
              <select value={itemForm.category} onChange={(e) => handleCategoryChange(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label></div>
            <div><label>Condition&nbsp;
              <select value={itemForm.condition} onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}>
                <option value="new">new</option>
                <option value="used">used</option>
              </select>
            </label></div>

            {/* Optional shared fields */}
            <div><label>Description&nbsp;
              <input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
            </label></div>
            <div><label>Image URL&nbsp;
              <input value={itemForm.image} onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })} />
            </label></div>

            {/* Category-specific optional fields */}
            {showField("age") && (
              <div><label>Age (years)&nbsp;
                <input type="number" min="0" value={itemForm.age} onChange={(e) => setItemForm({ ...itemForm, age: e.target.value })} />
              </label></div>
            )}
            {showField("material") && (
              <div><label>Material&nbsp;
                <input value={itemForm.material} onChange={(e) => setItemForm({ ...itemForm, material: e.target.value })} />
              </label></div>
            )}
            {showField("batteryLife") && (
              <div><label>Battery Life&nbsp;
                <input value={itemForm.batteryLife} onChange={(e) => setItemForm({ ...itemForm, batteryLife: e.target.value })} />
              </label></div>
            )}
            {showField("size") && (
              <div><label>Size&nbsp;
                <input value={itemForm.size} onChange={(e) => setItemForm({ ...itemForm, size: e.target.value })} />
              </label></div>
            )}

            <button type="submit" style={{ marginTop: "8px" }}>Add Item</button>
          </form>
        </div>
      )}
    </div>
  );
}
