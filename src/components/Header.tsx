"use client";

import Image from "next/image";
import Link from "next/link";
import { auth, signOutUser } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Header() {
  const [user] = useAuthState(auth);
  return (
    <header className="w-full sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--rha-green)]">
            <Image src="/robinhood_logo.png" alt="RHA" width={36} height={36} className="object-cover" />
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-[var(--rha-green)]">RHA – IKF Trial Registration</h1>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[var(--rha-green)] hover:underline hidden sm:inline">Home</Link>
            <Link href="/profile" className="text-sm text-[var(--rha-green)] hover:underline">Profile</Link>
            <Link href="/admin" className="text-sm text-[var(--rha-green)] hover:underline">Admin</Link>
            {user.photoURL ? (
              <Image src={user.photoURL} alt="avatar" width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            )}
            <span className="hidden sm:block text-sm text-gray-700">{user.displayName}</span>
            <button
              onClick={signOutUser}
              className="h-9 px-3 rounded-md border text-[var(--rha-green)] hover:bg-[var(--rha-green)] hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


