import React, { useState, useEffect, useRef } from "react";
import Modal from "./components/Modal";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import buttonimg from "./assets/Frame 1.png";
import trashicon from "./assets/Frame 1.svg";
import plusicon from "./assets/Frame 3.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { supabase } from "./supabaseClient";

function App() {
  const [visibleModal, setVisibleModal] = useState(null);
  const [ipTasks, setIpTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});

  const [time, setTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const startTimer = () => {
    if (loading) {
      alert("Please wait for the tasks to load.");
      return;
    }

    if (!Object.keys(selectedTask).length) {
      alert("Select at least one task to start the timer.");
      return;
    }
    
    if (timerRef.current) return; // Prevent multiple intervals
    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        setDisplayTime(newTime);
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Helper functions remain the same
  const formatLoggedTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  const addLoggedTime = (existingTime, newTime) => {
    const parseTime = (time) => {
      const [daysMatch, hoursMatch, minutesMatch] = [
        /(\d+)d/.exec(time),
        /(\d+)h/.exec(time),
        /(\d+)m/.exec(time),
      ];
      return {
        days: daysMatch ? parseInt(daysMatch[1]) : 0,
        hours: hoursMatch ? parseInt(hoursMatch[1]) : 0,
        minutes: minutesMatch ? parseInt(minutesMatch[1]) : 0,
      };
    };
  
    const { days: exDays, hours: exHours, minutes: exMinutes } = parseTime(existingTime);
    const { days: newDays, hours: newHours, minutes: newMinutes } = parseTime(newTime);
  
    let totalMinutes = exMinutes + newMinutes;
    let totalHours = exHours + newHours + Math.floor(totalMinutes / 60);
    let totalDays = exDays + newDays + Math.floor(totalHours / 24);
  
    totalMinutes %= 60;
    totalHours %= 24;
  
    const formattedTime = [];
    if (totalDays > 0) formattedTime.push(`${totalDays}d`);
    if (totalHours > 0 || totalDays > 0) formattedTime.push(`${totalHours}h`);
    formattedTime.push(`${totalMinutes}m`);
  
    return formattedTime.join(" ");
  };
  

  const openModal = (modalId) => setVisibleModal(modalId);
  const closeModal = () => setVisibleModal(null);

  const handleSave = (modalId) => {
    console.log(`Save clicked for ${modalId}`);
    closeModal(); // Close the modal after saving
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "In Progress");

      if (error) throw error;

      setIpTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedTask = (taskId) => {
    setSelectedTask((prevSelectedTask) => {
      const updatedState = {
        ...prevSelectedTask,
        [taskId]: !prevSelectedTask[taskId], // Toggle the value
      };
      return updatedState;
    });
  };
  
  const logTimeForTasks = async (selectedTaskIds, formattedLoggedTime) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, timeSpent")
        .in("id", selectedTaskIds); // Fetch time for multiple tasks
  
      if (error && error.code !== "PGRST116") {
        throw error; // Rethrow error if it's not "No rows returned"
      }
  
      const updates = (data || []).map((task) => {
        const existingTimeSpent = task.timeSpent || "0h 0m";
        const updatedTimeSpent = addLoggedTime(existingTimeSpent, formattedLoggedTime);
        return { id: task.id, timeSpent: updatedTimeSpent };
      });
  
      // Update the database with the new `timeSpent` for the selected tasks
      const { error: updateError } = await supabase.from("tasks").upsert(updates, {
        onConflict: ["id"], // Ensure upsert is specific to tasks
      });
  
      if (updateError) throw updateError;
  
      console.log("Time logged successfully for tasks:", updates);
    } catch (err) {
      console.error("Error logging time for tasks:", err.message);
    }
  };  

  const handleDone = async () => {
    try {
      const selectedTaskIds = Object.keys(selectedTask).filter(
        (taskId) => selectedTask[taskId]
      );
  
      if (selectedTaskIds.length === 0) {
        alert("Please select a task to mark as done.");
        return;
      }
  
      // Format the logged time into "Xh Ym" or "Xd Xh"
      const formattedLoggedTime = formatLoggedTime(time);
  
      setLoading(true);
  
      // Stop the timer and log time for selected tasks
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        await logTimeForTasks(selectedTaskIds, formattedLoggedTime);
      }
  
      // Mark tasks as "Done"
      const { error } = await supabase
        .from("tasks")
        .update({ status: "Done" })
        .in("id", selectedTaskIds);
  
      if (error) throw error;
  
      // Remove tasks from the in-progress state
      setIpTasks((prevTasks) =>
        prevTasks.filter((task) => !selectedTaskIds.includes(task.id))
      );
  
      // Reset the selected tasks state
      setSelectedTask({});
      setTime(0);
      console.log("Selected Task:", selectedTask); // Log the selected task here
    } catch (err) {
      console.error("Error marking tasks as done:", err.message);
    } finally {
      setLoading(false);
    }
  };     

  useEffect(() => {
    fetchTasks();
  }, [visibleModal]);

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "Backlog" })
        .eq("id", taskId);

      if (error) throw error;

      setIpTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      stopTimer();
    } catch (err) {
      console.error("Error deleting task:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xxl">
      <div className="row mt-4">
        <div className="col-md-6">
          <h1>Freelance Dashboard</h1>
          <div className="row mt-3">
            <div className="col-md-6">
              <div id="st_stp-btn">
                <img
                  src={buttonimg}
                  alt=""
                  onClick={() => startTimer()}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
            <div className="col-md-6 today-logged-time-box p-3">
              <p className="fs-4 color-theme-peach">Logged Time</p>
              <p id="logged-time">{formatTime(displayTime)}</p>
              <p className="fs-5">Today Tasks</p>
              <hr />
              {/* In Progress Tasks */}
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ul className="inp-tasks-list">
                  {ipTasks.length > 0 ? (
                    ipTasks.map((task) => (
                      <li key={task.id} className="row align-items-start mt-2">
                        <div className="col-md-8 d-flex align-items-center">
                          <input
                            type="checkbox"
                            className="inp-tasks-checkbox mx-2"
                            onChange={() => handleSelectedTask(task.id)}
                            checked={!!selectedTask[task.id]}
                          />
                          <label
                            htmlFor={`logging-tasks-${task.id}`}
                            className="logging-tasks-label"
                          >
                            {task.title}
                          </label>
                        </div>
                        <div className="col-md-4 d-flex justify-content-end">
                          <img
                            src={trashicon}
                            alt="Delete"
                            onClick={() => handleDeleteTask(task.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </li>
                    ))
                  ) : (
                    <p>No tasks in progress</p>
                  )}
                </ul>
              )}
              <div className="d-flex justify-content-between mt-3">
                <div className="col-md-4">
                  <button
                    type="button"
                    className="add-more-tasks-log-time"
                    onClick={() => openModal("moveToInProgress")}
                  >
                    <img src={plusicon} />
                  </button>
                  <Modal
                    title="Move To In Progress"
                    isVisible={visibleModal === "moveToInProgress"}
                    onClose={closeModal}
                    onSave={() => handleSave("moveToInProgress")}
                  >
                    <TaskList moveToInProgressModal={true} />
                  </Modal>
                </div>
                <div className="col-md-8 d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-theme-peach mx-2"
                    id="tasks-done"
                    onClick={() => handleDone()}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-theme-black"
                    id="tasks-time-stop"
                    onClick={stopTimer}
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6"></div>
      </div>
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="d-flex justify-content-between">
            <h1>Task List</h1>
            <button
              type="button"
              className="add-more-tasks-log-time"
              onClick={() => openModal("addMoreTasks")}
            >
              <img src={plusicon} />
            </button>
            <Modal
              title="Add Task"
              isVisible={visibleModal === "addMoreTasks"}
              onClose={closeModal}
              onSave={() => handleSave("addMoreTasks")}
            >
              <TaskForm />
            </Modal>
          </div>
          {/* Task List */}
          {loading ? <p>Loading...</p> : <TaskList />}
        </div>
      </div>
    </div>
  );
}

export default App;
