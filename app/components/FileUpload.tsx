"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const BUCKET = "doctor-documents";

interface FileUploadProps {
  userId: string;
  documentUrl: string | null | undefined;
  onUpload: (publicUrl: string) => void;
}

export default function FileUpload({
  userId,
  documentUrl,
  onUpload,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      setError("Not signed in.");
      return;
    }

    setError(null);

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less.");
      return;
    }

    setUploading(true);
    setFileName(file.name);

    const safeName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^\w.\-()+]/g, "");
    const objectPath = `${userId}/${Date.now()}-${safeName || "document.pdf"}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      onUpload(data.publicUrl);
    } catch (err) {
      setFileName(null);
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300/80">
      <label className="block text-sm font-medium text-slate-700">
        Document (PDF, max 10 MB)
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !userId}
          className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Choose file"}
        </button>

        <span className="text-sm text-slate-500">
          {fileName ?? (documentUrl ? "File already uploaded" : "No file chosen")}
        </span>
      </div>

      {documentUrl && (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-indigo-600 underline-offset-4 transition hover:text-indigo-500 hover:underline"
        >
          View document
        </a>
      )}

      {error && (
        <p className="text-sm font-medium text-red-700">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
