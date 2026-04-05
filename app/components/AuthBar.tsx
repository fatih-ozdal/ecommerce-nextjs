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
    return <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Login</Link>;
  }

  return (
    <span>
      {session.username} ({session.role}){" "}
      {session.role === "user" && (
        <Link href="/user" style={{ marginRight: "8px" }}>My Profile</Link>
      )}
      <button onClick={handleLogout}>Logout</button>
    </span>
  );
}
