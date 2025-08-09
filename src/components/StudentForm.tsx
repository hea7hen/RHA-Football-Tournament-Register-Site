"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { calculateAgeFromDobString } from "@/utils/age";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";

const schema = z.object({
  studentName: z.string().min(2, "Required"),
  dob: z.string().min(4, "Required"),
  schoolName: z.string().min(2, "Required"),
  skillLevel: z.enum(["Average", "Good", "Extraordinary"]),
  clusterName: z.string().min(2, "Required"),
});

export type Student = z.infer<typeof schema> & { age?: number };

export default function StudentForm({
  defaultSchool,
  defaultCluster,
  onAdded,
  isAgreed,
}: {
  defaultSchool: string;
  defaultCluster: string;
  onAdded: () => void;
  isAgreed: boolean;
}) {
  const [user] = useAuthState(auth);
  const [lastAge, setLastAge] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Student>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolName: defaultSchool,
      clusterName: defaultCluster,
    },
  });

  const dobValue = watch("dob");
  const computedAge = dobValue ? calculateAgeFromDobString(dobValue) : 0;

  const onSubmit = async (data: Student) => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(null);
    try {
      const studentsCol = collection(db, "students");
      const age = calculateAgeFromDobString(data.dob);
      setLastAge(age);
      const savePromise = addDoc(studentsCol, {
        studentName: data.studentName,
        dob: data.dob,
        age,
        schoolName: data.schoolName,
        skillLevel: data.skillLevel,
        clusterName: data.clusterName,
        createdByUid: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName,
        createdAt: serverTimestamp(),
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout. Check Firestore rules or connectivity.")), 12000));
      await Promise.race([savePromise, timeoutPromise]);
      setSubmitOk(`Saved: ${data.studentName}`);
      onAdded();
      reset({ studentName: "", dob: "", schoolName: defaultSchool, skillLevel: "Average", clusterName: defaultCluster });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save. Check Firestore rules and network.";
      // eslint-disable-next-line no-console
      console.error("Student save error", e);
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[var(--rha-green)]">Student Registration</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Student Name</label>
          <input disabled={!isAgreed} className="mt-1 w-full h-10 px-3 rounded-md border disabled:opacity-50" placeholder="Full name" {...register("studentName")} />
          {errors.studentName && <p className="text-xs text-red-600 mt-1">{errors.studentName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Date of Birth</label>
          <input disabled={!isAgreed} type="date" className="mt-1 w-full h-10 px-3 rounded-md border disabled:opacity-50" {...register("dob")} onChange={(e) => setValue("dob", e.target.value)} />
          {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob.message}</p>}
          <p className="text-xs text-gray-600 mt-1">Age: <span className="font-semibold">{computedAge || lastAge || 0}</span> years</p>
        </div>
        <div>
          <label className="text-sm font-medium">School Name</label>
          <input disabled={!isAgreed} className="mt-1 w-full h-10 px-3 rounded-md border disabled:opacity-50" placeholder="School" {...register("schoolName")} />
          {errors.schoolName && <p className="text-xs text-red-600 mt-1">{errors.schoolName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Skill Level</label>
          <select disabled={!isAgreed} className="mt-1 w-full h-10 px-3 rounded-md border bg-white disabled:opacity-50" {...register("skillLevel")}>
            <option>Average</option>
            <option>Good</option>
            <option>Extraordinary</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Cluster Name</label>
          <input disabled={!isAgreed} className="mt-1 w-full h-10 px-3 rounded-md border disabled:opacity-50" placeholder="Cluster" {...register("clusterName")} />
          {errors.clusterName && <p className="text-xs text-red-600 mt-1">{errors.clusterName.message}</p>}
        </div>
      </div>
      <button disabled={!isAgreed || submitting} type="submit" className="w-full sm:w-auto h-10 px-4 rounded-md bg-[var(--rha-green)] text-white hover:bg-[color:var(--rha-green-hover)] disabled:opacity-60">{submitting ? "Saving..." : "Add Student"}</button>
      {!isAgreed && <p className="text-xs text-gray-600">Please agree to the Rules & Guidelines to enable student registration.</p>}
      {submitOk && <p className="text-xs text-green-700">{submitOk}</p>}
      {submitError && <p className="text-xs text-red-600">{submitError}</p>}
    </form>
  );
}


