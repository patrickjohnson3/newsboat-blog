(() => {
  const statusText = document.getElementById("statusText");
  const detailBody = document.getElementById("detailBody");

  if (statusText) {
    statusText.textContent = "Reading. Use Up / Down to scroll, Left to return.";
  }

  const handleKey = (event) => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft"].includes(key)) {
      event.preventDefault();
    }

    if (key === "ArrowLeft") {
      window.location.href = "/";
    }
    if (key === "ArrowUp") {
      detailBody.scrollBy({ top: -120, behavior: "smooth" });
    }
    if (key === "ArrowDown") {
      detailBody.scrollBy({ top: 120, behavior: "smooth" });
    }
  };

  document.addEventListener("keydown", handleKey);
})();
