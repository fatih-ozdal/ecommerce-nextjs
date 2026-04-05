"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Session = { username: string; role: string };

export default function AuthBar({
  session,
  callbackUrl = "/",
}: {
  session: Session | null;
  callbackUrl?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  }

  if (!session) {
    return <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="nav-btn">Login</Link>;
  }

  return (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color: "#aaa", fontSize: "0.9em" }}>{session.username} ({session.role})</span>
      {session.role === "user" && (
        <Link href="/user" className="nav-btn">My Profile</Link>
      )}
      {session.role === "admin" && (
        <Link href="/admin" className="nav-btn">Admin Dashboard</Link>
      )}
      <button className="nav-btn" onClick={handleLogout}>Logout</button>
    </span>
  );
}
