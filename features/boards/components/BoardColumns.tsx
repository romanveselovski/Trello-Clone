"use client";

import { Button } from "@/components/ui/button";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { Plus } from "lucide-react";
import { BoardColumnsSkeleton } from "@/components/skeletons/BoardColumns";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DroppableColumn } from "./DroppableColumn";
import { SortableTask } from "./SortableTask";

interface BoardColumnsProps {
  boardId: string;
  columns: ColumnWithTasks[];
  loading: boolean;
  onCreateTask: (task: any) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  onDeleteColumn: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTask: (task: Task) => void;
  onCreateColumn: () => void;
}

export function BoardColumns({
  boardId,
  columns,
  loading,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
  onDeleteTask,
  onOpenTask,
  onCreateColumn,
}: BoardColumnsProps) {
  if (loading) {
    return <BoardColumnsSkeleton />;
  }

  return (
    <div className="flex flex-row gap-4 sm:gap-6 overflow-x-auto overscroll-x-contain pb-4 px-1 -mx-1 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
      {columns.map((column, key) => (
        <DroppableColumn
          key={key}
          boardId={boardId}
          column={column}
          onCreateTask={onCreateTask}
          onEditColumn={onEditColumn}
          onDeleteColumn={onDeleteColumn}
        >
          <SortableContext
            items={column.tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {column.tasks.map((task, key) => (
                <SortableTask
                  key={key}
                  task={task}
                  onDeleteTask={onDeleteTask}
                  onOpenTask={onOpenTask}
                />
              ))}
            </div>
          </SortableContext>
        </DroppableColumn>
      ))}
      <div className="w-72 sm:w-80 flex-shrink-0">
        <Button
          variant="outline"
          className="w-full h-[130px] border-dashed border-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onCreateColumn}
        >
          <Plus />
          Add another list
        </Button>
      </div>
    </div>
  );
}
