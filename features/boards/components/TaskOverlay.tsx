"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/supabase/models";
import { Calendar } from "lucide-react";
import { getPriorityColor } from "../utils";
import { useOptionalMemberProfiles } from "../context/MemberProfilesContext";
import { AssigneeBadge } from "./AssigneeBadge";

interface TaskOverlayProps {
  task: Task;
}

export function TaskOverlay({ task }: TaskOverlayProps) {
  const profiles = useOptionalMemberProfiles();
  const assigneeProfile = profiles?.resolve(task.assignee) ?? null;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
              {task.title}
            </h4>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
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
                  <span className="truncate">{task.due_date}</span>
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
  );
}
