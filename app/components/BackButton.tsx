"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  return (
    <button
      onClick={() => { if (!isHome) router.back(); }}
      disabled={isHome}
      aria-disabled={isHome}
    >
      Go Back
    </button>
  );
}
