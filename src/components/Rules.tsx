"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";

export default function Rules({ agreed, onChange }: { agreed: boolean; onChange: (val: boolean) => void }) {
  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[var(--rha-green)]">Rules & Guidelines for RHA – IKF Trials</h2>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
        <li>All students must maintain discipline, show respect to coaches, officials, and fellow participants, and follow all trial instructions.</li>
        <li>Indisciplinary actions, including disrespectful behavior or non-compliance with instructions, will not be tolerated. Any such incident may result in immediate disqualification.</li>
        <li>Robins are personally responsible for arranging safe and timely commute for students to and from the trial venue.</li>
        <li>Robins must ensure constant supervision and safety of students during travel and throughout the trial.</li>
        <li>Only eligible students—born between 2008 and 2015 and with basic football playing skills—should be registered.</li>
      </ol>
      <div className="flex items-center gap-2 pt-2">
        <Checkbox.Root
          checked={agreed}
          onCheckedChange={(v) => onChange(Boolean(v))}
          className="w-5 h-5 rounded border data-[state=checked]:bg-[var(--rha-green)] data-[state=checked]:text-white flex items-center justify-center"
        >
          <Checkbox.Indicator>
            <span className="text-white text-sm">✓</span>
          </Checkbox.Indicator>
        </Checkbox.Root>
        <Label.Root className="text-sm">I have read and agree</Label.Root>
      </div>

      <div className="pt-2 text-sm">
        <p className="font-medium text-[var(--rha-green)]">Contact Persons</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-gray-800">
          <p>📞 Sanskriti Yadav (IKF): <span className="font-medium">8287076345</span></p>
          <p>📞 Abhishek Nair (RHA): <span className="font-medium">7349723145</span></p>
          <p>📞 Preeta (RHA): <span className="font-medium">7774035457</span></p>
          <p>📞 Ram (RHA): <span className="font-medium">7338798666</span></p>
        </div>
      </div>
    </section>
  );
}



