export interface Settings {
  theme: "light" | "dark";
  density: "compact" | "comfortable";
  emailNotifications: boolean;
}

const currentSettings: Settings = {
  theme: "light",
  density: "comfortable",
  emailNotifications: true
};

export async function getSettings(): Promise<Settings> {
  return currentSettings;
}

export async function updateSettings(nextSettings: Partial<Settings>): Promise<Settings> {
  Object.assign(currentSettings, nextSettings);
  return currentSettings;
}
