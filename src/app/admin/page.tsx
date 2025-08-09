"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, DocumentData } from "firebase/firestore";
import { useRouter } from "next/navigation";

type StudentRow = {
  id: string;
  studentName: string;
  dob: string;
  age?: number;
  schoolName: string;
  skillLevel: "Average" | "Good" | "Extraordinary";
  clusterName: string;
};

type UserRow = {
  id: string;
  displayName?: string;
  contact?: string;
  schoolName?: string;
  clusterName?: string;
  email?: string;
};

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function AdminPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [robins, setRobins] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const s = await getDocs(query(collection(db, "students")));
      const r = await getDocs(query(collection(db, "users")));
      setStudents(
        s.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as StudentRow))
      );
      setRobins(
        r.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as UserRow))
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ok) loadAll();
  }, [ok]);

  if (!user) return <div className="p-6">Please sign in first.</div>;

  if (!ok) {
    return (
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold mb-1">Admin Access</h1>
        <p className="text-sm text-gray-600 mb-3">Only admins can access this page.</p>
        <input
          type="password"
          placeholder="Enter admin password"
          className="w-full h-10 px-3 rounded-md border mb-3"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOk(pass === ADMIN_PASS)}
            className="h-10 px-4 rounded-md bg-[var(--rha-green)] text-white"
          >
            Continue
          </button>
          <button
            onClick={() => setPass("")}
            className="h-10 px-4 rounded-md border"
          >
            Cancel
          </button>
        </div>
        {pass && pass !== ADMIN_PASS && <p className="text-sm text-red-600 mt-2">You are not the admin.</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--rha-green)]">Admin Panel</h1>
        <button className="h-9 px-3 rounded-md border" onClick={() => router.push("/")}>Back to Home</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Students</h2>
        <div className="overflow-auto border rounded-md">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Student</Th>
                <Th>DOB</Th>
                <Th>Age</Th>
                <Th>School</Th>
                <Th>Skill</Th>
                <Th>Cluster</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <Td><InlineEdit value={s.studentName} onSave={(v) => updateDoc(doc(db, "students", s.id), { studentName: v })} /></Td>
                  <Td><InlineEdit value={s.dob} onSave={(v) => updateDoc(doc(db, "students", s.id), { dob: v })} /></Td>
                  <Td>{s.age ?? "-"}</Td>
                  <Td><InlineEdit value={s.schoolName} onSave={(v) => updateDoc(doc(db, "students", s.id), { schoolName: v })} /></Td>
                  <Td>
                    <InlineEdit
                      value={s.skillLevel}
                      onSave={(v) => updateDoc(doc(db, "students", s.id), { skillLevel: v as StudentRow["skillLevel"] })}
                    />
                  </Td>
                  <Td><InlineEdit value={s.clusterName} onSave={(v) => updateDoc(doc(db, "students", s.id), { clusterName: v })} /></Td>
                  <Td>
                    <button
                      className="text-red-600"
                      onClick={async () => {
                        try {
                          if (!confirm(`Delete ${s.studentName}?`)) return;
                          await deleteDoc(doc(db, "students", s.id));
                          await loadAll();
                        } catch (e) {
                          const message = e instanceof Error ? e.message : "Delete failed: check Firestore rules/App Check.";
                          setError(message);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Robins</h2>
        <div className="overflow-auto border rounded-md">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>School</Th>
                <Th>Cluster</Th>
                <Th>Email</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {robins.map((r) => (
                <tr key={r.id} className="border-t">
                  <Td><InlineEdit value={r.displayName ?? ""} onSave={(v) => updateDoc(doc(db, "users", r.id), { displayName: v })} /></Td>
                  <Td><InlineEdit value={r.contact ?? ""} onSave={(v) => updateDoc(doc(db, "users", r.id), { contact: v })} /></Td>
                  <Td><InlineEdit value={r.schoolName ?? ""} onSave={(v) => updateDoc(doc(db, "users", r.id), { schoolName: v })} /></Td>
                  <Td><InlineEdit value={r.clusterName ?? ""} onSave={(v) => updateDoc(doc(db, "users", r.id), { clusterName: v })} /></Td>
                  <Td>{r.email}</Td>
                  <Td>
                    <button
                      className="text-red-600"
                      onClick={async () => {
                        try {
                          if (!confirm(`Delete ${r.displayName ?? r.email ?? r.id}?`)) return;
                          await deleteDoc(doc(db, "users", r.id));
                          await loadAll();
                        } catch (e) {
                          const message = e instanceof Error ? e.message : "Delete failed: check Firestore rules/App Check.";
                          setError(message);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-3 py-2 text-gray-700">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}

function InlineEdit({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> }) {
  const [v, setV] = useState(value);
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input className="h-9 px-2 rounded border" value={v} onChange={(e) => setV(e.target.value)} />
      <button
        disabled={saving}
        className="h-9 px-3 rounded bg-[var(--rha-green)] text-white disabled:opacity-60"
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(v);
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving" : "Save"}
      </button>
    </div>
  );
}


