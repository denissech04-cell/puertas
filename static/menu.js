const dialogButtons = document.querySelectorAll("[data-open-dialog]");
const reduceMotionInput = document.querySelector("[data-reduce-motion]");

for (const button of dialogButtons) {
    if (!(button instanceof HTMLButtonElement)) {
        continue;
    }

    button.addEventListener("click", () => {
        const dialogId = button.dataset.openDialog;
        const dialog = dialogId ? document.getElementById(dialogId) : null;
        if (dialog instanceof HTMLDialogElement) {
            dialog.showModal();
        }
    });
}

if (reduceMotionInput instanceof HTMLInputElement) {
    reduceMotionInput.addEventListener("change", () => {
        document.body.classList.toggle("reduce-motion", reduceMotionInput.checked);
    });
}
