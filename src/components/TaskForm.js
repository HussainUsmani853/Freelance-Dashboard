import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const TaskForm = () => {
  const [task, setTask] = useState({
    title: "",
    clientName: "",
    timeSpent: "",
    status: "In Progress", // Default status
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
        // Save to supabase
        const {data, error} = await supabase.from("tasks").insert([
            {
              title: task.title,
              clientName: task.clientName,
              timeSpent: task.timeSpent,
              status: task.status,
              dueDate: task.dueDate,
            },
        ]);

        if (error) throw error;

        console.log("Task added: ", data);
        alert("Task saved successfully");
        setTask({ title: "", clientName: "", timeSpent: "", status: "In Progress", dueDate: "" });
    } catch (err) {
        console.error("Error saving task:", err.message);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container my-2">
      <h3 className="mb-4">Create Task</h3>
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">
                Task Title
                </label>
                <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={task.title}
                onChange={handleChange}
                required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="clientName" className="form-label">
                Client Name
                </label>
                <input
                type="text"
                id="clientName"
                name="clientName"
                className="form-control"
                value={task.clientName}
                onChange={handleChange}
                required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="timeSpent" className="form-label">
                Time Spent
                </label>
                <input
                type="text"
                id="timeSpent"
                name="timeSpent"
                className="form-control"
                value={task.timeSpent}
                onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="status" className="form-label">
                Task Status
                </label>
                <select
                id="status"
                name="status"
                className="form-select"
                value={task.status}
                onChange={handleChange}
                >
                <option value="In Progress">In Progress</option>
                <option value="Backlog">Backlog</option>
                <option value="Done">Done</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="dueDate" className="form-label">
                Due Date
                </label>
                <input
                type="date"
                id="dueDate"
                name="dueDate"
                className="form-control"
                value={task.dueDate}
                onChange={handleChange}
                required
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Add Task"}
            </button>

            {error && <p className="text-danger mt-2">{error}</p>}
        </form>
    </div>
  );
};

export default TaskForm;
