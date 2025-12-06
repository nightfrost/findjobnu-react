import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import EditableCardFrame from "./EditableCardFrame";
import type { Profile } from "../../findjobnu-api/models/Profile";
import type { ProfileDto } from "../../findjobnu-api/models/ProfileDto";

interface AboutKeywordsCardProps {
  profile: ProfileDto;
  form: Profile | null;
  editing: boolean;
  keywordsInput: string;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onBasicInfoChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeywordsChange: (value: string) => void;
}

const AboutKeywordsCard: React.FC<AboutKeywordsCardProps> = ({
  profile,
  form,
  editing,
  keywordsInput,
  onToggleEdit,
  onCancel,
  onSave,
  onBasicInfoChange,
  onKeywordsChange,
}) => {
  const aboutValue = profile.basicInfo?.about?.trim()
    ? profile.basicInfo.about
    : "";

  return (
    <EditableCardFrame
      title={<span>Om mig &amp; Nøgleord</span>}
      editTooltip="Rediger Om mig & Nøgleord"
      editing={editing}
      onToggleEdit={onToggleEdit}
      onCancel={onCancel}
      onSave={onSave}
    >
      <div>
        <label className="label" htmlFor="about">
          Om mig
        </label>
        {editing ? (
          <>
            <textarea
              className="textarea textarea-bordered validator w-full"
              id="about"
              name="about"
              value={form?.basicInfo?.about ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Kort beskrivelse"
              rows={4}
              maxLength={1000}
              title="Maks 1000 tegn."
            />
            <div className="validator-hint">Maks 1000 tegn</div>
          </>
        ) : (
          <div>{aboutValue || <span className="text-gray-400">Ikke angivet</span>}</div>
        )}
      </div>

      <div className="divider my-1" />

      <div>
        <label className="label" htmlFor="keywords">
          Top kompetencer
          {" "}
          <button
            type="button"
            className="tooltip tooltip-left"
            data-tip="Dine top kompetencer anvendes i højere grad end andre informationer, når vi udsøger anbefalede job."
            aria-label="Hjælp til Min Profil"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/60 hover:text-base-content" aria-hidden />
          </button>
        </label>
        {editing ? (
          <>
            <input
              className="input input-bordered validator w-full"
              id="keywords"
              name="keywords"
              value={keywordsInput}
              onChange={(event) => onKeywordsChange(event.target.value)}
              placeholder="f.eks. React, TypeScript, .NET, Azure"
            />
            <div className="validator-hint">Adskil med komma. Eksempel: React, TypeScript, .NET</div>
          </>
        ) : (
          <div>
            {profile.keywords && profile.keywords.length > 0 ? (
              profile.keywords.join(", ")
            ) : (
              <span className="text-gray-400">Ikke angivet</span>
            )}
          </div>
        )}
      </div>
    </EditableCardFrame>
  );
};

export default AboutKeywordsCard;
