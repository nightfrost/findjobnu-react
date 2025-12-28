import React, { useEffect, useRef, useState } from "react";
import type { Education } from "../findjobnu-api/models/Education";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { DANISH_DATE_PATTERN, formatDateForDisplay, isValidDanishDateString, toApiDateString, toDateFromInput } from "../helpers/date";

interface Props {
  educations: Education[];
  onAdd: (edu: Education) => void;
  onUpdate: (edu: Education) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

const emptyEducation: Education = {
  degree: "",
  institution: "",
  fromDate: "",
  toDate: "",
  description: "",
};

const EducationList: React.FC<Props> = ({ educations, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Education>(emptyEducation);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fromDateInputRef = useRef<HTMLInputElement | null>(null);
  const toDateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayFromRef = useRef<Pikaday | null>(null);
  const pikadayToRef = useRef<Pikaday | null>(null);

  const handleEdit = (edu: Education) => {
    if (readOnly) return;
    setEditingId(edu.id!);
    setForm({
      ...edu,
      fromDate: formatDateForDisplay(edu.fromDate ?? undefined),
      toDate: formatDateForDisplay(edu.toDate ?? undefined),
    });
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
    const datesValid = isValidDateInput(form.fromDate) && isValidDateInput(form.toDate);

    if (!datesValid) {
      [fromDateInputRef.current, toDateInputRef.current].forEach(input => {
        if (!input) return;
        input.setCustomValidity("Ugyldig dato. Brug formatet dd/mm/yyyy.");
        input.reportValidity();
        input.setCustomValidity("");
      });
      return;
    }

    const withApiDates: Education = {
      ...form,
      fromDate: toApiDateString(form.fromDate) ?? form.fromDate,
      toDate: toApiDateString(form.toDate) ?? form.toDate,
    };

    if (editingId) {
      onUpdate({ ...withApiDates, id: editingId });
    } else {
      onAdd(withApiDates);
    }
    setEditingId(null);
    setForm(emptyEducation);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyEducation);
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
      if (pikadayToRef.current && form.toDate) {
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
        {educations.map((edu) => (
          <li key={edu.id} className="mb-2 flex items-center gap-2">
            <span>{edu.degree} - {edu.institution}</span>
            {!readOnly && (
              <>
                <button className="btn btn-xs btn-outline btn-warning" onClick={() => handleEdit(edu)}>Rediger</button>
                <button className="btn btn-xs btn-outline btn-error" onClick={() => onDelete(edu.id!)}>Slet</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && editingId === null && (
        <button className="btn btn-primary" onClick={() => { setEditingId(0); setForm(emptyEducation); }}>
          Tilføj uddannelse
        </button>
      )}

      {!readOnly && editingId !== null && (
        <div className="space-y-2">
          <div className="form-control gap-2">
            <label className="label p-0">
              <span className="label-text">Uddannelse</span>
            </label>
            <input className="input input-bordered validator w-full" name="degree" value={form.degree || ""} onChange={handleChange} placeholder="Uddannelse" title="Uddannelse" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
          </div>
          <p className="validator-hint">Mindst 2 tegn</p>
          <div className="form-control gap-2">
            <label className="label p-0">
              <span className="label-text">Institution</span>
            </label>
            <input className="input input-bordered validator w-full" name="institution" value={form.institution || ""} onChange={handleChange} placeholder="Institution" title="Institution" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
          </div>
          <p className="validator-hint">Mindst 2 tegn</p>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="fromDate-new">
              <span className="label-text">Fra (dd/mm/yyyy)</span>
            </label>
            <input id="fromDate-new" className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Fra" required pattern={DANISH_DATE_PATTERN.source} ref={fromDateInputRef} autoComplete="off" />
          </div>
          <div className="validator-hint">Format: dd/mm/yyyy</div>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="toDate-new">
              <span className="label-text">Til (dd/mm/yyyy)</span>
            </label>
            <input id="toDate-new" className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="dd/mm/yyyy" title="Til" required pattern={DANISH_DATE_PATTERN.source} ref={toDateInputRef} autoComplete="off" />
          </div>
          <div className="validator-hint">Format: dd/mm/yyyy</div>
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

export default EducationList;
