"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { saveProfile } from "@/actions/profile";
import FileUpload from "./FileUpload";

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Other",
];

interface InitialData {
  firstName: string;
  lastName: string;
  specialty: string;
  documentUrl?: string | null;
}

interface ProfileFormProps {
  initialData: InitialData | null;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [specialty, setSpecialty] = useState(initialData?.specialty ?? "");
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    initialData?.documentUrl ?? undefined
  );
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg(null);

    try {
      await saveProfile({ firstName, lastName, specialty, documentUrl });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="specialty" className="block text-sm font-medium text-slate-700">
          Specialty
        </label>
        <select
          id="specialty"
          required
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="mt-1.5 block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="" disabled>
            Select a specialty
          </option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <FileUpload
        userId={userId}
        documentUrl={documentUrl}
        onUpload={(url) => setDocumentUrl(url)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/10 transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-900/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save profile"}
        </button>

        {status === "success" && (
          <p className="text-sm font-medium text-emerald-700">
            Profile saved successfully.
          </p>
        )}
        {status === "error" && (
          <p className="max-w-md rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200/80">
            {errorMsg}
          </p>
        )}
      </div>
    </form>
  );
}
