(() => {
  "use strict";

  const path = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("#")[0];
    if (href && href === path) {
      document.querySelectorAll(".nav a").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    }

    link.addEventListener("click", () => {
      document.querySelectorAll(".nav a").forEach((item) => item.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "page");
    });
  });

  // Make in-page gallery/category navigation feel intentional without
  // changing the existing markup or destination.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  // Give keyboard users a clear focus state without adding visual clutter.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    document.documentElement.classList.add("keyboard-nav");
  });
})();


(() => {
  const list = document.getElementById("activityList");
  if (!list) return;
  const load = async () => {
    try {
      const r = await fetch(`/api/activity?t=${Date.now()}`, {cache:"no-store"});
      if (!r.ok) return;
      const items = await r.json();
      list.innerHTML = items.length ? items.slice(0, 12).map(x => `
        <div class="activity-row"><span>${x.action === "join" ? "JOIN" : "LEAVE"}</span><b>@${String(x.participant).replace(/[<>]/g, "")}</b><small>${String(x.group).replace(/[<>]/g, "")}</small></div>`).join("") : `<div class="muted">No recent group activity.</div>`;
    } catch {}
  };
  load();
  setInterval(load, 5000);
})();
