import React from 'react';
import buttonimg from "../assets/Frame 1.png";
import trashicon from "../assets/Frame 1.svg";
import plusicon from "../assets/Frame 3.svg";
import TaskList from './TaskList';
import ModalManager from './ModalManager';
import { formatTime } from './helpers';

const Timer = ({
  startTimer,
  displayTime,
  loading,
  ipTasks,
  handleSelectedTask,
  selectedTask,
  handleDeleteTask,
  openModal,
  visibleModal,
  closeModal,
  handleSave,
  handleDone,
  stopTimer,
}) => {
  return (
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
            <ModalManager
              buttonContent={<img src={plusicon} />}
              modalTitle={"Move To In Progress"}
              isVisible={visibleModal === "moveToInProgress"}
              openModal={() => openModal("moveToInProgress")}
              closeModal={closeModal}
              onSave={() => handleSave("moveToInProgress")}
            >
              <TaskList moveToInProgressModal={true} />
            </ModalManager>
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
  );
};

export default Timer;