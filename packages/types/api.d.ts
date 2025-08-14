export type Preferences = {
  appIcon: number;
  includeLowScore: boolean;
};

export type Oembed = {
  title: string;
  description: string;
  url: string;
};

export type STS = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

export type Live = {
  id: string;
  playbackId: string;
  streamKey: string;
};

// Premium Types
export type UserStatus = "Standard" | "OnChainUnlinked" | "ProLinked";

export type LinkedProfile = {
  profileId: string;
  handle: string;
  linkedAt: string; // Keep as string for API compatibility
};

export type PremiumStatus = {
  userStatus: UserStatus;
  linkedProfile?: LinkedProfile | null;
};

export type AvailableProfiles = {
  profiles: Array<{
    id: string;
    handle: string;
    ownedBy: string;
    isDefault: boolean;
  }>;
  canLink: boolean;
  linkedProfile?: LinkedProfile | null;
};

export type PremiumStatusResponse = {
  data: PremiumStatus;
  status: string;
};

export type AvailableProfilesResponse = {
  data: AvailableProfiles;
  status: string;
};
