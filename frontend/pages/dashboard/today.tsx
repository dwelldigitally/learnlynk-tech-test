// LearnLynk Tech Test - Task 4: /dashboard/today
// Fetch today's tasks, show table, mark complete

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = {
  id: string;
  type: string;
  status: string;
  application_id: string;
  due_at: string;
};

export default function TodayDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper — start and end timestamps of TODAY
  const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  // -----------------------------------------
  // FETCH TASKS DUE TODAY
  // -----------------------------------------
  async function fetchTasks() {
    setLoading(true);
    setError(null);

    try {
      const { start, end } = getTodayRange();

      const { data, error } = await supabase
        .from("tasks")
        .select("id, type, status, application_id, due_at")
        .gte("due_at", start)
        .lte("due_at", end)
        .not("status", "eq", "completed")
        .order("due_at", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // MARK COMPLETE
  // -----------------------------------------
  async function markComplete(id: string) {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;

      // Refresh UI
      await fetchTasks();
    } catch (err: any) {
      console.error(err);
      alert("Failed to update task");
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // -----------------------------------------
  // UI
  // -----------------------------------------
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Inter, sans-serif",
        background: "#f7f8fa",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.07)",
        }}
      >
        <h1
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "#222",
          }}
        >
          Today&apos;s Tasks
        </h1>

        {tasks.length === 0 && (
          <p style={{ fontSize: "1.1rem", color: "#555" }}>
            No tasks due today 🎉
          </p>
        )}

        {tasks.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead>
              <tr style={{ color: "#666", fontSize: "0.9rem" }}>
                <th style={{ textAlign: "left", paddingBottom: "8px" }}>Type</th>
                <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                  Application
                </th>
                <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                  Due At
                </th>
                <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                  Status
                </th>
                <th style={{ textAlign: "left", paddingBottom: "8px" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  style={{
                    background: "white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    borderRadius: "8px",
                  }}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 500 }}>
                    {t.type}
                  </td>

                  <td style={{ padding: "12px 14px", color: "#555" }}>
                    {t.application_id}
                  </td>

                  <td style={{ padding: "12px 14px", color: "#444" }}>
                    {new Date(t.due_at).toLocaleString()}
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        background:
                          t.status === "completed"
                            ? "#d1fae5"
                            : t.status === "open"
                              ? "#fef3c7"
                              : "#e5e7eb",
                        color:
                          t.status === "completed"
                            ? "#065f46"
                            : t.status === "open"
                              ? "#92400e"
                              : "#374151",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    {t.status !== "completed" && (
                      <button
                        onClick={() => markComplete(t.id)}
                        style={{
                          padding: "6px 14px",
                          background: "#2563eb",
                          border: "none",
                          color: "white",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );


}
