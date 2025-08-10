import React, { useState } from "react";
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

  const handleEdit = (exp: Experience) => {
    if (readOnly) return;
    setEditingId(exp.id!);
    setForm(exp);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
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
    <div>
      <ul className="list-disc ml-6">
        {experiences.map((exp) => (
          <li key={exp.id} className="mb-2">
            {editingId === exp.id && !readOnly ? (
              <div className="space-y-2">
                <input className="input input-bordered w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" />
                <input className="input input-bordered w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" />
                <input className="input input-bordered w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra" title="Fra" />
                <input className="input input-bordered w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til" title="Til" />
                <input className="input input-bordered w-full" name="location" value={form.location || ""} onChange={handleChange} placeholder="Lokation" title="Lokation" />
                <textarea className="textarea textarea-bordered w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" />
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
          <input className="input input-bordered w-full" name="positionTitle" value={form.positionTitle || ""} onChange={handleChange} placeholder="Titel" title="Titel" />
          <input className="input input-bordered w-full" name="company" value={form.company || ""} onChange={handleChange} placeholder="Virksomhed" title="Virksomhed" />
          <input className="input input-bordered w-full" name="fromDate" value={form.fromDate || ""} onChange={handleChange} placeholder="Fra" title="Fra" />
          <input className="input input-bordered w-full" name="toDate" value={form.toDate || ""} onChange={handleChange} placeholder="Til" title="Til" />
          <input className="input input-bordered w-full" name="location" value={form.location || ""} onChange={handleChange} placeholder="Lokation" title="Lokation" />
          <textarea className="textarea textarea-bordered w-full" name="description" value={form.description || ""} onChange={handleChange} placeholder="Beskrivelse" title="Beskrivelse" />
          <div className="flex gap-2 mt-2">
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button className="btn btn-outline btn-error" onClick={handleCancel}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkExperienceList;
