"use client";

import { Button } from "@/components/ui/button";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BoardColumnsSkeleton } from "@/components/skeletons/BoardColumns";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DroppableColumn } from "./DroppableColumn";
import { SortableTask } from "./SortableTask";
import { useRef } from "react";
import { useBoardEdgeScroll } from "../hooks/useBoardEdgeScroll";

interface BoardColumnsProps {
  boardId: string;
  columns: ColumnWithTasks[];
  loading: boolean;
  isDragging?: boolean;
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
  isDragging = false,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
  onDeleteTask,
  onOpenTask,
  onCreateColumn,
}: BoardColumnsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, startScroll, stopScroll } =
    useBoardEdgeScroll(scrollRef, !loading);

  if (loading) {
    return <BoardColumnsSkeleton />;
  }

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden">
      <div
        ref={scrollRef}
        className={`h-full min-h-0 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? "select-none" : ""
        }`}
      >
        <div className="flex flex-row items-stretch gap-4 sm:gap-6 h-full min-h-0 w-max px-1">
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
          <div className="w-72 sm:w-80 flex-shrink-0 self-start">
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
      </div>

      <div
        className={`absolute inset-y-0 left-0 z-30 w-12 flex items-center justify-start pointer-events-none transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-full w-full flex items-center justify-start pointer-events-auto ${
            canScrollLeft ? "" : "pointer-events-none"
          }`}
          onPointerEnter={() => canScrollLeft && startScroll(-1)}
          onPointerLeave={stopScroll}
        >
          <div className="ml-0 flex h-14 w-7 items-center justify-center rounded-r-full bg-slate-700/70 text-white shadow-md">
            <ChevronLeft className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-y-0 right-0 z-30 w-12 flex items-center justify-end pointer-events-none transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-full w-full flex items-center justify-end pointer-events-auto ${
            canScrollRight ? "" : "pointer-events-none"
          }`}
          onPointerEnter={() => canScrollRight && startScroll(1)}
          onPointerLeave={stopScroll}
        >
          <div className="mr-0 flex h-14 w-7 items-center justify-center rounded-l-full bg-slate-700/70 text-white shadow-md">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
