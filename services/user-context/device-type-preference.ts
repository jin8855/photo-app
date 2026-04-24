export type UserDeviceType =
  | "galaxy_s25_ultra"
  | "galaxy_s26_ultra"
  | "generic_smartphone";

export const userDeviceTypes: UserDeviceType[] = [
  "galaxy_s25_ultra",
  "galaxy_s26_ultra",
  "generic_smartphone",
];

const DEVICE_TYPE_STORAGE_KEY = "photo-app:user-device-type";

export function isUserDeviceType(value: string | null | undefined): value is UserDeviceType {
  return value !== null && value !== undefined && userDeviceTypes.includes(value as UserDeviceType);
}

export function readStoredDeviceType(): UserDeviceType | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(DEVICE_TYPE_STORAGE_KEY);

  return isUserDeviceType(value) ? value : null;
}

export function storeDeviceType(deviceType: UserDeviceType | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!deviceType) {
    window.localStorage.removeItem(DEVICE_TYPE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(DEVICE_TYPE_STORAGE_KEY, deviceType);
}
