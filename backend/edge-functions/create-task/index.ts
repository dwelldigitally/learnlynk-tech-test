import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type CreateTaskPayload = {
  application_id: string;
  task_type: string;
  due_at: string;
};

const VALID_TYPES = ["call", "email", "review"];

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Partial<CreateTaskPayload>;
    const { application_id, task_type, due_at } = body;

    // VALIDATION

    if (!application_id || !task_type || !due_at) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!VALID_TYPES.includes(task_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid task_type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const dueAtDate = new Date(due_at);
    if (isNaN(dueAtDate.getTime()) || dueAtDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: "due_at must be a valid future date" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // FETCH TENANT_ID FROM APPLICATION

    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select("tenant_id")
      .eq("id", application_id)
      .single();

    if (appError || !appData) {
      return new Response(
        JSON.stringify({ error: "Invalid application_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // INSERT TASK

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        application_id: application_id,     // <-- FIXED HERE
        type: task_type,
        due_at: dueAtDate.toISOString(),
        tenant_id: appData.tenant_id,
      })
      .select("id")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // SUCCESS RESPONSE
    return new Response(
      JSON.stringify({ success: true, task_id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error in create-task:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
