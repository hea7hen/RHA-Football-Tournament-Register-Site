"use client";

import { signInWithGooglePopup } from "@/lib/firebase";

export default function SignIn() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-white rounded-2xl shadow-md border w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--rha-green)]" />
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--rha-green)]">RHA – IKF Student Trial Registration</h1>
        <p className="text-sm text-gray-600">Please sign in with your Google account to continue</p>
        <button
          onClick={signInWithGooglePopup}
          className="w-full h-11 rounded-full bg-[var(--rha-green)] text-white hover:opacity-90 transition font-medium"
        >
          Continue with Google
        </button>
        <p className="text-xs text-gray-500">Only authenticated Robins can access the portal.</p>
      </div>
    </div>
  );
}


