import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraftInput = {
  /** The body last saved, or null when the Student has no note yet. */
  savedBody: string | null;
  /** What is in the editor now. */
  draft: string;
  saving: boolean;
  /** The error from the last save attempt, if it failed. */
  error?: string;
};

export type NoteDraftStatus =
  | { kind: "error"; message: string }
  | { kind: "saving" }
  | { kind: "unsaved" }
  | { kind: "saved" }
  | { kind: "empty" };

export type NoteDraftState = {
  status: NoteDraftStatus;
  canSave: boolean;
  length: number;
  maxLength: number;
  tooLong: boolean;
};

export function noteDraftState(input: NoteDraftInput): NoteDraftState {
  // The save action trims the body before checking and storing it, so
  // whitespace at the ends of the draft neither counts nor is a change.
  const body = input.draft.trim();
  const length = body.length;
  const tooLong = length > MAX_NOTE_LENGTH;
  const changed = body !== (input.savedBody ?? "");
  const blank = length === 0;

  return {
    status: statusOf(input, changed),
    canSave: !input.saving && changed && !blank && !tooLong,
    length,
    maxLength: MAX_NOTE_LENGTH,
    tooLong,
  };
}

function statusOf(input: NoteDraftInput, changed: boolean): NoteDraftStatus {
  if (input.saving) return { kind: "saving" };
  // A failed save leaves the draft unsaved; the error says why.
  if (input.error && changed) return { kind: "error", message: input.error };
  if (changed) return { kind: "unsaved" };
  if (input.savedBody === null) return { kind: "empty" };
  return { kind: "saved" };
}
