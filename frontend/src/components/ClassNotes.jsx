import { useEffect, useRef, useState } from "react";
import api, { downloadFile, errorMessage } from "../api/client";
import { validatePdf, validateText } from "../utils/validation";
import { formatFileSize } from "../utils/format";
import { EmptyState } from "./AppLayout";
import { DownloadIcon, FileIcon, PlusIcon } from "./Icons";

// Teacher ta class ekata PDF notes upload karanna, download karanna saha delete karanna
export default function ClassNotes({ classId }) {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [busyId, setBusyId] = useState(null);   // download ho delete wena note eka
  const fileInput = useRef(null);

  useEffect(() => {
    api.get(`/api/classes/${classId}/notes`)
      .then((res) => setNotes(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [classId]);

  async function handleUpload(e) {
    e.preventDefault();
    const invalid = validateText(title, "Title", { max: 100 }) || validatePdf(file);
    setUploadError(invalid);
    if (invalid) return;

    const form = new FormData();
    form.append("title", title.trim());
    form.append("file", file);

    setUploading(true);
    try {
      const { data } = await api.post(`/api/classes/${classId}/notes`, form);
      setNotes((prev) => [data, ...prev]);
      setTitle("");
      setFile(null);
      fileInput.current.value = "";
    } catch (err) {
      setUploadError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(n) {
    setError("");
    setBusyId(n.noteId);
    try {
      await downloadFile(`/api/classes/${classId}/notes/${n.noteId}/file`, n.fileName);
    } catch {
      setError(`Could not download "${n.title}". Please try again.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(n) {
    if (!window.confirm(`Delete "${n.title}"? Students will no longer be able to download it.`)) return;
    setError("");
    setBusyId(n.noteId);
    try {
      await api.delete(`/api/classes/${classId}/notes/${n.noteId}`);
      setNotes((prev) => prev.filter((x) => x.noteId !== n.noteId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <FileIcon className="h-5 w-5 text-slate-400" />
          Class notes
          <span className="badge badge-violet">{notes.length}</span>
        </h2>
      </div>

      <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4">
        <form onSubmit={handleUpload} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="label">Title</span>
            <input type="text" maxLength={100} placeholder="e.g. Lesson 3 - Organic Chemistry" value={title}
              onChange={(e) => { setTitle(e.target.value); setUploadError(""); }} className="input" />
          </label>
          <label className="block flex-1">
            <span className="label">PDF file (max 10 MB)</span>
            <input ref={fileInput} type="file" accept="application/pdf,.pdf"
              onChange={(e) => { setFile(e.target.files[0] ?? null); setUploadError(""); }}
              className="input file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-violet-700" />
          </label>
          <button type="submit" disabled={uploading} className="btn btn-primary">
            <PlusIcon />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
        {uploadError && <p className="alert-error mt-3">{uploadError}</p>}
      </div>

      {error && <p className="alert-error mx-6 mt-4">{error}</p>}

      {notes.length === 0 ? (
        <EmptyState icon={<FileIcon className="h-6 w-6" />} title="No notes uploaded yet"
          hint="Upload a PDF above and every student in this class can download it." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {notes.map((n) => (
            <li key={n.noteId} className="flex items-center justify-between gap-4 px-6 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{n.title}</p>
                  <p className="truncate text-sm text-slate-500">
                    {n.fileName} · {formatFileSize(n.fileSize)} · uploaded {n.uploadedAt.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => handleDownload(n)} disabled={busyId === n.noteId}
                  className="btn btn-secondary btn-sm">
                  <DownloadIcon />
                  Download
                </button>
                <button onClick={() => handleDelete(n)} disabled={busyId === n.noteId}
                  className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
