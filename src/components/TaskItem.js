import React from "react";
import clienticon from "../assets/Group 1.png";

const TaskItem = ({ task, handleCheckboxChange, moveToInProgressModal }) => {
  return (
    <li
      key={task.id}
      className="d-flex justify-content-between p-3 task-list-card"
    >
      <div>
        {moveToInProgressModal && (
          <input
            type="checkbox"
            onChange={() => handleCheckboxChange(task.id, task.status)}
            checked={task.status === "In Progress"}
          />
        )}
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
              className={task.status === "Done" ? "bi bi-check" : "bi bi-dot"}
            ></i>{" "}
            {task.status}
          </span>
        </div>
        <div
          className={
            new Date(task.dueDate) < new Date() && task.status !== "Done"
              ? "text-white deadline-missed bg-danger rounded p-2"
              : `text-dark ${
                  task.status === "Done" ? "text-decoration-line-through" : ""
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
  );
};

export default TaskItem;
