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

const CURRENCIES = ["TRY", "USD", "EUR"];

const CATEGORY_FIELDS: Record<string, Array<"age" | "material" | "batteryLife" | "size">> = {
  vinyl:             ["age"],
  antique_furniture: ["age", "material"],
  gps_sport_watch:   ["batteryLife"],
  running_shoes:     ["size", "material"],
  camping_tent:      [],
};

const emptyUserForm = { username: "", password: "", email: "", role: "user" };

const emptyItemForm = {
  name: "", description: "", price: "", currency: "USD",
  seller: "", image: "", category: "vinyl", condition: "new",
  age: "", material: "", batteryLife: "", size: "",
};

const card: React.CSSProperties = {
  background: "#161616",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  padding: "20px 24px",
  marginBottom: "20px",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82em",
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "4px",
  border: "1px solid #333",
  background: "#0f0f0f",
  color: "#ededed",
  fontSize: "0.92em",
  width: "100%",
  boxSizing: "border-box",
  // Firefox spinner removal; Chrome/Safari handled via globals.css
  MozAppearance: "textfield",
};

const selectStyle: React.CSSProperties = { ...inputStyle };

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: "0.78em",
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #2a2a2a",
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.9em",
  borderBottom: "1px solid #1e1e1e",
  verticalAlign: "middle",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "4px 12px",
  fontSize: "0.8em",
  border: "1px solid #554444",
  borderRadius: "4px",
  background: "transparent",
  color: "#cc6666",
  cursor: "pointer",
};

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Msg({ text, isError }: { text: string; isError?: boolean }) {
  return (
    <p style={{ margin: "0 0 12px", fontSize: "0.88em", color: isError ? "#cc6666" : "#66bb66" }}>
      {text}
    </p>
  );
}

