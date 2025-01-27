const dialog = document.querySelector("dialog");
const showModalButton = document.querySelector(".create-folder > button");
const closeModalButton = document.querySelector(".close-modal");

const dropBtns = document.querySelectorAll(".dropbtn");
const dropDowns = document.querySelectorAll(".dropdown-content");

const editFolderButtons = document.querySelectorAll(".folder-edit");
const editCloseModalButtons = document.querySelectorAll(".close-modal.edit");

const deleteFolderButtons = document.querySelectorAll(".folder-delete");
const deleteCloseModalButtons = document.querySelectorAll(".close-modal.delete");

showModalButton.addEventListener("click", () => {
  dialog.showModal();
});

closeModalButton.addEventListener("click", () => {
  dialog.close();
});

dropBtns.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    const targetDropDown = document.querySelector(
      `.dropdown-content[data-folderid="${button.dataset.folderid}"]`
    );

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
