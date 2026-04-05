import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import AuthBar from "./AuthBar";
import BackButton from "./BackButton";

type Session = { username: string; role: string };

async function getSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const raw = jar.get("session")?.value;
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export default async function Header() {
  const session = await getSession();

  return (
    <header style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      padding: "12px 24px",
      backgroundColor: "#111",
      borderBottom: "1px solid #333",
    }}>
      {/* Left: Go Back */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <BackButton />
      </div>

      {/* Center: Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/logo.png" alt="Fatihbaba" height={40} width={160} style={{ objectFit: "contain", height: "auto" }} />
      </Link>

      {/* Right: Auth/nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <AuthBar session={session} callbackUrl="/" />
      </div>
    </header>
  );
}
