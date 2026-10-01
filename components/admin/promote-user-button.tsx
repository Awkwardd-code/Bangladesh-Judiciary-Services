"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toaster";

export function PromoteUserButton({
  userId,
  currentRole,
  userName,
}: {
  userId: string;
  currentRole: "student" | "admin";
  userName: string;
}) {
  const [loading, setLoading] = useState(false);

  const nextRole = currentRole === "student" ? "admin" : "student";
  const isDemote = currentRole === "admin";

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: nextRole }),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast(payload?.error ?? "Role update failed.", "error");
        return;
      }

      toast(
        isDemote
          ? `${userName} is no longer an admin.`
          : `${userName} is now an admin.`,
      );
      window.location.reload();
    } catch (error) {
      console.error("Update role error", error);
      toast("Unable to update role right now.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <button
          type="button"
          disabled={loading}
          className={
            isDemote
              ? "cursor-pointer rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              : "cursor-pointer rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          }
        >
          <span className="inline-flex items-center gap-2">
            <Shield size={14} />
            {isDemote ? "Remove admin" : "Make admin"}
          </span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDemote
              ? `Remove admin access from ${userName}?`
              : `Promote ${userName} to admin?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDemote
              ? "They will lose access to the admin panel. Their student account remains active."
              : "They will gain full access to the admin panel, including the ability to manage students, courses, and payments."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClick}>
            {isDemote ? "Remove" : "Promote"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
