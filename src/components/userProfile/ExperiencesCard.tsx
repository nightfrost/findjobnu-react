import React from "react";
import EditableCardFrame from "./EditableCardFrame";
import WorkExperienceList from "../WorkExperienceList";
import type { Experience } from "../../findjobnu-api/models/Experience";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

interface ExperiencesCardProps {
  experiences: Experience[];
  editing: boolean;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onAdd: (experience: Experience) => void;
  onUpdate: (experience: Experience) => void;
  onDelete: (experienceId: number) => void;
}

const ExperiencesCard: React.FC<ExperiencesCardProps> = ({
  experiences,
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
      <WorkExperienceList
        experiences={experiences}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        readOnly={false}
      />
    );
  } else if (experiences.length === 0) {
    content = <div className="mt-1 text-gray-400">Ikke angivet</div>;
  } else {
    content = (
      <WorkExperienceList
        experiences={experiences}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        readOnly
      />
    );
  }

  return (
    <EditableCardFrame
      title={(
        <span className="flex items-center gap-2">
          Erfaringer
          <BriefcaseIcon className="w-5 h-5 text-primary" aria-hidden="true" />
        </span>
      )}
      editTooltip="Rediger Erfaringer"
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

export default ExperiencesCard;
