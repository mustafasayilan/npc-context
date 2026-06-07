export interface UserProfile {
  id: string;
  displayName: string;
  locale: string;
  timezone: string;
}

export function updateProfile(profile: UserProfile, patch: Partial<UserProfile>): UserProfile {
  return { ...profile, ...patch };
}

export function formatDisplayName(profile: UserProfile): string {
  return profile.displayName.trim() || profile.id;
}

export function profileHasLocale(profile: UserProfile): boolean {
  return profile.locale.length > 0 && profile.timezone.length > 0;
}
