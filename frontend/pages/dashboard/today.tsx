import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

export default function TodayTasksPage() {
  const queryClient = useQueryClient();

  // ---- Fetch tasks due today ----
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tasks-today"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("due_at", start.toISOString())
        .lte("due_at", end.toISOString())
        .neq("status", "completed");

      if (error) throw error;
      return data;
    },
  });

  // ---- Mutation: Mark task complete ----
  const mutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["tasks-today"]),
  });

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p>Failed to load tasks.</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Tasks Due Today</h1>

      {data?.length === 0 && <p>No tasks due today.</p>}

      <table border={1} cellPadding={10} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Application ID</th>
            <th>Due At</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((task: any) => (
            <tr key={task.id}>
              <td>{task.type}</td>
              <td>{task.application_id}</td>
              <td>{new Date(task.due_at).toLocaleString()}</td>
              <td>{task.status}</td>
              <td>
                <button onClick={() => mutation.mutate(task.id)}>
                  Mark Complete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
