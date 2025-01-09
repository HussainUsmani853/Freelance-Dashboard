import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import clienticon from "../assets/Group 1.png";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch tasks from the database
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
      setError(err);
    }
  };

  useEffect(() => {
    // Fetch tasks initially
    fetchTasks();

    // Set up real-time subscription
    const taskSubscription = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          setTasks((prevTasks) => [...prevTasks, payload.new]); // Append the new task to the state
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(taskSubscription);
    };
  }, []);

  return (
    <ul>
      {error ? (
        <p>Error loading tasks: {error.message}</p>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <li
            key={task.id}
            className="d-flex justify-content-between p-3 task-list-card"
          >
            <div>
              <h5 className="mb-1">{task.title}</h5>
              <div className="d-flex mt-3">
                <div className="text-dark">
                  <img src={clienticon} alt="Client" /> {task.clientName}
                </div>
                <div className="me-3 text-secondary mx-3">
                  <i className="bi bi-clock me-1"></i> {task.timeSpent || "-"}
                </div>
              </div>
            </div>
            <div className="d-flex align-items-start">
              <div className="me-3">
                <span
                  className={`badge task-situation ${
                    task.status === "In Progress"
                      ? "task-in-progress text-primary"
                      : task.status === "Backlog"
                      ? "task-backlog text-dark"
                      : "task-done text-success"
                  } p-2`}
                >
                  <i
                    className={
                      task.status === "Done" ? "bi bi-check" : "bi bi-dot"
                    }
                  ></i>{" "}
                  {task.status}
                </span>
              </div>
              <div
                className={
                  new Date(task.dueDate) < new Date()
                    ? "text-white deadline-missed bg-danger rounded p-2"
                    : `text-dark ${
                        task.status === "Done"
                          ? "text-decoration-line-through"
                          : ""
                      }`
                }
              >
                <i
                  className={`bi bi-${
                    new Date(task.dueDate) < new Date() &&
                    (task.status === "In Progress" || task.status === "Backlog")
                      ? "exclamation-triangle"
                      : "calendar-event-fill"
                  } me-1`}
                ></i>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
          </li>
        ))
      ) : (
        <p>No tasks available</p>
      )}
    </ul>
  );
};

export default TaskList;