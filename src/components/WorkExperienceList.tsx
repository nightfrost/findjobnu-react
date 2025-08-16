import React, { useEffect, useRef, useState } from "react";
import LocationTypeahead from "./LocationTypeahead";
import type { Experience } from "../findjobnu-api/models/Experience";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";

interface Props {
  experiences: Experience[];
  onAdd: (exp: Experience) => void;
  onUpdate: (exp: Experience) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

const emptyExperience: Experience = {
  positionTitle: "",
  company: "",
  fromDate: "",
  toDate: "",
  location: "",
  description: "",
};

const WorkExperienceList: React.FC<Props> = ({ experiences, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Experience>(emptyExperience);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fromDateInputRef = useRef<HTMLInputElement | null>(null);
  const toDateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayFromRef = useRef<Pikaday | null>(null);
  const pikadayToRef = useRef<Pikaday | null>(null);
  const [isCurrent, setIsCurrent] = useState<boolean>(false);

  const normalizeDate = (val?: string | null): string => {
    if (!val) return "";
    // Accept ISO date or datetime; return YYYY-MM-DD
    // e.g. 2020-01-01T00:00:00 -> 2020-01-01
    if (val.length >= 10) return val.substring(0, 10);
    return val;
  };

  const handleEdit = (exp: Experience) => {
    if (readOnly) return;
    setEditingId(exp.id!);
    setForm({
      ...exp,
      fromDate: normalizeDate(exp.fromDate ?? undefined),
      toDate: normalizeDate(exp.toDate ?? undefined),
    });
    setIsCurrent(!exp.toDate || normalizeDate(exp.toDate || "") === "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (containerRef.current) {
      const fields = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input.validator, textarea.validator, select.validator"
      );
      for (const field of Array.from(fields)) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return;
        }
      }
    }
    const prepared = { ...form, toDate: isCurrent ? "" : form.toDate } as Experience;
    if (editingId) {
      onUpdate({ ...prepared, id: editingId });
    } else {
      onAdd(prepared);
    }
    setEditingId(null);
    setForm(emptyExperience);
    setIsCurrent(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyExperience);
  };

  // Setup Pikaday when editing a row or adding a new one
  useEffect(() => {
    if (readOnly) return;
    const setupPicker = (
      inputEl: HTMLInputElement | null,
      existing: Pikaday | null,
      onSelect: (dateStr: string) => void
    ): Pikaday | null => {
      if (!inputEl) return null;
      if (existing) return existing; // already created
      const picker = new Pikaday({
        field: inputEl,
        format: "YYYY-MM-DD",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()],
        onSelect: (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          onSelect(`${y}-${m}-${dd}`);
        },
      });
      return picker;
    };

    // Only active when editing something (id not null)
  if (editingId !== null) {
      pikadayFromRef.current = setupPicker(fromDateInputRef.current, pikadayFromRef.current, (val) => setForm(f => ({ ...f, fromDate: val })));
      pikadayToRef.current = setupPicker(toDateInputRef.current, pikadayToRef.current, (val) => setForm(f => ({ ...f, toDate: val })));

      // Initialize pickers with current form values
  if (pikadayFromRef.current && form.fromDate) {
        const [y, m, d] = normalizeDate(form.fromDate).split("-").map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) pikadayFromRef.current.setDate(new Date(y, m - 1, d), true);
      }
  if (pikadayToRef.current && form.toDate && !isCurrent) {
        const [y, m, d] = normalizeDate(form.toDate).split("-").map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) pikadayToRef.current.setDate(new Date(y, m - 1, d), true);
      }
    }

    return () => {
      if (pikadayFromRef.current) { pikadayFromRef.current.destroy(); pikadayFromRef.current = null; }
      if (pikadayToRef.current) { pikadayToRef.current.destroy(); pikadayToRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, isCurrent]);

  return (
    <div ref={containerRef}>
      <ul className="list-disc ml-6">
        {experiences.map((exp) => (
          <li key={exp.id} className="mb-2">
            {editingId === exp.id && !readOnly ? (
              <div className="space-y-2">
                <input className="input input-bordered validator w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
                <p className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</p>
                <input className="input input-bordered validator w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
                <p className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</p>
                <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra dato" required pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2}$" ref={fromDateInputRef} autoComplete="off" />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
                <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD eller tomt for nuværende)" title="Til dato" pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2}$" ref={toDateInputRef} autoComplete="off" disabled={isCurrent} />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD. Lad feltet være tomt, hvis det er din nuværende stilling.</div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={isCurrent}
                      onChange={(e) => { setIsCurrent(e.target.checked); if (e.target.checked) setForm(f => ({ ...f, toDate: "" })); }}
                    />
                    <span className="label-text">Nuværende stilling</span>
                  </label>
                </div>
                <LocationTypeahead
                  value={form.location || ""}
                  onChange={val => setForm({ ...form, location: val })}
                  inputProps={{
                    name: "location",
                    required: true,
                    pattern: "^[A-Za-zÆØÅæøå' .-]{2,}$",
                    title: "Lokation",
                    className: "validator w-full"
                  }}
                />
                <div className="validator-hint">Mindst 2 tegn (bogstaver, mellemrum, punktum, bindestreg og apostrof)</div>
                <textarea className="textarea textarea-bordered validator w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" maxLength={1000} />
                <div className="validator-hint">Maks 1000 tegn</div>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-success" onClick={handleSave}>Gem</button>
                  <button className="btn btn-outline btn-error" onClick={handleCancel}>Annuller</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{exp.positionTitle} - {exp.company}</span>
                {!readOnly && (
                  <>
                    <button className="btn btn-xs btn-outline btn-warning" onClick={() => handleEdit(exp)}>Rediger</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => onDelete(exp.id!)}>Slet</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && editingId === null && (
        <div className="mt-4">
          <button className="btn btn-primary" onClick={() => setEditingId(0)}>Tilføj erfaring</button>
        </div>
      )}
    {!readOnly && editingId === 0 && (
        <div className="space-y-2 mt-2">
          <input className="input input-bordered validator w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
      <p className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</p>
          <input className="input input-bordered validator w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
      <p className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</p>
          <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra dato" required pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2}$" ref={fromDateInputRef} autoComplete="off" />
      <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
          <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD eller tomt for nuværende)" title="Til dato" pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2}$" ref={toDateInputRef} autoComplete="off" disabled={isCurrent} />
    <div className="validator-hint">Format: ÅÅÅÅ-MM-DD. Lad feltet være tomt, hvis det er din nuværende stilling.</div>
          <div className="form-control mb-1">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isCurrent}
                onChange={(e) => { setIsCurrent(e.target.checked); if (e.target.checked) setForm(f => ({ ...f, toDate: "" })); }}
              />
              <span className="label-text">Nuværende stilling</span>
            </label>
          </div>
          <input className="input input-bordered validator w-full" name="location" value={form.location || ""} onChange={handleChange} placeholder="Lokation" title="Lokation" required pattern="^[A-Za-zÆØÅæøå' .-]{2,}$" />
      <div className="validator-hint">Mindst 2 tegn (bogstaver, mellemrum, punktum, bindestreg og apostrof)</div>
      <textarea className="textarea textarea-bordered validator w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" maxLength={1000} />
      <div className="validator-hint">Maks 1000 tegn</div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-sm btn-success" onClick={handleSave}>Gem</button>
            <button className="btn btn-sm btn-outline btn-error" onClick={handleCancel}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkExperienceList;