export default function AdminDashboard({ users, items }: { users: UserEntry[]; items: ItemEntry[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "items">("users");

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userMsg, setUserMsg] = useState("");
  const [userIsError, setUserIsError] = useState(false);

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [itemMsg, setItemMsg] = useState("");
  const [itemIsError, setItemIsError] = useState(false);

  function showField(field: "age" | "material" | "batteryLife" | "size") {
    return CATEGORY_FIELDS[itemForm.category]?.includes(field) ?? false;
  }

  function handleCategoryChange(category: string) {
    setItemForm({ ...itemForm, category, age: "", material: "", batteryLife: "", size: "" });
  }

  async function handleAddUser(e: React.SyntheticEvent) {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    const data = await res.json();
    if (!res.ok) { setUserIsError(true); setUserMsg(data.error ?? "Failed to add user."); return; }
    setUserForm(emptyUserForm);
    setUserIsError(false);
    setUserMsg("User added successfully.");
    router.refresh();
  }

  async function handleDeleteUser(username: string) {
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) { setUserIsError(true); setUserMsg(data.error ?? "Failed to delete user."); return; }
    setUserIsError(false);
    setUserMsg(`User "${username}" deleted.`);
    router.refresh();
  }

  async function handleAddItem(e: React.SyntheticEvent) {
    e.preventDefault();
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    const data = await res.json();
    if (!res.ok) { setItemIsError(true); setItemMsg(data.error ?? "Failed to add item."); return; }
    setItemForm(emptyItemForm);
    setItemIsError(false);
    setItemMsg("Item added successfully.");
    router.refresh();
  }

  async function handleDeleteItem(itemId: string) {
    const res = await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    if (!res.ok) { setItemIsError(true); setItemMsg(data.error ?? "Failed to delete item."); return; }
    setItemIsError(false);
    setItemMsg("Item deleted.");
    router.refresh();
  }

  const activeTabStyle: React.CSSProperties = {
    padding: "8px 20px",
    background: "transparent",
    color: "#ededed",
    border: "none",
    borderBottom: "2px solid #e8a020",
    cursor: "default",
    fontWeight: 600,
    fontSize: "0.95em",
  };

  const inactiveTabStyle: React.CSSProperties = {
    padding: "8px 20px",
    background: "transparent",
    color: "#888",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontWeight: 400,
    fontSize: "0.95em",
  };

  return (
    <div>
      <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", marginBottom: "24px", gap: "4px" }}>
        <button style={tab === "users" ? activeTabStyle : inactiveTabStyle} onClick={() => setTab("users")}>
          Manage Users
        </button>
        <button style={tab === "items" ? activeTabStyle : inactiveTabStyle} onClick={() => setTab("items")}>
          Manage Items
        </button>
      </div>

      {tab === "users" && (
        <div>
          {userMsg && <Msg text={userMsg} isError={userIsError} />}

          <div style={card}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1em", fontWeight: 600 }}>Users</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={4} style={{ ...tdStyle, color: "#555", textAlign: "center" }}>No users found.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.username}>
                    <td style={tdStyle}>{u.username}</td>
                    <td style={{ ...tdStyle, color: "#888" }}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                        fontSize: "0.78em", fontWeight: 600,
                        background: u.role === "admin" ? "#2a1a00" : "#0f1f0f",
                        color: u.role === "admin" ? "#e8a020" : "#66bb66",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button style={deleteBtnStyle} onClick={() => handleDeleteUser(u.username)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1em", fontWeight: 600 }}>Add User</h2>
            <form onSubmit={handleAddUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <Field label="Username">
                <input style={inputStyle} value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required />
              </Field>
              <Field label="Password">
                <input style={inputStyle} type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              </Field>
              <Field label="Email">
                <input style={inputStyle} type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              </Field>
              <Field label="Role">
                <select style={selectStyle} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <button type="submit" style={{ padding: "9px 24px", borderRadius: "4px", background: "#e8a020", color: "#111", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.9em" }}>
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === "items" && (
        <div>
          {itemMsg && <Msg text={itemMsg} isError={itemIsError} />}

          <div style={card}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1em", fontWeight: 600 }}>Items</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan={4} style={{ ...tdStyle, color: "#555", textAlign: "center" }}>No items found.</td></tr>
                )}
                {items.map((item) => (
                  <tr key={item._id}>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={{ ...tdStyle, color: "#888" }}>{item.category}</td>
                    <td style={tdStyle}>{item.currency} {item.price}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button style={deleteBtnStyle} onClick={() => handleDeleteItem(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1em", fontWeight: 600 }}>Add Item</h2>
            <form onSubmit={handleAddItem} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <Field label="Name *">
                <input style={inputStyle} value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
              </Field>
              <Field label="Seller *">
                <input style={inputStyle} value={itemForm.seller} onChange={(e) => setItemForm({ ...itemForm, seller: e.target.value })} required />
              </Field>
              <Field label="Price *">
                <input style={inputStyle} type="text" inputMode="decimal" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
              </Field>
              <Field label="Currency *">
                <select style={selectStyle} value={itemForm.currency} onChange={(e) => setItemForm({ ...itemForm, currency: e.target.value })}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Category *">
                <select style={selectStyle} value={itemForm.category} onChange={(e) => handleCategoryChange(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Condition *">
                <select style={selectStyle} value={itemForm.condition} onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </Field>

              <Field label="Description">
                <input style={inputStyle} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
              </Field>
              <Field label="Image URL">
                <input style={inputStyle} value={itemForm.image} onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })} />
              </Field>

              {showField("age") && (
                <Field label="Age (years)">
                  <input style={inputStyle} type="text" inputMode="numeric" value={itemForm.age} onChange={(e) => setItemForm({ ...itemForm, age: e.target.value })} />
                </Field>
              )}
              {showField("material") && (
                <Field label="Material">
                  <input style={inputStyle} value={itemForm.material} onChange={(e) => setItemForm({ ...itemForm, material: e.target.value })} />
                </Field>
              )}
              {showField("batteryLife") && (
                <Field label="Battery Life">
                  <input style={inputStyle} value={itemForm.batteryLife} onChange={(e) => setItemForm({ ...itemForm, batteryLife: e.target.value })} />
                </Field>
              )}
              {showField("size") && (
                <Field label="Size">
                  <input style={inputStyle} value={itemForm.size} onChange={(e) => setItemForm({ ...itemForm, size: e.target.value })} />
                </Field>
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                <button type="submit" style={{ padding: "9px 24px", borderRadius: "4px", background: "#e8a020", color: "#111", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.9em" }}>
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
