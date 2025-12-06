import React from "react";
import EditableCardFrame from "./EditableCardFrame";
import SkillList from "../SkillList";
import type { Skill } from "../../findjobnu-api/models/Skill";

interface SkillsCardProps {
  skills: Skill[];
  editing: boolean;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onAdd: (skill: Skill) => void;
  onUpdate: (skill: Skill) => void;
  onDelete: (skillId: number) => void;
}

const SkillsCard: React.FC<SkillsCardProps> = ({
  skills,
  editing,
  onToggleEdit,
  onCancel,
  onSave,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  let content: React.ReactNode;

  if (editing) {
    content = (
      <SkillList
        skills={skills}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        readOnly={false}
      />
    );
  } else if (skills.length === 0) {
    content = <div className="mt-1 text-gray-400">Ikke angivet</div>;
  } else {
    content = (
      <SkillList
        skills={skills}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        readOnly
      />
    );
  }

  return (
    <EditableCardFrame
      title={<span>Færdigheder</span>}
      editTooltip="Rediger Færdigheder"
      editing={editing}
      onToggleEdit={onToggleEdit}
      onCancel={onCancel}
      onSave={onSave}
      bodyClassName="grid gap-4"
    >
      {content}
    </EditableCardFrame>
  );
};

export default SkillsCard;
