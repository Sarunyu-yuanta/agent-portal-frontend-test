"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button, Tooltip } from "@sarunyu/system-one";
import { NotePencilIcon } from "@phosphor-icons/react";
import { useClients } from "@/hooks/use-api";
import { useNotes } from "@/contexts/notes-context";
import { NoteFormModal } from "./NoteFormModal";
import type { NoteDraft } from "@/lib/notes-api";

const CLIENT_PAGE = /^\/client\/([^/]+)/;

/**
 * Persistent "New note" button, bottom-right on every dashboard page. On a
 * client's Full Profile it pre-selects that client (still changeable in the
 * form) so a quick note taken while looking at a client defaults to them.
 */
export function FloatingNoteButton() {
  const pathname = usePathname();
  const clients = useClients();
  const { addNote } = useNotes();
  const [open, setOpen] = useState(false);
  // Bumped on every open so NoteFormModal remounts (via its `key`) and starts
  // from a clean draft rather than whatever was left over from the last note.
  const [formSession, setFormSession] = useState(0);
  const [saving, setSaving] = useState(false);

  const clientIdFromPath = CLIENT_PAGE.exec(pathname)?.[1] ?? null;

  const handleOpen = () => {
    setFormSession((s) => s + 1);
    setOpen(true);
  };

  const handleSubmit = async (draft: NoteDraft) => {
    setSaving(true);
    try {
      await addNote(draft);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40">
        <Tooltip content="New note" side="left">
          <Button
            variant="primary"
            size="icon-xl"
            className="rounded-full shadow-lg"
            aria-label="New note"
            onClick={handleOpen}
          >
            <NotePencilIcon size={22} weight="bold" />
          </Button>
        </Tooltip>
      </div>

      <NoteFormModal
        key={`${clientIdFromPath ?? "general"}-${formSession}`}
        open={open}
        onOpenChange={setOpen}
        mode="add"
        defaultClientId={clientIdFromPath}
        clients={clients}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </>
  );
}
