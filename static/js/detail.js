(() => {
  const statusText = document.getElementById("statusText");
  const detailBody = document.getElementById("detailBody");
  const listUrl = document.body?.dataset?.listUrl || "/";

  if (statusText) {
    statusText.textContent = "Reading. Use Up / Down to scroll, Left to return.";
  }

  const shouldIgnoreKeyEvent = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return true;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  };

  const handleKey = (event) => {
    if (shouldIgnoreKeyEvent(event)) return;
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft"].includes(key)) {
      event.preventDefault();
    }

    if (key === "ArrowLeft") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = listUrl;
      }
    }
    if (key === "ArrowUp") {
      if (!detailBody) return;
      detailBody.scrollBy({ top: -120, behavior: "smooth" });
    }
    if (key === "ArrowDown") {
      if (!detailBody) return;
      detailBody.scrollBy({ top: 120, behavior: "smooth" });
    }
  };

  document.addEventListener("keydown", handleKey);
})();
