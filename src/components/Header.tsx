"use client";

import Image from "next/image";
import Link from "next/link";
import { auth, signOutUser } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";

export default function Header() {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--rha-green)] ring-2 ring-[var(--rha-green)]/20">
              <Image src="/robinhood_logo.png" alt="RHA" width={36} height={36} className="object-cover" />
            </div>
            <span className="truncate text-base sm:text-lg font-semibold text-[var(--rha-green)]">
              RHA – IKF Trial Registration
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <Link href="/" className="text-sm text-[var(--rha-green)] hover:underline">Home</Link>
              <Link href="/profile" className="text-sm text-[var(--rha-green)] hover:underline">Profile</Link>
              <Link href="/admin" className="text-sm text-[var(--rha-green)] hover:underline">Admin</Link>
              <div className="w-px h-6 bg-gray-200" />
              {user.photoURL ? (
                <Image src={user.photoURL} alt="avatar" width={32} height={32} className="rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              )}
              <span className="text-sm text-gray-700 max-w-[160px] truncate">{user.displayName}</span>
              <button
                onClick={signOutUser}
                className="h-9 px-3 rounded-md border text-[var(--rha-green)] hover:bg-[var(--rha-green)] hover:text-white transition"
              >
                Sign out
              </button>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        {user && (
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border text-[var(--rha-green)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {user && (
        <div
          className={`md:hidden overflow-hidden border-t bg-white transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="avatar" width={36} height={36} className="rounded-full" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200" />
            )}
            <span className="text-sm text-gray-700">{user.displayName}</span>
          </div>
          <div className="px-4 pb-4 grid gap-2">
            <Link onClick={() => setOpen(false)} href="/" className="h-10 rounded-md border flex items-center px-3">Home</Link>
            <Link onClick={() => setOpen(false)} href="/profile" className="h-10 rounded-md border flex items-center px-3">Profile</Link>
            <Link onClick={() => setOpen(false)} href="/admin" className="h-10 rounded-md border flex items-center px-3">Admin</Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOutUser();
              }}
              className="h-10 rounded-md border text-[var(--rha-green)] hover:bg-[var(--rha-green)] hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}


