import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { noteDraftState, type NoteDraftStatus } from "~/modules/lesson-notes";
import { cn, formatRelativeTime } from "~/lib/utils";

export function LessonNote({
  note,
}: {
  note: { body: string; updatedAt: string } | null;
}) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [draft, setDraft] = useState(note?.body ?? "");
  const state = noteDraftState({
    savedBody: note?.body ?? null,
    draft,
    saving: fetcher.state !== "idle",
    error: fetcher.data?.error,
  });

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <NoteHeader />

        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            placeholder="Write down what you want to remember from this lesson..."
            aria-label="Your notes"
            className="min-h-32 resize-y"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={!state.canSave}>
              {state.status.kind === "saving" ? "Saving..." : "Save note"}
            </Button>
            <NoteStatus status={state.status} updatedAt={note?.updatedAt} />
            <span
              className={cn(
                "ml-auto text-xs",
                state.tooLong ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {state.length} / {state.maxLength}
            </span>
          </div>

          <SavedNotesHint />
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteHeader() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <NotebookPen className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Your notes</h2>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Only you can see these
      </span>
    </div>
  );
}

function SavedNotesHint() {
  return (
    <p className="text-xs text-muted-foreground">
      All your notes are collected under{" "}
      <Link to="/saved" className="underline hover:text-foreground">
        Saved
      </Link>
      .
    </p>
  );
}

function NoteStatus({
  status,
  updatedAt,
}: {
  status: NoteDraftStatus;
  updatedAt: string | undefined;
}) {
  switch (status.kind) {
    case "error":
      return (
        <span role="alert" className="text-xs text-destructive">
          {status.message}
        </span>
      );
    case "unsaved":
      return (
        <span className="text-xs text-muted-foreground">Unsaved changes</span>
      );
    case "saved":
      return (
        <span
          suppressHydrationWarning
          className="text-xs text-muted-foreground"
        >
          Saved{updatedAt ? ` ${formatRelativeTime(updatedAt)}` : ""}
        </span>
      );
    case "saving":
    case "empty":
      return null;
  }
}
