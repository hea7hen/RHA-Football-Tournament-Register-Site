"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, setDoc } from "firebase/firestore";

const phoneSchema = z
  .string()
  .min(7, "Enter a valid phone number")
  .max(25, "Enter a valid phone number")
  .refine((val) => {
    const digits = (val || "").replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Enter a valid phone number");

const schema = z.object({
  robinName: z.string().min(2, "Required"),
  robinContact: phoneSchema,
  schoolName: z.string().min(2, "Required"),
  clusterName: z.string().min(2, "Required"),
});

export type RobinInfo = z.infer<typeof schema>;

export default function RobinForm({ onSaved, initial }: { onSaved: (data: RobinInfo) => void; initial?: Partial<RobinInfo> }) {
  const [user] = useAuthState(auth);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RobinInfo>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (initial?.robinName) setValue("robinName", initial.robinName);
    else if (user?.displayName) setValue("robinName", user.displayName);
    if (initial?.robinContact) setValue("robinContact", initial.robinContact);
    if (initial?.schoolName) setValue("schoolName", initial.schoolName);
    if (initial?.clusterName) setValue("clusterName", initial.clusterName);
  }, [user?.displayName, setValue, initial?.robinName, initial?.robinContact, initial?.schoolName, initial?.clusterName]);

  const onSubmit = async (data: RobinInfo) => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const usersCol = collection(db, "users");
      const userDoc = doc(usersCol, user.uid);
      await setDoc(
        userDoc,
        {
          uid: user.uid,
          email: user.email,
          displayName: data.robinName,
          photoURL: user.photoURL,
          clusterName: data.clusterName,
          schoolName: data.schoolName,
          contact: data.robinContact,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      onSaved(data);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[var(--rha-green)]">{initial ? "Update Robin Information" : "Robin Information"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Robin Name</label>
          <input className="mt-1 w-full h-10 px-3 rounded-md border" placeholder="Your full name" {...register("robinName")} />
          {errors.robinName && <p className="text-xs text-red-600 mt-1">{errors.robinName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Robin Contact Number</label>
          <input className="mt-1 w-full h-10 px-3 rounded-md border" placeholder="Phone (e.g., +91 98765 43210)" inputMode="tel" {...register("robinContact")} />
          {errors.robinContact && <p className="text-xs text-red-600 mt-1">{errors.robinContact.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">School Name</label>
          <input className="mt-1 w-full h-10 px-3 rounded-md border" placeholder="School" {...register("schoolName")} />
          {errors.schoolName && <p className="text-xs text-red-600 mt-1">{errors.schoolName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Cluster Name</label>
          <input className="mt-1 w-full h-10 px-3 rounded-md border" placeholder="Cluster" {...register("clusterName")} />
          {errors.clusterName && <p className="text-xs text-red-600 mt-1">{errors.clusterName.message}</p>}
        </div>
      </div>
      <button disabled={submitting} type="submit" className="w-full sm:w-auto h-10 px-4 rounded-md bg-[var(--rha-green)] text-white hover:bg-[color:var(--rha-green-hover)] disabled:opacity-60">
        {submitting ? "Saving..." : initial ? "Save Changes" : "Save & Continue"}
      </button>
      {submitError && <p className="text-xs text-red-600">{submitError}</p>}
    </form>
  );
}


