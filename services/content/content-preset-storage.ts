"use client";

import type { ContentOverlayStyle, SavedOverlayPreset } from "@/lib/types/content";

const STORAGE_KEY = "photo-caption-local-app.overlay-presets";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readPresets(): SavedOverlayPreset[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SavedOverlayPreset[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item?.id === "string" &&
        typeof item?.name === "string" &&
        typeof item?.style === "object" &&
        item.style !== null,
    );
  } catch {
    return [];
  }
}

function writePresets(items: SavedOverlayPreset[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listSavedOverlayPresets(): SavedOverlayPreset[] {
  return readPresets();
}

export function saveOverlayPreset(name: string, style: ContentOverlayStyle): SavedOverlayPreset[] {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return readPresets();
  }

  const nextItem: SavedOverlayPreset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    style,
  };
  const nextItems = [nextItem, ...readPresets()].slice(0, 12);

  writePresets(nextItems);

  return nextItems;
}

export function deleteOverlayPreset(id: string): SavedOverlayPreset[] {
  const nextItems = readPresets().filter((item) => item.id !== id);

  writePresets(nextItems);

  return nextItems;
}

export function renameOverlayPreset(id: string, name: string): SavedOverlayPreset[] {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return readPresets();
  }

  const nextItems = readPresets().map((item) =>
    item.id === id
      ? {
          ...item,
          name: trimmedName,
        }
      : item,
  );

  writePresets(nextItems);

  return nextItems;
}

export function exportOverlayPresets(): string {
  return JSON.stringify(readPresets(), null, 2);
}

export function importOverlayPresets(raw: string): SavedOverlayPreset[] {
  try {
    const parsed = JSON.parse(raw) as SavedOverlayPreset[];

    if (!Array.isArray(parsed)) {
      return readPresets();
    }

    const nextItems = parsed
      .filter(
        (item) =>
          typeof item?.name === "string" &&
          typeof item?.style === "object" &&
          item.style !== null,
      )
      .map((item, index) => ({
        id:
          typeof item.id === "string" && item.id.trim()
            ? item.id
            : `${Date.now()}-import-${index}`,
        name: item.name.trim(),
        style: item.style,
      }))
      .filter((item) => item.name.length > 0)
      .slice(0, 12);

    writePresets(nextItems);

    return nextItems;
  } catch {
    return readPresets();
  }
}
