import React, { useRef, useState } from "react";
import type { Skill } from "../findjobnu-api/models/Skill";
import { SkillProficiency } from "../findjobnu-api/models/SkillProficiency";

interface Props {
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onUpdate: (skill: Skill) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

const emptySkill: Skill = {
  name: "",
  proficiency: SkillProficiency.NUMBER_0,
};

const SkillList: React.FC<Props> = ({ skills, onAdd, onUpdate, onDelete, readOnly = false }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Skill>(emptySkill);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleEdit = (skill: Skill) => {
    if (readOnly) return;
    setEditingId(skill.id!);
    setForm(skill);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "proficiency" ? Number(value) : value,
    });
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
    setForm(emptySkill);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptySkill);
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <ul className="list-disc ml-6">
        {skills.map((skill) => (
          <li key={skill.id} className="mb-2 flex items-center gap-2">
            <span>{skill.name} ({["Begynder","Let øvet","Øvet","Ekspert"][skill.proficiency]})</span>
            {!readOnly && (
              <>
                <button className="btn btn-xs btn-outline btn-warning" onClick={() => handleEdit(skill)}>Rediger</button>
                <button className="btn btn-xs btn-outline btn-error" onClick={() => onDelete(skill.id!)}>Slet</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && editingId === null && (
        <button className="btn btn-primary" onClick={() => { setEditingId(0); setForm(emptySkill); }}>
          Tilføj færdighed
        </button>
      )}

      {!readOnly && editingId !== null && (
        <div className="space-y-2">
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="skill-name-new">
              <span className="label-text">Færdighed</span>
            </label>
            <input id="skill-name-new" className="input input-bordered validator w-full" name="name" value={form.name || ""} onChange={handleChange} placeholder="Færdighed" title="Færdighed" required minLength={2} pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$" />
          </div>
          <p className="validator-hint">Mindst 2 tegn</p>
          <select className="select select-bordered validator w-full" name="proficiency" value={form.proficiency} onChange={handleChange} title="Kompetenceniveau">
            <option value={SkillProficiency.NUMBER_0}>Begynder</option>
            <option value={SkillProficiency.NUMBER_1}>Let øvet</option>
            <option value={SkillProficiency.NUMBER_2}>Øvet</option>
            <option value={SkillProficiency.NUMBER_3}>Ekspert</option>
          </select>
          <div className="validator-hint">Vælg kompetenceniveau</div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-sm btn-success" onClick={handleSave}>Gem</button>
            <button className="btn btn-sm btn-outline btn-error" onClick={handleCancel}>Annuller</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillList;
