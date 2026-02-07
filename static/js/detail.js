(() => {
  const statusText = document.getElementById("statusText");
  const detailBody = document.getElementById("detailBody");
  const listUrl = document.body?.dataset?.listUrl || "/";

  if (statusText) {
    statusText.textContent = "Reading. Use Up / Down to scroll, Left to return.";
  }

  const handleKey = (event) => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft"].includes(key)) {
      event.preventDefault();
    }

    if (key === "ArrowLeft") {
      window.location.href = listUrl;
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
