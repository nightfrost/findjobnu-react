import React, { useMemo, useState } from "react";
import { CVApi } from "../findjobnu-api";
import type { CvImportResult } from "../findjobnu-api/models/CvImportResult";
import { createApiClient } from "../helpers/ApiFactory";
import { handleApiError } from "../helpers/ErrorHelper";

interface Props {
  accessToken: string;
  onImported?: () => void;
}

const MAX_FILE_SIZE_MB = 10;

const ImportCvCard: React.FC<Props> = ({ accessToken, onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CvImportResult | null>(null);

  const fileName = useMemo(() => file?.name ?? "Ingen fil valgt", [file]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
  };

  const validateFile = (f: File | null): string | null => {
    if (!f) return "Vælg en PDF";
    if (f.type !== "application/pdf") return "Kun PDF-filer understøttes";
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) return "Filen er for stor (maks 10 MB)";
    return null;
  };

  const onImport = async () => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const api = createApiClient<CVApi>(CVApi, accessToken ?? undefined);
      const res = await api.importCvIntoProfile({ file });
      setResult(res);
      onImported?.();
    } catch (err) {
      const info = await handleApiError(err);
      setError(info.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow rounded-lg p-6 w-full h-fit mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="card-title">Importer CV</h2>
          <p className="text-sm text-gray-500">Upload en PDF for at udfylde din profil automatisk.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="form-control">
          <label className="label flex-col items-start gap-1">
            <span className="label-text">PDF-fil</span>
            <input
              type="file"
              accept="application/pdf"
              className="file-input file-input-bordered w-full"
              onChange={onFileChange}
              aria-label="Upload CV som PDF"
              disabled={uploading}
            />
            <span className="text-xs text-base-content/60">{fileName}</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onImport}
            disabled={uploading || !file}
          >
            {uploading ? "Importer..." : "Importer og udfyld"}
          </button>
          <span className="text-xs text-base-content/60">
            Vi bruger kun filen til analyse og sletter den bagefter.
          </span>
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="alert alert-success text-sm flex flex-col gap-2">
            <span>{result.createdProfile ? "Profil oprettet" : "Profil opdateret"}</span>
            {result.summary?.note && <span>{result.summary.note}</span>}
            {result.warnings && result.warnings.length > 0 && (
              <ul className="list-disc list-inside text-xs">
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCvCard;
