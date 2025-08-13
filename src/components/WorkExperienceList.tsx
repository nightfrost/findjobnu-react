import React, { useRef, useState } from "react";
import LocationTypeahead from "./LocationTypeahead";
import type { Experience } from "../findjobnu-api/models/Experience";

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

  const handleEdit = (exp: Experience) => {
    if (readOnly) return;
    setEditingId(exp.id!);
    setForm(exp);
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
    setForm(emptyExperience);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyExperience);
  };

  return (
    <div ref={containerRef}>
      <ul className="list-disc ml-6">
        {experiences.map((exp) => (
          <li key={exp.id} className="mb-2">
            {editingId === exp.id && !readOnly ? (
              <div className="space-y-2">
                <input className="input input-bordered validator w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
                <p className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</p>
                <input className="input input-bordered validator w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
                <p className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</p>
                <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra dato" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
                <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD)" title="Til dato" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
                <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
                <LocationTypeahead
                  value={form.location || ""}
                  onChange={val => setForm({ ...form, location: val })}
                  inputProps={{
                    name: "location",
                    required: true,
                    pattern: "^[A-Za-zÀ-ÿ' .-]{2,}$",
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
          <input className="input input-bordered validator w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
      <p className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</p>
          <input className="input input-bordered validator w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
      <p className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</p>
          <input className="input input-bordered validator w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra (YYYY-MM-DD)" title="Fra dato" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
      <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
          <input className="input input-bordered validator w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til (YYYY-MM-DD)" title="Til dato" required pattern="^\\d{4}-\\d{2}-\\d{2}$" />
      <div className="validator-hint">Format: ÅÅÅÅ-MM-DD</div>
          <input className="input input-bordered validator w-full" name="location" value={form.location || ""} onChange={handleChange} placeholder="Lokation" title="Lokation" required pattern="^[A-Za-zÀ-ÿ' .-]{2,}$" />
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
