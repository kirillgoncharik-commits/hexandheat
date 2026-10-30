const dialogs = [...document.querySelectorAll("dialog")];
document.querySelectorAll("[data-open]").forEach(button => button.addEventListener("click", () => {
  document.querySelector(`#${button.dataset.open}`)?.showModal();
}));
dialogs.forEach(dialog => {
  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
});
document.querySelector("#reduce-toggle")?.addEventListener("change", event => {
  document.documentElement.classList.toggle("reduce-motion", event.target.checked);
  document.dispatchEvent(new CustomEvent("motion-policy", { detail: event.target.checked }));
});
