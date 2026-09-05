"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnWithTasks } from "@/lib/supabase/models";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useState } from "react";

interface DroppableColumnProps {
  boardId: string;
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (task: any) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function DroppableColumn({
  boardId,
  column,
  children,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    onCreateTask(e);
    setIsCreatingTask(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-72 sm:w-80 flex-shrink-0 ${
        isOver ? "bg-blue-50 rounded-lg" : ""
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-sm border ${
          isOver ? "ring-2 ring-blue-300" : ""
        }`}
      >
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-start gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug break-words">
                {column.title}
              </h3>
              <Badge variant="secondary" className="flex-shrink-0 mt-0.5">
                {column.tasks.length}
              </Badge>
            </div>
            <div className="flex items-center flex-shrink-0 -mr-1.5 -mt-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => onDeleteColumn(column.id)}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => onEditColumn(column)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-2">
          {children}
          <div className="w-full">
            <Button
              variant="ghost"
              className="cursor-pointer w-full mt-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsCreatingTask(true)}
            >
              <Plus />
              Add Task
            </Button>
          </div>
          <CreateTaskDialog
            isOpen={isCreatingTask}
            onOpenChange={setIsCreatingTask}
            onSubmit={handleCreateTask}
            columnId={column.id}
            boardId={boardId}
          />
        </div>
      </div>
    </div>
  );
}
