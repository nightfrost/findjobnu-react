import type {
  AccomplishmentDto,
  AccomplishmentUpdate,
  BasicInfoDto,
  ContactDto,
  ContactUpdate,
  EducationDto,
  EducationUpdate,
  ExperienceDto,
  ExperienceUpdate,
  InterestDto,
  InterestUpdate,
  ProfileDto,
  ProfileUpdateRequest,
  SkillDto,
  SkillUpdate,
} from "../findjobnu-api/models";
import type { Accomplishment } from "../findjobnu-api/models/Accomplishment";
import type { BasicInfo } from "../findjobnu-api/models/BasicInfo";
import type { Contact } from "../findjobnu-api/models/Contact";
import type { Education } from "../findjobnu-api/models/Education";
import type { Experience } from "../findjobnu-api/models/Experience";
import type { Interest } from "../findjobnu-api/models/Interest";
import type { Profile } from "../findjobnu-api/models/Profile";
import type { Skill } from "../findjobnu-api/models/Skill";
import { SkillProficiency } from "../findjobnu-api/models/SkillProficiency";
import { SkillProficiencyUpdate } from "../findjobnu-api/models/SkillProficiencyUpdate";

const normalizeString = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const mapBasicInfoDto = (dto?: BasicInfoDto | null): BasicInfo => ({
  firstName: dto?.firstName ?? "",
  lastName: dto?.lastName ?? "",
  dateOfBirth: dto?.dateOfBirth ?? null,
  phoneNumber: dto?.phoneNumber ?? null,
  about: dto?.about ?? null,
  location: dto?.location ?? null,
  company: dto?.company ?? null,
  jobTitle: dto?.jobTitle ?? null,
  linkedinUrl: dto?.linkedinUrl ?? null,
  openToWork: dto?.openToWork ?? undefined,
});

const mapExperienceDto = (dto: ExperienceDto): Experience => ({
  id: dto.id,
  positionTitle: dto.positionTitle ?? null,
  company: dto.company ?? null,
  fromDate: dto.fromDate ?? null,
  toDate: dto.toDate ?? null,
  duration: dto.duration ?? null,
  location: dto.location ?? null,
  description: dto.description ?? null,
  linkedinUrl: dto.linkedinUrl ?? null,
});

const mapEducationDto = (dto: EducationDto): Education => ({
  id: dto.id,
  institution: dto.institution ?? null,
  degree: dto.degree ?? null,
  fromDate: dto.fromDate ?? null,
  toDate: dto.toDate ?? null,
  description: dto.description ?? null,
  linkedinUrl: dto.linkedinUrl ?? null,
});

const mapInterestDto = (dto: InterestDto): Interest => ({
  id: dto.id,
  title: dto.title ?? "",
});

const mapAccomplishmentDto = (dto: AccomplishmentDto): Accomplishment => ({
  id: dto.id,
  category: dto.category ?? null,
  title: dto.title ?? null,
});

const mapContactDto = (dto: ContactDto): Contact => ({
  id: dto.id,
  name: dto.name ?? null,
  occupation: dto.occupation ?? null,
  url: dto.url ?? null,
});

const mapSkillDto = (dto: SkillDto): Skill => ({
  id: dto.id,
  name: dto.name ?? "",
  proficiency: (dto.proficiency ?? SkillProficiency.NUMBER_0) as Skill["proficiency"],
});

export function mapProfileDtoToProfile(dto: ProfileDto): Profile {
  return {
    id: dto.id,
    userId: dto.userId ?? "",
    lastUpdatedAt: dto.lastUpdatedAt ?? undefined,
    createdAt: dto.createdAt ?? undefined,
    savedJobPosts: dto.savedJobPosts ?? [],
    keywords: dto.keywords ?? [],
    basicInfo: mapBasicInfoDto(dto.basicInfo ?? undefined),
    experiences: (dto.experiences ?? []).map(mapExperienceDto),
    educations: (dto.educations ?? []).map(mapEducationDto),
    interests: (dto.interests ?? []).map(mapInterestDto),
    accomplishments: (dto.accomplishments ?? []).map(mapAccomplishmentDto),
    contacts: (dto.contacts ?? []).map(mapContactDto),
    skills: (dto.skills ?? []).map(mapSkillDto),
    hasJobAgent: dto.hasJobAgent ?? undefined,
  };
}

