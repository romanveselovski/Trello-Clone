"use client";

import { boardDataService, boardService, memberService } from "@/lib/services";
import { Board } from "@/lib/supabase/models";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useBoards() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isLoaded && supabase) {
      claimAndLoad();
    }
  }, [user, isLoaded, supabase]);

  async function claimAndLoad() {
    if (!user) return;
    const email = user.primaryEmailAddress?.emailAddress;
    if (email) {
      try {
        await memberService.claimPendingInvites(supabase!, user.id, email);
      } catch (err) {
        console.log("claim invites", err);
      }
    }
    await loadBoards();
  }

  async function loadBoards() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (err) {
      console.log(err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load boards.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      console.log(err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to create board.";
      setError(message);
      throw err;
    }
  }

  const refetch = () => {
    loadBoards();
  };

  return { boards, loading, error, createBoard, refetch };
}
