"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/supabase/models";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { getPriorityColor } from "../utils";
import { AssigneeSelect } from "./AssigneeSelect";
import { AssigneeBadge } from "./AssigneeBadge";
import { useOptionalMemberProfiles } from "../context/MemberProfilesContext";

interface TaskDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  boardId?: string;
  columnTitle?: string;
  onSave: (
    taskId: string,
    updates: Partial<
      Pick<
        Task,
        "title" | "description" | "assignee" | "due_date" | "priority"
      >
    >
  ) => Promise<void>;
  onDelete: (taskId: string) => void;
}

export function TaskDetailDialog({
  isOpen,
  onOpenChange,
  task,
  boardId,
  columnTitle,
  onSave,
  onDelete,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profiles = useOptionalMemberProfiles();
  const assigneeProfile = profiles?.resolve(assignee) ?? null;

  useEffect(() => {
    if (!task) return;
    setTitle(task.title || "");
    setDescription(task.description || "");
    setAssignee(task.assignee || "");
    setPriority(task.priority || "medium");
    setDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
    setError(null);
  }, [task, isOpen]);

  if (!task) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !title.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        assignee: assignee.trim() || null,
        priority,
        due_date: dueDate || null,
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Task details"
      description={
        columnTitle ? `Column: ${columnTitle}` : "View and edit this task"
      }
      className="w-[95vw] max-w-[640px] mx-auto"
    >
      <form className="space-y-4" onSubmit={handleSave}>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(priority)}`}
          />
          <Badge variant="secondary" className="capitalize">
            {priority}
          </Badge>
          {assignee && (
            <AssigneeBadge
              profile={assigneeProfile}
              showUserIconWhenNoPhoto
            />
          )}
          {dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="size-3.5" />
              {dueDate}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="No description"
            rows={10}
            className="min-h-[200px] resize-y whitespace-pre-wrap"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            {boardId ? (
              <AssigneeSelect
                boardId={boardId}
                value={assignee}
                onChange={setAssignee}
                id="task-assignee"
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Input
                  id="task-assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Who should do this?"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(v) =>
              setPriority(v as "low" | "medium" | "high")
            }
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["low", "medium", "high"] as const).map((p) => (
                <SelectItem key={p} value={p} className="cursor-pointer">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
            onClick={() => {
              onDelete(task.id);
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="submit" disabled={saving} className="cursor-pointer">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </BaseDialog>
  );
}
