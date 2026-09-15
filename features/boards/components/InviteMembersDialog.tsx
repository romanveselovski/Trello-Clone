"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BoardMember } from "@/lib/supabase/models";
import { memberService } from "@/lib/services";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

interface InviteMembersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  isOwner: boolean;
}

export function InviteMembersDialog({
  isOpen,
  onOpenChange,
  boardId,
  isOwner,
}: InviteMembersDialogProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && supabase && boardId) {
      loadMembers();
    }
  }, [isOpen, boardId, supabase]);

  async function loadMembers() {
    if (!supabase) return;
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.listMembers(supabase, boardId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user || !email.trim()) return;

    try {
      setInviting(true);
      setError(null);
      setSuccess(null);
      await memberService.inviteByEmail(supabase, {
        boardId,
        email: email.trim(),
        invitedBy: user.id,
      });
      setSuccess(
        `Приглашение отправлено на ${email.trim()}. Друг должен зарегистрироваться с этим email и открыть dashboard.`
      );
      setEmail("");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(memberId: string, role: string) {
    if (!supabase || role === "owner") return;
    try {
      await memberService.removeMember(supabase, memberId);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Команда доски"
      description="Пригласите друзей по email — они увидят эту доску в своём dashboard."
      className="w-[95vw] max-w-[480px] mx-auto"
    >
      {isOwner && (
        <form onSubmit={handleInvite} className="space-y-3 mb-6">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email друга</Label>
            <div className="flex gap-2">
              <Input
                id="invite-email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={inviting || !email.trim()}>
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Invite</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Участники</p>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500">Пока никого нет</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">
                      {m.role === "owner" ? "владелец" : "участник"}
                    </Badge>
                    {!m.user_id && (
                      <span className="text-xs text-amber-600">ожидает</span>
                    )}
                  </div>
                </div>
                {isOwner && m.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => handleRemove(m.id, m.role)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </BaseDialog>
  );
}
