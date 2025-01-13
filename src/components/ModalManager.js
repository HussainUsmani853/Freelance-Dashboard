import React from 'react';
import Modal from './Modal';

const ModalManager = ({ buttonContent, modalTitle, isVisible, openModal, closeModal, onSave, children }) => {
  return (
    <>
      <button
        type="button"
        className="modal-button"
        onClick={openModal}
      >
        {buttonContent}
      </button>
      <Modal
        title={modalTitle || ""}
        isVisible={isVisible}
        onClose={closeModal}
        onSave={onSave}
      >
        {children}
      </Modal>
    </>
  );
};

export default ModalManager;