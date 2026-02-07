(() => {
  const listView = document.getElementById("listView");
  const sentinel = document.getElementById("sentinel");
  const countPill = document.getElementById("countPill");
  const statusText = document.getElementById("statusText");

  if (!listView) return;

  let selectedIndex = 0;
  let loading = false;
  let buffer = [];

  const getRows = () => Array.from(listView.querySelectorAll(".row"));

  const setActive = (index) => {
    const rows = getRows();
    rows.forEach((row, i) => row.classList.toggle("active", i === index));
    if (rows[index]) rows[index].scrollIntoView({ block: "nearest" });
  };

  const moveSelection = (delta) => {
    const rows = getRows();
    const next = Math.min(rows.length - 1, Math.max(0, selectedIndex + delta));
    if (next !== selectedIndex) {
      selectedIndex = next;
      setActive(selectedIndex);
    }
  };

  const openSelected = () => {
    const rows = getRows();
    const row = rows[selectedIndex];
    if (!row) return;
    const link = row.querySelector("a");
    if (link) window.location.href = link.href;
  };

  const handleKey = (event) => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowRight"].includes(key)) {
      event.preventDefault();
    }

    if (key === "ArrowUp") moveSelection(-1);
    if (key === "ArrowDown") moveSelection(1);
    if (key === "ArrowRight") openSelected();
  };

  const updateCount = () => {
    const total = listView.dataset.total;
    if (total) {
      countPill.textContent = `${total} posts`;
    } else {
      const rows = getRows();
      countPill.textContent = `${rows.length} posts`;
    }
  };

  setActive(selectedIndex);
  updateCount();
  statusText.textContent = "Browsing posts. Use Up / Down to move, Right to open.";
  document.addEventListener("keydown", handleKey);

  listView.addEventListener("mousemove", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    const rows = getRows();
    const index = rows.indexOf(row);
    if (index >= 0 && index !== selectedIndex) {
      selectedIndex = index;
      setActive(selectedIndex);
    }
  });

  const batchSize = () => {
    const rows = getRows();
    if (!rows.length) return 1;
    const rowHeight = rows[0].getBoundingClientRect().height || 18;
    return Math.max(1, Math.floor(listView.clientHeight / rowHeight));
  };

  const appendBatch = () => {
    const count = batchSize();
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count && buffer.length; i += 1) {
      fragment.appendChild(buffer.shift());
    }
    listView.insertBefore(fragment, sentinel);
    updateCount();
  };

  const loadNextPage = async () => {
    if (loading) return;
    const nextUrl = listView.dataset.next;
    if (!nextUrl) return;
    loading = true;
    try {
      const res = await fetch(nextUrl);
      if (!res.ok) return;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const nextList = doc.getElementById("listView");
      if (!nextList) return;
      const rows = Array.from(nextList.querySelectorAll(".row"));
      buffer.push(...rows);
      listView.dataset.next = nextList.dataset.next || "";
      appendBatch();
    } finally {
      loading = false;
    }
  };

  if (sentinel) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        if (!buffer.length) {
          loadNextPage();
        } else {
          appendBatch();
        }
      }
    }, { root: listView, threshold: 0.1 });
    observer.observe(sentinel);
  }
})();
