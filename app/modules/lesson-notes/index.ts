import {
  noteDraftState as computeNoteDraftState,
  type NoteDraftInput,
  type NoteDraftState,
} from "./lib/draft-state";

export type {
  NoteDraftInput,
  NoteDraftState,
  NoteDraftStatus,
} from "./lib/draft-state";

/**
 * What the lesson note editor shows for a draft: whether it is saved,
 * unsaved, saving or failed, whether Save is allowed, and the length
 * against the limit the save action enforces.
 */
export function noteDraftState(input: NoteDraftInput): NoteDraftState {
  return computeNoteDraftState(input);
}
