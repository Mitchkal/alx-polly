"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Database } from "./database.types";

type Poll = Database["public"]["Tables"]["polls"]["Row"];

export async function getPollsAction() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase.from("polls").select("*, votes(count)").eq('is_public', true).order("created_at", { ascending: false });

  if (data) {
    return { data: data.map(poll => ({
      ...poll,
      votes_count: poll.votes && poll.votes.length > 0 ? poll.votes[0].count : 0,
    })), error: null };
  }
  
  if (error) {
    console.error("Error fetching polls:", error);
    return { data: [], error };
  }

  revalidatePath('/polls'); // Revalidate the /polls path to ensure data consistency

  return { data, error: null };
}