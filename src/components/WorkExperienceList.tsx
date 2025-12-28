import React, { useEffect, useRef, useState } from "react";
import type { Experience } from "../findjobnu-api/models/Experience";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { DANISH_DATE_PATTERN, formatDateForDisplay, isValidDanishDateString, toApiDateString, toDateFromInput } from "../helpers/date";

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

  const handleEdit = (exp: Experience) => {
    if (readOnly) return;
    setEditingId(exp.id!);
    setForm({
      ...exp,
      fromDate: formatDateForDisplay(exp.fromDate ?? undefined),
      toDate: formatDateForDisplay(exp.toDate ?? undefined),
    });
    setIsCurrent(!exp.toDate || formatDateForDisplay(exp.toDate ?? undefined) === "");
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

    const isValidDateInput = (value?: string | null) => typeof value === "string" && isValidDanishDateString(value);
    const dateInputsValid = isCurrent
      ? isValidDateInput(form.fromDate)
      : isValidDateInput(form.fromDate) && isValidDateInput(form.toDate);

    if (!dateInputsValid) {
      [fromDateInputRef.current, toDateInputRef.current].forEach(input => {
        if (!input) return;
        input.setCustomValidity("Ugyldig dato. Brug formatet dd/mm/yyyy.");
        input.reportValidity();
        input.setCustomValidity("");
      });
      return;
    }

    const prepared: Experience = {
      ...form,
      fromDate: toApiDateString(form.fromDate) ?? form.fromDate,
      toDate: isCurrent ? null : toApiDateString(form.toDate) ?? form.toDate,
    };

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
    setIsCurrent(false);
  };

  useEffect(() => {
    if (readOnly) return;
    const setupPicker = (
      inputEl: HTMLInputElement | null,
      existing: Pikaday | null,
      onSelect: (dateStr: string) => void
    ): Pikaday | null => {
      if (!inputEl) return null;
      if (existing) return existing;
      const picker = new Pikaday({
        field: inputEl,
        format: "DD/MM/YYYY",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()],
        onSelect: (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          onSelect(`${dd}/${m}/${y}`);
        },
      });
      return picker;
    };

    if (editingId !== null) {
      pikadayFromRef.current = setupPicker(fromDateInputRef.current, pikadayFromRef.current, (val) => setForm(f => ({ ...f, fromDate: val })));
      pikadayToRef.current = setupPicker(toDateInputRef.current, pikadayToRef.current, (val) => setForm(f => ({ ...f, toDate: val })));

      if (pikadayFromRef.current && form.fromDate) {
        const parsed = toDateFromInput(form.fromDate);
        if (parsed) pikadayFromRef.current.setDate(parsed, true);
      }
      if (!isCurrent && pikadayToRef.current && form.toDate) {
        const parsed = toDateFromInput(form.toDate);
        if (parsed) pikadayToRef.current.setDate(parsed, true);
      }
    }

    return () => {
      if (pikadayFromRef.current) { pikadayFromRef.current.destroy(); pikadayFromRef.current = null; }
      if (pikadayToRef.current) { pikadayToRef.current.destroy(); pikadayToRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  return (
    <div ref={containerRef} className="space-y-4">
      <ul className="list-disc ml-6">
        {experiences.map((exp) => (
          <li key={exp.id} className="mb-2 flex items-center gap-2">
            <span>{exp.positionTitle} - {exp.company}</span>
            {!readOnly && (
              <>
                <button className="btn btn-xs btn-outline btn-warning" onClick={() => handleEdit(exp)}>Rediger</button>
                <button className="btn btn-xs btn-outline btn-error" onClick={() => onDelete(exp.id!)}>Slet</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && editingId === null && (
        <button className="btn btn-primary" onClick={() => { setEditingId(0); setForm(emptyExperience); setIsCurrent(false); }}>
          Tilføj erfaring
        </button>
      )}

      {!readOnly && editingId !== null && (
        <div className="space-y-2">
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="positionTitle-new">
              <span className="label-text">Titel</span>
            </label>
            <input id="positionTitle-new" className="input input-bordered validator w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
          </div>
          <p className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</p>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="company-new">
              <span className="label-text">Virksomhed</span>
            </label>
            <input id="company-new" className="input input-bordered validator w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" required minLength={2} pattern="^[A-Za-zÆØÅæøå0-9' .,-]{2,}$" />
          </div>
          <p className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</p>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="fromDate-new">
              <span className="label-text">Fra (dd/mm/yyyy)</span>
            </label>
            <input id="fromDate-new" className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Fra dato" required pattern={DANISH_DATE_PATTERN.source} ref={fromDateInputRef} autoComplete="off" />
          </div>
          <div className="validator-hint">Format: dd/mm/yyyy</div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="toDate-new">
              <span className="label-text">Til (dd/mm/yyyy eller tomt for nuværende)</span>
            </label>
            <input id="toDate-new" className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Til dato" pattern={DANISH_DATE_PATTERN.source} ref={toDateInputRef} autoComplete="off" disabled={isCurrent} />
          </div>
          <div className="validator-hint">Format: dd/mm/yyyy. Lad feltet være tomt, hvis det er din nuværende stilling.</div>
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
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="location-new">
              <span className="label-text">Lokation</span>
            </label>
            <input id="location-new" className="input input-bordered validator w-full" name="location" value={form.location || ""} onChange={handleChange} placeholder="Lokation" title="Lokation" required pattern="^[A-Za-zÆØÅæøå' .-]{2,}$" />
          </div>
          <div className="validator-hint">Mindst 2 tegn (bogstaver, mellemrum, punktum, bindestreg og apostrof)</div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="description-new">
              <span className="label-text">Beskrivelse</span>
            </label>
            <textarea id="description-new" className="textarea textarea-bordered validator w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" maxLength={1000} />
          </div>
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
