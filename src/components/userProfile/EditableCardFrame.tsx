import React from "react";

interface EditableCardFrameProps {
  title: React.ReactNode;
  editTooltip: string;
  editing: boolean;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
  actions?: React.ReactNode;
}

const EditableCardFrame: React.FC<EditableCardFrameProps> = ({
  title,
  editTooltip,
  editing,
  onToggleEdit,
  onCancel,
  onSave,
  children,
  bodyClassName,
  actions,
}) => {
  return (
    <div className="bg-base-100 shadow rounded-lg p-6 mb-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="card-title flex items-center gap-2">{title}</div>
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            className="tooltip tooltip-bottom"
            data-tip={editTooltip}
            onClick={onToggleEdit}
            aria-label={editTooltip}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 hover:text-warning"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={bodyClassName ?? "grid gap-4"}>{children}</div>

      {editing && (
        <div className="mt-4 flex gap-2">
          <button className="btn btn-success" onClick={onSave}>
            Gem
          </button>
          <button className="btn btn-outline btn-error" onClick={onCancel}>
            Annuller
          </button>
          <div className="divider">
          </div>
        </div>
        
      )}
    </div>
  );
};

export default EditableCardFrame;
