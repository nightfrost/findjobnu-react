import React, { useRef, useState } from "react";
import type { Education } from "../findjobnu-api/models/Education";

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

  const handleEdit = (edu: Education) => {
    if (readOnly) return;
    setEditingId(edu.id!);
    setForm(edu);
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
                <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
                <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD)" title="Til" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
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
          <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
      <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
          <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD)" title="Til" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
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