const mapExperienceToUpdate = (experience: Experience): ExperienceUpdate => ({
  positionTitle: normalizeString(experience.positionTitle ?? null),
  company: normalizeString(experience.company ?? null),
  fromDate: normalizeString(experience.fromDate ?? null),
  toDate: normalizeString(experience.toDate ?? null),
  duration: normalizeString(experience.duration ?? null),
  location: normalizeString(experience.location ?? null),
  description: normalizeString(experience.description ?? null),
  linkedinUrl: normalizeString(experience.linkedinUrl ?? null),
});

const mapEducationToUpdate = (education: Education): EducationUpdate => ({
  institution: normalizeString(education.institution ?? null),
  degree: normalizeString(education.degree ?? null),
  fromDate: normalizeString(education.fromDate ?? null),
  toDate: normalizeString(education.toDate ?? null),
  description: normalizeString(education.description ?? null),
  linkedinUrl: normalizeString(education.linkedinUrl ?? null),
});

const mapInterestToUpdate = (interest: Interest): InterestUpdate => ({
  title: normalizeString(interest.title ?? null),
});

const mapAccomplishmentToUpdate = (accomplishment: Accomplishment): AccomplishmentUpdate => ({
  category: normalizeString(accomplishment.category ?? null),
  title: normalizeString(accomplishment.title ?? null),
});

const mapContactToUpdate = (contact: Contact): ContactUpdate => ({
  name: normalizeString(contact.name ?? null),
  occupation: normalizeString(contact.occupation ?? null),
  url: normalizeString(contact.url ?? null),
});

const mapSkillToUpdate = (skill: Skill): SkillUpdate => ({
  name: skill.name ?? "",
  proficiency: (skill.proficiency ?? SkillProficiency.NUMBER_0) as SkillProficiencyUpdate,
});

const mapBasicInfoToUpdate = (basicInfo: BasicInfo) => ({
  firstName: basicInfo.firstName ?? "",
  lastName: basicInfo.lastName ?? "",
  dateOfBirth: basicInfo.dateOfBirth ?? undefined,
  phoneNumber: normalizeString(basicInfo.phoneNumber ?? null),
  about: normalizeString(basicInfo.about ?? null),
  location: normalizeString(basicInfo.location ?? null),
  company: normalizeString(basicInfo.company ?? null),
  jobTitle: normalizeString(basicInfo.jobTitle ?? null),
  linkedinUrl: normalizeString(basicInfo.linkedinUrl ?? null),
  openToWork: basicInfo.openToWork ?? undefined,
});

const filterEmpty = <T>(items: T[]): T[] => items.filter(item => {
  if (item == null) return false;
  if (typeof item !== "object") return true;
  return Object.values(item as object).some(value => value != null);
});

export function mapProfileToUpdateRequest(profile: Profile): ProfileUpdateRequest {
  const experiences = filterEmpty((profile.experiences ?? []).map(mapExperienceToUpdate));
  const educations = filterEmpty((profile.educations ?? []).map(mapEducationToUpdate));
  const interests = filterEmpty((profile.interests ?? []).map(mapInterestToUpdate));
  const accomplishments = filterEmpty((profile.accomplishments ?? []).map(mapAccomplishmentToUpdate));
  const contacts = filterEmpty((profile.contacts ?? []).map(mapContactToUpdate));
  const skills = filterEmpty((profile.skills ?? []).map(mapSkillToUpdate));
  const basicInfo = mapBasicInfoToUpdate(profile.basicInfo);

  return {
    userId: profile.userId,
    ...basicInfo,
    experiences: experiences.length ? experiences : undefined,
    educations: educations.length ? educations : undefined,
    interests: interests.length ? interests : undefined,
    accomplishments: accomplishments.length ? accomplishments : undefined,
    contacts: contacts.length ? contacts : undefined,
    skills: skills.length ? skills : undefined,
    keywords: (profile.keywords ?? []).filter(keyword => keyword && keyword.trim().length > 0),
    savedJobPosts: profile.savedJobPosts ?? [],
  };
}
