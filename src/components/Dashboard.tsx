"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import { downloadCsv } from "@/utils/csv";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

type StudentRow = {
  id: string;
  studentName: string;
  dob: string;
  age?: number;
  schoolName: string;
  skillLevel: "Average" | "Good" | "Extraordinary";
  clusterName: string;
};

export default function Dashboard() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState("");
  const [skill, setSkill] = useState("");

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: StudentRow[] = [];
      snap.forEach((doc) => rows.push({ id: doc.id, ...(doc.data() as any) }));
      setStudents(rows);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = search
        ? [s.studentName, s.schoolName, s.clusterName].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
        : true;
      const matchCluster = cluster ? s.clusterName === cluster : true;
      const matchSkill = skill ? s.skillLevel === (skill as any) : true;
      return matchSearch && matchCluster && matchSkill;
    });
  }, [students, search, cluster, skill]);

  const total = filtered.length;
  const byCluster = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filtered) map.set(s.clusterName, (map.get(s.clusterName) ?? 0) + 1);
    return Array.from(map.entries());
  }, [filtered]);
  const bySkill = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filtered) map.set(s.skillLevel, (map.get(s.skillLevel) ?? 0) + 1);
    return Array.from(map.entries());
  }, [filtered]);

  const ages = filtered.map((s) => Number(s.age ?? 0)).filter((n) => !Number.isNaN(n) && n > 0);
  const mean = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : "0";
  const median = ages.length
    ? (() => {
        const sorted = [...ages].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return (sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]).toFixed(1);
      })()
    : "0";
  const mode = ages.length
    ? (() => {
        const counts = new Map<number, number>();
        for (const n of ages) counts.set(n, (counts.get(n) ?? 0) + 1);
        let best = ages[0];
        let bestCount = 0;
        counts.forEach((c, n) => {
          if (c > bestCount) {
            best = n;
            bestCount = c;
          }
        });
        return String(best);
      })()
    : "0";

  const clusterLabels = byCluster.map(([k]) => k);
  const clusterValues = byCluster.map(([, v]) => v);

  const skillLabels = bySkill.map(([k]) => k);
  const skillValues = bySkill.map(([, v]) => v);

  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[var(--rha-green)]">Dashboard</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card title="Total Students" value={String(total)} />
        <Card title="Mean Age" value={String(mean)} />
        <Card title="Median Age" value={String(median)} />
        <Card title="Mode Age" value={String(mode)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          className="h-10 px-3 rounded-md border"
          placeholder="Search by student, school, cluster"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input className="h-10 px-3 rounded-md border" placeholder="Filter by cluster" value={cluster} onChange={(e) => setCluster(e.target.value)} />
        <select className="h-10 px-3 rounded-md border bg-white" value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="">All skills</option>
          <option>Average</option>
          <option>Good</option>
          <option>Extraordinary</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-md p-3">
          <h3 className="font-medium mb-2">Skill Level Distribution</h3>
          <Bar
            data={{
              labels: skillLabels,
              datasets: [
                {
                  label: "Students",
                  data: skillValues,
                  backgroundColor: "#006400",
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
        <div className="bg-white border rounded-md p-3">
          <h3 className="font-medium mb-2">Cluster-wise Distribution</h3>
          <Pie
            data={{
              labels: clusterLabels,
              datasets: [
                {
                  label: "Students",
                  data: clusterValues,
                  backgroundColor: [
                    "#2563eb", // blue
                    "#f43f5e", // rose
                    "#10b981", // emerald
                    "#f59e0b", // amber
                    "#8b5cf6", // violet
                    "#ef4444", // red
                    "#14b8a6", // teal
                    "#ec4899", // pink
                    "#84cc16", // lime
                    "#06b6d4", // cyan
                  ],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>

      <div className="overflow-auto border rounded-md">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Student</Th>
              <Th>DOB</Th>
              <Th>Age</Th>
              <Th>School</Th>
              <Th>Skill</Th>
              <Th>Cluster</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <Td>{s.studentName}</Td>
                <Td>{s.dob}</Td>
                <Td>{s.age ?? "-"}</Td>
                <Td>{s.schoolName}</Td>
                <Td>{s.skillLevel}</Td>
                <Td>{s.clusterName}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => downloadCsv(filtered, "rha-ikf-students.csv")}
          className="h-10 px-4 rounded-md border text-[var(--rha-green)] hover:bg-[var(--rha-green)] hover:text-white transition"
        >
          Export CSV
        </button>
      </div>
    </section>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-[var(--rha-green)]">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-3 py-2 text-gray-700">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}


