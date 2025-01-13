import React from 'react';
import Modal from './Modal';
import TaskList from './TaskList';

const Timer = ({
  buttonimg,
  startTimer,
  formatTime,
  displayTime,
  loading,
  ipTasks,
  handleSelectedTask,
  selectedTask,
  trashicon,
  handleDeleteTask,
  plusicon,
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
  );
};

export default Timer;