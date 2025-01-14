import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { formatLoggedTime, logTimeForTasks } from "./helpers";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import Timer from "./Timer";
import ModalManager from "./ModalManager";
import plusicon from "../assets/Frame 3.svg";

const TaskDashboard = () => {
  const [visibleModal, setVisibleModal] = useState(null);
  const [ipTasks, setIpTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});

  const [time, setTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const timerRef = useRef(null);

  const openModal = (modalId) => setVisibleModal(modalId);
  const closeModal = () => setVisibleModal(null);

  const handleSave = (modalId) => {
    console.log(`Save clicked for ${modalId}`);
    closeModal();
  };

  const startTimer = () => {
    if (loading) {
      alert("Please wait for the tasks to load.");
      return;
    }

    const selectedTaskIds = Object.keys(selectedTask).filter(
      (taskId) => selectedTask[taskId]
    );

    if (selectedTaskIds.length === 0) {
      alert("Select at least one task to start the timer.");
      return;
    }

    if (timerRef.current) return;
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
        [taskId]: !prevSelectedTask[taskId],
      };
      return updatedState;
    });

    stopTimer();
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

      const formattedLoggedTime = formatLoggedTime(time);

      setLoading(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        await logTimeForTasks(selectedTaskIds, formattedLoggedTime, supabase);
      }

      const { error } = await supabase
        .from("tasks")
        .update({ status: "Done" })
        .in("id", selectedTaskIds);

      if (error) throw error;

      setIpTasks((prevTasks) =>
        prevTasks.filter((task) => !selectedTaskIds.includes(task.id))
      );

      setSelectedTask({});
      setTime(0);
      console.log("Selected Task:", selectedTask);
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

      setSelectedTask((prevSelectedTasks) => {
        const newSelectedTasks = { ...prevSelectedTasks };
        delete newSelectedTasks[taskId];
        return newSelectedTasks;
      });

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
          <Timer
            startTimer={startTimer}
            displayTime={displayTime}
            loading={loading}
            ipTasks={ipTasks}
            handleSelectedTask={handleSelectedTask}
            selectedTask={selectedTask}
            handleDeleteTask={handleDeleteTask}
            openModal={openModal}
            visibleModal={visibleModal}
            closeModal={closeModal}
            handleSave={handleSave}
            handleDone={handleDone}
            stopTimer={stopTimer}
          />
        </div>
        <div className="col-md-6"></div>
      </div>
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="d-flex justify-content-between">
            <h1>Task List</h1>
            <ModalManager
              buttonContent={<img src={plusicon} />}
              modalTitle={"Add Task"}
              isVisible={visibleModal === "addMoreTasks"}
              openModal={() => openModal("addMoreTasks")}
              closeModal={closeModal}
              onSave={() => handleSave("addMoreTasks")}
            >
              <TaskForm />
            </ModalManager>
          </div>
          {loading ? <p>Loading...</p> : <TaskList />}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;
