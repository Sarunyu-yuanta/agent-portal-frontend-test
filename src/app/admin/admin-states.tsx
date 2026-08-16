"use client";

import { Button } from "@sarunyu/system-one";
import { Database, LayoutGrid, Loader2, Plus } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading resources…</p>
      </div>
    </div>
  );
}

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="bg-white rounded-xl border border-border p-8 max-w-sm text-center shadow-sm">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
          <Database className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Connection Error</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ hasApiBase, onAdd }: { hasApiBase: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <LayoutGrid className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No records yet</p>
      {!hasApiBase ? (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Set <code className="bg-muted px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_API_URL</code> in{" "}
          <code className="bg-muted px-1 py-0.5 rounded font-mono">.env.local</code> to connect.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">Add your first record to get started.</p>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Record
          </Button>
        </>
      )}
    </div>
  );
}
