import { describe, expect, it } from "vitest";
import { MAX_NOTE_LENGTH } from "~/lib/notes";
import { noteDraftState } from "../index";

const base = { savedBody: null, draft: "", saving: false };

describe("noteDraftState", () => {
  it("is empty and cannot save when there is no note and no draft", () => {
    const state = noteDraftState(base);
    expect(state.status).toEqual({ kind: "empty" });
    expect(state.canSave).toBe(false);
  });

  it("is unsaved and can save once the Student types a first note", () => {
    const state = noteDraftState({ ...base, draft: "Result types" });
    expect(state.status).toEqual({ kind: "unsaved" });
    expect(state.canSave).toBe(true);
  });

  it("is saved and cannot save again when the draft matches the note", () => {
    const state = noteDraftState({
      ...base,
      savedBody: "Result types",
      draft: "Result types",
    });
    expect(state.status).toEqual({ kind: "saved" });
    expect(state.canSave).toBe(false);
  });

  it("treats whitespace at the ends as no change, as the save trims it", () => {
    const state = noteDraftState({
      ...base,
      savedBody: "Result types",
      draft: "Result types\n\n",
    });
    expect(state.status).toEqual({ kind: "saved" });
    expect(state.canSave).toBe(false);
  });

  it("is unsaved when the draft differs from the saved note", () => {
    const state = noteDraftState({
      ...base,
      savedBody: "Result types",
      draft: "Result types and never",
    });
    expect(state.status).toEqual({ kind: "unsaved" });
    expect(state.canSave).toBe(true);
  });

  it("cannot save a blank draft, even over an existing note", () => {
    const state = noteDraftState({
      ...base,
      savedBody: "Result types",
      draft: "   \n ",
    });
    expect(state.status).toEqual({ kind: "unsaved" });
    expect(state.canSave).toBe(false);
  });

  it("is saving, and cannot save twice, while a save is in flight", () => {
    const state = noteDraftState({ ...base, draft: "x", saving: true });
    expect(state.status).toEqual({ kind: "saving" });
    expect(state.canSave).toBe(false);
  });

  it("shows the error from a failed save while the draft is unsaved", () => {
    const state = noteDraftState({
      ...base,
      draft: "x",
      error: "Something went wrong",
    });
    expect(state.status).toEqual({
      kind: "error",
      message: "Something went wrong",
    });
    expect(state.canSave).toBe(true);
  });

  it("drops a stale error once the draft matches the saved note", () => {
    const state = noteDraftState({
      ...base,
      savedBody: "x",
      draft: "x",
      error: "Something went wrong",
    });
    expect(state.status).toEqual({ kind: "saved" });
  });

  it("counts characters against the save limit", () => {
    const state = noteDraftState({ ...base, draft: "abc" });
    expect(state.length).toBe(3);
    expect(state.maxLength).toBe(MAX_NOTE_LENGTH);
    expect(state.tooLong).toBe(false);
  });

  it("allows a draft exactly at the limit", () => {
    const state = noteDraftState({
      ...base,
      draft: "a".repeat(MAX_NOTE_LENGTH),
    });
    expect(state.tooLong).toBe(false);
    expect(state.canSave).toBe(true);
  });

  it("refuses a draft over the limit", () => {
    const state = noteDraftState({
      ...base,
      draft: "a".repeat(MAX_NOTE_LENGTH + 1),
    });
    expect(state.tooLong).toBe(true);
    expect(state.canSave).toBe(false);
  });
});
