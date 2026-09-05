"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/supabase/models";
import { Calendar, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPriorityColor } from "../utils";
import { useOptionalMemberProfiles } from "../context/MemberProfilesContext";
import { AssigneeBadge } from "./AssigneeBadge";

interface SortableTaskProps {
  task: Task;
  onDeleteTask: (taskId: string) => void;
  onOpenTask: (task: Task) => void;
}

export function SortableTask({
  task,
  onDeleteTask,
  onOpenTask,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: task.id });
  const profiles = useOptionalMemberProfiles();
  const assigneeProfile = profiles?.resolve(task.assignee) ?? null;

  const styles = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={styles} {...attributes} {...listeners}>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          if (!isDragging) onOpenTask(task);
        }}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
              <div
                className="p-1.5 hover:bg-gray-100 rounded-md group"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="text-red-400 cursor-pointer group-hover:text-red-500 w-[15px] h-[15px]" />
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">
              {task.description || "No description"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <AssigneeBadge
                    profile={assigneeProfile}
                    showUserIconWhenNoPhoto
                  />
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="size-3.5" />
                    <span className="truncate">
                      {task.due_date.slice(0, 10)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${getPriorityColor(
                    task.priority
                  )}`}
                />
                <span className="text-xs text-gray-500 capitalize">
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
