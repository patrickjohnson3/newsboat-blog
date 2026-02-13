(() => {
  const listView = document.getElementById("listView");
  const sentinel = document.getElementById("sentinel");
  const countPill = document.getElementById("countPill");
  const statusText = document.getElementById("statusText");
  const backOnLeft = document.body?.dataset?.backOnLeft || "";
  const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

  if (!listView) return;

  const LAST_POST_KEY = "newsboat:last-post-path";
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

  const normalizePath = (url) => {
    try {
      const parsed = new URL(url, window.location.origin);
      const path = parsed.pathname.replace(/\/+$/, "");
      return path || "/";
    } catch {
      return null;
    }
  };

  const saveSelection = (row) => {
    if (!row) return;
    const link = row.querySelector("a");
    if (!link) return;
    const path = normalizePath(link.href);
    if (!path) return;
    sessionStorage.setItem(LAST_POST_KEY, path);
  };

  const restoreSelection = () => {
    const savedPath = sessionStorage.getItem(LAST_POST_KEY);
    if (!savedPath) return false;
    const rows = getRows();
    const index = rows.findIndex((row) => {
      const link = row.querySelector("a");
      if (!link) return false;
      return normalizePath(link.href) === savedPath;
    });
    if (index < 0) return false;
    selectedIndex = index;
    setActive(selectedIndex);
    return true;
  };

  const openSelected = () => {
    const rows = getRows();
    const row = rows[selectedIndex];
    if (!row) return;
    const link = row.querySelector("a");
    if (link) {
      saveSelection(row);
      window.location.href = link.href;
    }
  };

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
    if (["ArrowUp", "ArrowDown", "ArrowRight"].includes(key) || (key === "ArrowLeft" && backOnLeft === "history")) {
      event.preventDefault();
    }

    if (key === "ArrowUp") moveSelection(-1);
    if (key === "ArrowDown") moveSelection(1);
    if (key === "ArrowRight") openSelected();
    if (key === "ArrowLeft" && backOnLeft === "history") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
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

  if (!restoreSelection()) {
    setActive(selectedIndex);
  }
  updateCount();
  statusText.textContent = isTouch
    ? "Browsing posts."
    : "Browsing posts. Use Up / Down to move, Right to open.";
  document.addEventListener("keydown", handleKey);

  listView.addEventListener("click", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    const rows = getRows();
    const index = rows.indexOf(row);
    if (index >= 0 && index !== selectedIndex) {
      selectedIndex = index;
      setActive(selectedIndex);
    }
    saveSelection(row);

    // Keep native anchor behavior if a link was directly clicked.
    const clicked = event.target;
    if (clicked instanceof HTMLElement && clicked.closest("a")) return;

    const link = row.querySelector("a");
    if (link) {
      window.location.href = link.href;
    }
  });

  // On desktop, keep active highlight synced with mouse hover.
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
