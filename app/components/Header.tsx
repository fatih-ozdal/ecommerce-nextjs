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
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 24px",
      backgroundColor: "#111",
      borderBottom: "1px solid #333",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center" }}>
        <Image src="/logo.png" alt="Fatihbaba" height={40} width={160} style={{ objectFit: "contain" }} />
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <BackButton />
        <AuthBar session={session} callbackUrl="/" />
      </nav>
    </header>
  );
}
