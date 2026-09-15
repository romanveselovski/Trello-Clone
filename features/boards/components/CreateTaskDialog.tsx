"use client";

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
import { BaseDialog } from "@/components/common/BaseDialog";
import { useState } from "react";
import { AssigneeSelect } from "./AssigneeSelect";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  columnId?: string;
  boardId?: string;
}

export function CreateTaskDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  columnId,
  boardId,
}: CreateTaskDialogProps) {
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setAssignee("");
          setPriority("medium");
        }
        onOpenChange(open);
      }}
      title="Create New Task"
      description="Add a new task to the board"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label>Title *</label>
          <Input
            id="title"
            name="title"
            placeholder="Enter task title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter task description"
            rows={3}
          />
        </div>
        {boardId ? (
          <AssigneeSelect
            boardId={boardId}
            value={assignee}
            onChange={setAssignee}
          />
        ) : (
          <div className="space-y-2">
            <label>Assignee</label>
            <Input
              id="assignee"
              name="assignee"
              placeholder="Who should do this?"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["low", "medium", "high"].map((p) => (
                <SelectItem key={p} value={p} className="cursor-pointer">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="priority" value={priority} />
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input type="date" name="dueDate" id="dueDate" />
        </div>
        {columnId && <input type="hidden" name="columnId" value={columnId} />}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" className="cursor-pointer">
            Create Task
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}
