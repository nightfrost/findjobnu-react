import React from "react";
import EditableCardFrame from "./EditableCardFrame";
import EducationList from "../EducationList";
import type { Education } from "../../findjobnu-api/models/Education";

interface EducationsCardProps {
  educations: Education[];
  editing: boolean;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onAdd: (education: Education) => void;
  onUpdate: (education: Education) => void;
  onDelete: (educationId: number) => void;
}

const EducationsCard: React.FC<EducationsCardProps> = ({
  educations,
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
      <EducationList
        educations={educations}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        readOnly={false}
      />
    );
  } else if (educations.length === 0) {
    content = <div className="mt-1 text-gray-400">Ikke angivet</div>;
  } else {
    content = (
      <EducationList
        educations={educations}
        onAdd={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        readOnly
      />
    );
  }

  return (
    <EditableCardFrame
      title={<span>Uddannelser</span>}
      editTooltip="Rediger Uddannelser"
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

export default EducationsCard;
