"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "@/components/SignIn";
import RobinForm, { type RobinInfo } from "@/components/RobinForm";
import StudentForm from "@/components/StudentForm";
import Rules from "@/components/Rules";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { db, auth as firebaseAuth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [user] = useAuthState(auth);
  const [robin, setRobin] = useState<RobinInfo | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    async function loadRobin() {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.data() as any;
      if (data) {
        setRobin({
          robinName: data.displayName ?? "",
          robinContact: data.contact ?? "",
          schoolName: data.schoolName ?? "",
          clusterName: data.clusterName ?? "",
        });
      }
    }
    loadRobin();
  }, [user]);

  return (
    <div className="min-h-dvh bg-white">
      <style jsx global>{`
        :root { --rha-green: #006400; --rha-green-hover: #0a7a0a; }
        body { background: #ffffff; color: #0a0a0a; }
      `}</style>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {!user && <SignIn />}
        {user && !robin && (
          <div className="space-y-4">
            <SignInHidden />
            <RobinForm onSaved={(d) => setRobin(d)} />
          </div>
        )}
        {user && robin && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl border bg-white">
              <div className="absolute inset-0 bg-[url('/pitch-lines.svg')] opacity-5" />
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-md border p-3 bg-white/80 backdrop-blur">
                  <div className="text-xs text-gray-500">Robin</div>
                  <div className="font-medium">{robin.robinName}</div>
                </div>
                <div className="rounded-md border p-3 bg-white/80 backdrop-blur">
                  <div className="text-xs text-gray-500">Cluster</div>
                  <div className="font-medium">{robin.clusterName}</div>
                </div>
                <div className="rounded-md border p-3 bg-white/80 backdrop-blur">
                  <div className="text-xs text-gray-500">Session Students</div>
                  <div className="font-medium text-[var(--rha-green)]">{sessionCount}</div>
                </div>
              </div>
            </div>
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-md border p-3">
                <div className="text-xs text-gray-500">Robin</div>
                <div className="font-medium">{robin.robinName}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-gray-500">Cluster</div>
                <div className="font-medium">{robin.clusterName}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-gray-500">Session Students</div>
                <div className="font-medium text-[var(--rha-green)]">{sessionCount}</div>
              </div>
            </div> */}

            <Rules agreed={agreed} onChange={setAgreed} />

            <StudentForm
              defaultSchool={robin.schoolName}
              defaultCluster={robin.clusterName}
              onAdded={() => setSessionCount((c) => c + 1)}
              isAgreed={agreed}
            />

            <Dashboard />
          </div>
        )}
      </main>
    </div>
  );
}

function SignInHidden() {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <p className="text-sm text-gray-700">You are signed in. Please fill your Robin details to continue.</p>
    </div>
  );
}
