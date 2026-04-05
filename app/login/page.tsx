"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const inputStyle: React.CSSProperties = {
  padding: "9px 12px",
  borderRadius: "4px",
  border: "1px solid #444",
  background: "#1a1a1a",
  color: "#ededed",
  fontSize: "0.95em",
  width: "100%",
  boxSizing: "border-box",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "4px",
  border: "none",
  background: "#e8a020",
  color: "#111",
  fontWeight: 600,
  fontSize: "0.95em",
  cursor: "pointer",
  marginTop: "4px",
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    const endpoint = mode === "login" ? "/api/login" : "/api/register";
    const body = mode === "login"
      ? { username, password }
      : { username, password, email };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? `${mode === "login" ? "Login" : "Registration"} failed`);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  return (
    <>
      <h1 style={{ margin: "0 0 20px", fontSize: "1.4em", fontWeight: 600 }}>
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={fieldStyle}>
          <label style={{ fontSize: "0.9em", fontWeight: 500 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={{ fontSize: "0.9em", fontWeight: 500 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        {mode === "register" && (
          <div style={fieldStyle}>
            <label style={{ fontSize: "0.9em", fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        )}

        {error && (
          <p style={{ margin: 0, color: "#e05555", fontSize: "0.88em" }}>{error}</p>
        )}

        <button type="submit" style={primaryBtnStyle}>
          {mode === "login" ? "Login" : "Create Account"}
        </button>

        <p style={{ margin: 0, textAlign: "center", fontSize: "0.88em", color: "#888" }}>
          {mode === "login" ? "New to Fatihbaba?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            style={{ background: "none", border: "none", color: "#e8a020", cursor: "pointer", padding: 0, fontSize: "inherit" }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <main style={{
      minHeight: "calc(100vh - 65px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "360px",
        background: "#161616",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "32px 28px",
      }}>
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
