"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import RobinForm, { type RobinInfo } from "@/components/RobinForm";

export default function ProfilePage() {
  const [user] = useAuthState(auth);
  const [initial, setInitial] = useState<RobinInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data() as any;
      if (data) {
        setInitial({
          robinName: data.displayName ?? "",
          robinContact: data.contact ?? "",
          schoolName: data.schoolName ?? "",
          clusterName: data.clusterName ?? "",
        });
      }
    }
    load();
  }, [user]);

  if (!user) return <div className="p-6">Please sign in.</div>;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--rha-green)]">Your Profile</h1>
        <button className="h-9 px-3 rounded-md border" onClick={() => router.push("/")}>Back to Home</button>
      </div>
      <RobinForm initial={initial ?? undefined} onSaved={() => router.push("/")} />
    </div>
  );
}


