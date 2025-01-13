import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import TaskItem from "./TaskItem";

const TaskList = ({ moveToInProgressModal }) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch tasks from the database
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
      setError(err);
    } finally{
      setLoading(false);
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

  const handleCheckboxChange = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === "In Progress" ? "Backlog" : "In Progress";

      // Update task status in the database
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
  
      if (error) throw error;
  
      // Update tasks in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating task:", err.message);
    }
  };  

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading tasks: {error.message}</p>
      ) : tasks.length > 0 ? (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              handleCheckboxChange={handleCheckboxChange}
              moveToInProgressModal={moveToInProgressModal}
            />
          ))}
        </ul>
      ) : (
        <p>No tasks available</p>
      )}
    </>
  );  
};

export default TaskList;
