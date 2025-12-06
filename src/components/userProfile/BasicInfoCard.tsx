import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import LocationTypeahead from "../LocationTypeahead";
import EditableCardFrame from "./EditableCardFrame";
import type { Profile } from "../../findjobnu-api/models/Profile";
import type { ProfileDto } from "../../findjobnu-api/models/ProfileDto";

interface BasicInfoCardProps {
  profile: ProfileDto;
  form: Profile | null;
  editing: boolean;
  location: string;
  dateOfBirthInput: string;
  onToggleEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onBasicInfoChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocationChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onToggleOpenToWork: (checked: boolean) => void;
  onDateInputRef: (node: HTMLInputElement | null) => void;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  profile,
  form,
  editing,
  location,
  dateOfBirthInput,
  onToggleEdit,
  onCancel,
  onSave,
  onBasicInfoChange,
  onLocationChange,
  onDateOfBirthChange,
  onToggleOpenToWork,
  onDateInputRef,
}) => {
  const renderValue = (value?: string | null) => {
    if (!value || value.trim().length === 0) return <span className="text-gray-400">Ikke angivet</span>;
    return value;
  };

  const renderDate = (value?: string | Date | null) => {
    if (!value) return <span className="text-gray-400">Ikke angivet</span>;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return <span className="text-gray-400">Ikke angivet</span>;
    return parsed.toLocaleDateString("da-DK");
  };

  return (
    <EditableCardFrame
      title={
        <>
          <span>Basisoplysninger</span>
          {" "}
          <button
            type="button"
            className="tooltip tooltip-left"
            data-tip="Vi bruger dine informationer til at finde relevante job annoncer i bla. 'Anbefalede job'. Vi videregiver aldrig dine oplysninger til tredjeparter."
            aria-label="Hjælp til Min Profil"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/60 hover:text-base-content" aria-hidden />
          </button>
        </>
      }
      editTooltip="Rediger Basisoplysninger"
      editing={editing}
      onToggleEdit={onToggleEdit}
      onCancel={onCancel}
      onSave={onSave}
      bodyClassName="grid gap-4 lg:grid-cols-2"
    >
      <div>
        <label className="label" htmlFor="firstName">
          Fornavn
        </label>
        {editing ? (
          <>
            <input
              className="input input-bordered validator w-full"
              id="firstName"
              name="firstName"
              value={form?.basicInfo?.firstName ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Indtast fornavn"
              required
              minLength={2}
              pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
              title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
            />
            <p className="validator-hint">
              Mindst 2 bogstaver. Tilladte tegn: bogstaver, mellemrum, bindestreg og apostrof.
            </p>
          </>
        ) : (
          <div>{renderValue(profile.basicInfo?.firstName)}</div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="lastName">
          Efternavn
        </label>
        {editing ? (
          <>
            <input
              className="input input-bordered validator w-full"
              id="lastName"
              name="lastName"
              value={form?.basicInfo?.lastName ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Indtast efternavn"
              required
              minLength={2}
              pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
              title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
            />
            <p className="validator-hint">
              Mindst 2 bogstaver. Tilladte tegn: bogstaver, mellemrum, bindestreg og apostrof.
            </p>
          </>
        ) : (
          <div>{renderValue(profile.basicInfo?.lastName)}</div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="location">
          By
        </label>
        {editing ? (
          <LocationTypeahead
            value={location}
            onChange={(value) => {
              onLocationChange(value);
            }}
            inputProps={{
              name: "location",
              id: "location",
              pattern: "^[A-Za-zÀ-ÿ' .-]{2,}$",
              title: "Brug mindst 2 tegn. Tilladte tegn: bogstaver, mellemrum, punktum, bindestreg og apostrof.",
              className: "input validator w-full",
            }}
          />
        ) : (
          <div>{renderValue(profile.basicInfo?.location)}</div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="dateOfBirth">
          Fødselsdato
        </label>
        {editing ? (
          <input
            ref={onDateInputRef}
            className="input input-bordered validator w-full"
            id="dateOfBirth"
            name="dateOfBirth"
            type="text"
            value={dateOfBirthInput}
            onChange={(event) => onDateOfBirthChange(event.target.value)}
            placeholder="YYYY-MM-DD"
            pattern="^\\d{4}-\\d{2}-\\d{2}$"
            title="Brug formatet YYYY-MM-DD."
          />
        ) : (
          <div>{renderDate(profile.basicInfo?.dateOfBirth ?? null)}</div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="jobTitle">
          Jobtitel
        </label>
        {editing ? (
          <>
            <input
              className="input input-bordered validator w-full"
              id="jobTitle"
              name="jobTitle"
              value={form?.basicInfo?.jobTitle ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Jobtitel"
              pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$"
              title="Mindst 2 tegn. Tilladte tegn: bogstaver, tal, mellemrum, punktum, komma, bindestreg og apostrof."
            />
            <div className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</div>
          </>
        ) : (
          <div>{renderValue(profile.basicInfo?.jobTitle)}</div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="company">
          Virksomhed
        </label>
        {editing ? (
          <>
            <input
              className="input input-bordered validator w-full"
              id="company"
              name="company"
              value={form?.basicInfo?.company ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Virksomhed"
              pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$"
              title="Mindst 2 tegn. Tilladte tegn: bogstaver, tal, mellemrum, punktum, komma, bindestreg og apostrof."
            />
            <div className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</div>
          </>
        ) : (
          <div>{renderValue(profile.basicInfo?.company)}</div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="phoneNumber">
          Telefonnummer
        </label>
        {editing ? (
          <>
            <input
              className="input input-bordered validator w-full"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={form?.basicInfo?.phoneNumber ?? ""}
              onChange={onBasicInfoChange}
              placeholder="Indtast telefonnummer"
              pattern="^[+()0-9\\s-]{6,20}$"
              title="Indtast et gyldigt telefonnummer (6-20 tegn, tal, mellemrum, +, (), -)."
            />
            <p className="validator-hint">Gyldigt telefonnummer, f.eks. +45 12 34 56 78</p>
          </>
        ) : (
          <div>{renderValue(profile.basicInfo?.phoneNumber)}</div>
        )}
      </div>

      <div className="lg:col-span-2">
        <label className="label" htmlFor="openToWork">
          Aktivt søgende?
        </label>
        {editing ? (
          <div className="flex items-center gap-3">
            <input
              id="openToWork"
              type="checkbox"
              className="toggle toggle-primary"
              checked={!!form?.basicInfo?.openToWork}
              onChange={(event) => onToggleOpenToWork(event.target.checked)}
            />
            <span className="text-sm text-base-content/70">Vis at du er åben for nye muligheder</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              id="openToWork"
              type="checkbox"
              className="toggle toggle-primary"
              checked={!!profile.basicInfo?.openToWork}
              readOnly
              disabled
            />
            <span
              className={`text-sm ${profile.basicInfo?.openToWork ? "text-success" : "text-base-content/70"}`}
            >
              {profile.basicInfo?.openToWork ? "Aktivt søgende." : "Ikke aktivt søgende."}
            </span>
          </div>
        )}
      </div>
    </EditableCardFrame>
  );
};

export default BasicInfoCard;
