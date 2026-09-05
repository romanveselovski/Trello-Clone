import { Board, BoardMember, Column, Task } from "./supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;

    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    // RLS returns owned + shared boards; no user_id filter
    const { data, error } = await supabase
      .from("boards")
      .select(
        `
        *,
        columns (
          tasks ( count )
        ),
        board_members (
          user_id,
          email,
          role
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(
      (
        board: Board & {
          columns?: Array<{ tasks?: Array<{ count: number }> }>;
          board_members?: Array<{
            user_id: string | null;
            email: string;
            role: "owner" | "member";
          }>;
        }
      ) => {
        const totalTasks =
          board.columns?.reduce(
            (sum: number, col: { tasks?: Array<{ count: number }> }) =>
              sum + (col.tasks?.[0]?.count || 0),
            0
          ) || 0;

        const members = board.board_members || [];
        const myMembership = members.find((m) => m.user_id === userId);
        const { columns, board_members, ...boardWithoutColumns } = board;

        return {
          ...boardWithoutColumns,
          totalTasks,
          memberCount: members.length,
          isShared: members.length > 1 || board.user_id !== userId,
          myRole:
            myMembership?.role ||
            (board.user_id === userId ? "owner" : "member"),
        };
      }
    );
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const columnService = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteColumn(supabase: SupabaseClient, columnId: string) {
    const { data, error } = await supabase.from("columns").delete().eq("id", columnId);
    if (error) throw error;
    return data;
  },
};

export const taskService = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        columns!inner(board_id)
        `
      )
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        sort_order: newOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) throw error;
    return data;
  },

  async updateTask(
    supabase: SupabaseClient,
    taskId: string,
    updates: Partial<
      Pick<
        Task,
        "title" | "description" | "assignee" | "due_date" | "priority"
      >
    >
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(supabase: SupabaseClient, taskId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);
    if (error) throw error;
    return data;
  },
};

export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
      email?: string;
    }
  ) {
    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    // Owner row is usually created by DB trigger; keep a safe fallback
    try {
      await memberService.addOwner(supabase, {
        boardId: board.id,
        userId: boardData.userId,
        email: boardData.email || `${boardData.userId}@owner.local`,
      });
    } catch {
      // ignore duplicate owner from trigger
    }

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};

export const memberService = {
  async listMembers(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<BoardMember[]> {
    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addOwner(
    supabase: SupabaseClient,
    input: { boardId: string; userId: string; email: string }
  ): Promise<BoardMember> {
    const { data, error } = await supabase
      .from("board_members")
      .insert({
        board_id: input.boardId,
        user_id: input.userId,
        email: input.email.toLowerCase(),
        role: "owner",
        invited_by: input.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async inviteByEmail(
    supabase: SupabaseClient,
    input: {
      boardId: string;
      email: string;
      invitedBy: string;
      userId?: string | null;
    }
  ): Promise<BoardMember> {
    const email = input.email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("board_members")
      .upsert(
        {
          board_id: input.boardId,
          email,
          user_id: input.userId || null,
          role: "member",
          invited_by: input.invitedBy,
        },
        { onConflict: "board_id,email" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async claimPendingInvites(
    supabase: SupabaseClient,
    userId: string,
    email: string
  ) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;

    const { error } = await supabase
      .from("board_members")
      .update({ user_id: userId })
      .is("user_id", null)
      .ilike("email", normalized);

    if (error) throw error;
  },

  async removeMember(supabase: SupabaseClient, memberId: string) {
    const { error } = await supabase
      .from("board_members")
      .delete()
      .eq("id", memberId);
    if (error) throw error;
  },
};
