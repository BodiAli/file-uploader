const dialog = document.querySelector("dialog");
const showModalButton = document.querySelector(".share-folder > button");
const closeModalButton = document.querySelector(".close-modal");

showModalButton.addEventListener("click", () => {
  dialog.showModal();
});

closeModalButton.addEventListener("click", () => {
  dialog.close();
});
