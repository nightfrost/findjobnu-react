import type { FindjobnuServiceDTOsProfileDto } from "../findjobnu-api/models/FindjobnuServiceDTOsProfileDto";
import type { Profile } from "../findjobnu-api/models/Profile";

export function mapProfileDtoToProfile(dto: FindjobnuServiceDTOsProfileDto): Profile {
  const basic = dto.basicInfo as unknown as Record<string, any> | undefined;
  return {
    id: dto.id,
    userId: dto.userId ?? "",
    lastUpdatedAt: dto.lastUpdatedAt ?? undefined,
    createdAt: dto.createdAt ?? undefined,
    savedJobPosts: dto.savedJobPosts ?? [],
    keywords: dto.keywords ?? [],
    basicInfo: {
      firstName: basic?.firstName ?? "",
      lastName: basic?.lastName ?? "",
      phoneNumber: basic?.phoneNumber ?? basic?.phone ?? "",
      dateOfBirth: basic?.dateOfBirth ?? null,
      location: basic?.location ?? "",
      jobTitle: basic?.jobTitle ?? "",
      company: basic?.company ?? "",
      about: basic?.about ?? undefined,
      openToWork: basic?.openToWork ?? false,
    } as any,
    experiences: (dto.experiences ?? []) as unknown as import("../findjobnu-api/models/Experience").Experience[],
    educations: (dto.educations ?? []) as unknown as import("../findjobnu-api/models/Education").Education[],
    interests: (dto.interests ?? []) as unknown as import("../findjobnu-api/models/Interest").Interest[],
    accomplishments: (dto.accomplishments ?? []) as unknown as import("../findjobnu-api/models/Accomplishment").Accomplishment[],
    contacts: (dto.contacts ?? []) as unknown as import("../findjobnu-api/models/Contact").Contact[],
    skills: (dto.skills ?? []) as unknown as import("../findjobnu-api/models/Skill").Skill[],
  };
}
