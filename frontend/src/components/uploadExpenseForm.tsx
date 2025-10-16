// frontend/src/components/UploadExpenseForm.tsx
import React, { useRef, useState } from "react";

type Props = {
  expenseId: number;
  onUploaded?: (fileKey: string) => void;
};

export default function UploadExpenseForm({ expenseId, onUploaded }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          filename: file.name,
          type: file.type || "application/octet-stream",
        }),
      });
      if (!signRes.ok) throw new Error("Failed to sign upload URL");
      const { uploadUrl, key } = await signRes.json();
      if (!uploadUrl || !key) throw new Error("Invalid signing response");

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
        credentials: "include",
      });
      if (!uploadRes.ok) throw new Error("File upload failed");

      const updateRes = await fetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileKey: key }),
      });
      if (!updateRes.ok) throw new Error("Failed to update expense");

      setSuccess("File uploaded and expense updated successfully!");
      inputRef.current!.value = "";
      onUploaded?.(key);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
      <input ref={inputRef} type="file" disabled={loading} />
      <button type="submit" disabled={loading}>
        {loading ? "Uploading…" : "Upload receipt"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </form>
  );
}
