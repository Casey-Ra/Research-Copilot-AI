import type { NoteSourceType } from "@prisma/client";

export type NotePresentationInput = {
  sourceType: NoteSourceType | string;
  tags: unknown;
};

export function getNoteTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function getNoteView(note: NotePresentationInput) {
  const tags = getNoteTags(note.tags);

  if (note.sourceType === "MANUAL") {
    return "manual";
  }

  if (tags.includes("compare")) {
    return "compare";
  }

  if (tags.includes("search")) {
    return "search";
  }

  if (note.sourceType === "SUMMARY") {
    return "summary";
  }

  if (note.sourceType === "CHAT_MESSAGE") {
    return "chat";
  }

  return "other";
}

export function getNoteSourceLabel(note: NotePresentationInput) {
  const view = getNoteView(note);

  if (view === "compare") {
    return "comparison note";
  }

  if (view === "manual") {
    return "manual note";
  }

  if (view === "search") {
    return "search finding";
  }

  if (view === "summary") {
    return "summary";
  }

  if (view === "chat") {
    return "chat answer";
  }

  return String(note.sourceType).toLowerCase().replace("_", " ");
}

export function getNoteHref(note: NotePresentationInput) {
  const view = getNoteView(note);

  return view === "other" ? "/notes" : `/notes?view=${view}`;
}
