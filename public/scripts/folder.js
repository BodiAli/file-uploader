const dialog = document.querySelector("dialog");
const showModalButton = document.querySelector(".create-folder > button");
const closeModalButton = document.querySelector(".close-modal");
const dialogFile = document.querySelector("dialog.file-modal");
const showModalFileButton = document.querySelector(".create-file > button");
const closeModalFileButton = document.querySelector(".close-modal-file");

const dropBtns = document.querySelectorAll(".dropbtn");
const dropDowns = document.querySelectorAll(".dropdown-content");

const editFolderButtons = document.querySelectorAll(".folder-edit");
const editCloseModalButtons = document.querySelectorAll(".close-modal.edit");

const deleteFolderButtons = document.querySelectorAll(".folder-delete");
const deleteCloseModalButtons = document.querySelectorAll(".close-modal.delete");

const editFileButtons = document.querySelectorAll(".file-edit");
const editFileCloseModalButtons = document.querySelectorAll(".close-file-modal.edit");

const deleteFileButtons = document.querySelectorAll(".file-delete");
const deleteFileCloseModalButtons = document.querySelectorAll(".close-file-modal.delete");

showModalButton.addEventListener("click", () => {
  dialog.showModal();
});

closeModalButton.addEventListener("click", () => {
  dialog.close();
});

showModalFileButton.addEventListener("click", () => {
  dialogFile.showModal();
});

closeModalFileButton.addEventListener("click", () => {
  dialogFile.close();
});

dropBtns.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    let targetDropDown;
    if (button.dataset.fileid) {
      targetDropDown = document.querySelector(`.dropdown-content[data-fileid="${button.dataset.fileid}"]`);
    } else {
      targetDropDown = document.querySelector(
        `.dropdown-content[data-folderid="${button.dataset.folderid}"]`
      );
    }

    if (targetDropDown) {
      targetDropDown.classList.toggle("active");
    }

    dropDowns.forEach((dropDown) => {
      if (dropDown !== targetDropDown) {
        dropDown.classList.remove("active");
      }
    });
  });
});

document.addEventListener("click", () => {
  dropDowns.forEach((dropDown) => {
    dropDown.classList.remove("active");
  });
});

editFolderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(
      `.edit-folder-modal[data-folderid="${button.dataset.folderid}"]`
    );

    if (targetModal) {
      targetModal.showModal();
    }
  });
});

editCloseModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(
      `.edit-folder-modal[data-folderid="${button.dataset.folderid}"]`
    );

    if (targetModal) {
      targetModal.close();
    }
  });
});

deleteFolderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(
      `.delete-folder-modal[data-folderid="${button.dataset.folderid}"]`
    );

    if (targetModal) {
      targetModal.showModal();
    }
  });
});

deleteCloseModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(
      `.delete-folder-modal[data-folderid="${button.dataset.folderid}"]`
    );

    if (targetModal) {
      targetModal.close();
    }
  });
});

editFileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(`.edit-file-modal[data-fileid="${button.dataset.fileid}"]`);

    if (targetModal) {
      targetModal.showModal();
    }
  });
});

editFileCloseModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(`.edit-file-modal[data-fileid="${button.dataset.fileid}"]`);

    if (targetModal) {
      targetModal.close();
    }
  });
});

deleteFileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(`.delete-file-modal[data-fileid="${button.dataset.fileid}"]`);

    if (targetModal) {
      targetModal.showModal();
    }
  });
});

deleteFileCloseModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetModal = document.querySelector(`.delete-file-modal[data-fileid="${button.dataset.fileid}"]`);

    if (targetModal) {
      targetModal.close();
    }
  });
});
