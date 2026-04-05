"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {mode === "register" && (
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      )}
      {error && <p>{error}</p>}
      <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      <p>
        {mode === "login" ? "No account?" : "Already have an account?"}{" "}
        <button type="button" onClick={switchMode}>
          {mode === "login" ? "Register" : "Back to Login"}
        </button>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <Suspense>
        <AuthForm />
      </Suspense>
    </main>
  );
}
