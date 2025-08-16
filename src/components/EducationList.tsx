import React, { useEffect, useRef, useState } from "react";
import type { Education } from "../findjobnu-api/models/Education";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";

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

  const normalizeDate = (val?: string | null): string => {
    if (!val) return "";
    return val.length >= 10 ? val.substring(0, 10) : val;
  };

  const handleEdit = (edu: Education) => {
    if (readOnly) return;
    setEditingId(edu.id!);
    setForm({
      ...edu,
      fromDate: normalizeDate(edu.fromDate ?? undefined),
      toDate: normalizeDate(edu.toDate ?? undefined),
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
    if (editingId) {
      onUpdate({ ...form, id: editingId });
    } else {
      onAdd(form);
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

    if (editingId !== null) {
      pikadayFromRef.current = setupPicker(fromDateInputRef.current, pikadayFromRef.current, (val) => setForm(f => ({ ...f, fromDate: val })));
      pikadayToRef.current = setupPicker(toDateInputRef.current, pikadayToRef.current, (val) => setForm(f => ({ ...f, toDate: val })));

      if (pikadayFromRef.current && form.fromDate) {
        const [y, m, d] = normalizeDate(form.fromDate).split("-").map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) pikadayFromRef.current.setDate(new Date(y, m - 1, d), true);
      }
      if (pikadayToRef.current && form.toDate) {
        const [y, m, d] = normalizeDate(form.toDate).split("-").map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) pikadayToRef.current.setDate(new Date(y, m - 1, d), true);
      }
    }

    return () => {
      if (pikadayFromRef.current) { pikadayFromRef.current.destroy(); pikadayFromRef.current = null; }
      if (pikadayToRef.current) { pikadayToRef.current.destroy(); pikadayToRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  return (
    <div ref={containerRef}>
      <ul className="list-disc ml-6">
        {educations.map((edu) => (
          <li key={edu.id} className="mb-2">
            {editingId === edu.id && !readOnly ? (
              <div className="space-y-2">
                <input className="input input-bordered validator w-full" name="degree" value={form.degree || ""} onChange={handleChange} placeholder="Uddannelse" title="Uddannelse" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
                <p className="validator-hint">Mindst 2 tegn</p>
                <input className="input input-bordered validator w-full" name="institution" value={form.institution || ""} onChange={handleChange} placeholder="Institution" title="Institution" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
                <p className="validator-hint">Mindst 2 tegn</p>
                <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra" required pattern="^\\d{4}-\\d{2}-\\d{2}$" ref={fromDateInputRef} autoComplete="off" />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
                <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD)" title="Til" required pattern="^\\d{4}-\\d{2}-\\d{2}$" ref={toDateInputRef} autoComplete="off" />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
                <textarea className="textarea textarea-bordered validator w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" maxLength={1000} />
                <div className="validator-hint">Maks 1000 tegn</div>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-success" onClick={handleSave}>Gem</button>
                  <button className="btn btn-outline btn-error" onClick={handleCancel}>Annuller</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{edu.degree} - {edu.institution}</span>
                {!readOnly && (
                  <>
                    <button className="btn btn-xs btn-outline btn-warning" onClick={() => handleEdit(edu)}>Rediger</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => onDelete(edu.id!)}>Slet</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && editingId === null && (
        <div className="mt-4">
          <button className="btn btn-primary" onClick={() => setEditingId(0)}>Tilføj uddannelse</button>
        </div>
      )}
    {!readOnly && editingId === 0 && (
        <div className="space-y-2 mt-2">
          <input className="input input-bordered validator w-full" name="degree" value={form.degree || ""} onChange={handleChange} placeholder="Uddannelse" title="Uddannelse" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
      <p className="validator-hint">Mindst 2 tegn</p>
          <input className="input input-bordered validator w-full" name="institution" value={form.institution || ""} onChange={handleChange} placeholder="Institution" title="Institution" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
      <p className="validator-hint">Mindst 2 tegn</p>
          <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra" required pattern="^\\d{4}-\\d{2}-\\d{2}$" ref={fromDateInputRef} autoComplete="off" />
      <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
          <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD)" title="Til" required pattern="^\\d{4}-\\d{2}-\\d{2}$" ref={toDateInputRef} autoComplete="off" />
      <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
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

export default EducationList;
