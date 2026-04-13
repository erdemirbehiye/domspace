const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function setupSmoothScroll() {
  const links = $$("[data-scroll], .nav a[href^='#']");
  for (const a of links) {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = $(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    });
  }
}

function setupActiveNav() {
  const navLinks = $$("[data-nav]");
  const byId = new Map(
    navLinks
      .map((a) => {
        const id = (a.getAttribute("href") || "").replace("#", "");
        return [id, a];
      })
      .filter(([id]) => id)
  );

  const sections = ["landing", "content", "final"]
    .map((id) => $(`#${id}`))
    .filter(Boolean);

  const setCurrent = (id) => {
    for (const [k, a] of byId) a.setAttribute("aria-current", k === id ? "true" : "false");
  };

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    setCurrent("landing");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (!visible?.target?.id) return;
      setCurrent(visible.target.id);
    },
    {
      root: null,
      threshold: [0.2, 0.35, 0.5, 0.65],
    }
  );

  sections.forEach((s) => io.observe(s));
}

function setupReveal() {
  const revealEls = $$(".reveal");
  if (!revealEls.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    for (const el of revealEls) el.classList.add("is-visible");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => io.observe(el));
}

function setupThemeToggle() {
  const btn = $("#toggleTheme");
  if (!btn) return;

  const key = "domspace:theme";
  const apply = (theme) => {
    if (!theme) {
      document.documentElement.removeAttribute("data-theme");
      return;
    }
    document.documentElement.setAttribute("data-theme", theme);
  };

  const saved = localStorage.getItem(key);
  if (saved === "light" || saved === "dark") apply(saved);

  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = cur === "light" ? "dark" : "light";
    apply(next);
    localStorage.setItem(key, next);
  });
}

function setupScrollToNextCard() {
  const btn = $("#scrollToNext");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const cards = $$(".card");
    const y = window.scrollY;
    const next = cards.find((c) => c.getBoundingClientRect().top + window.scrollY > y + 120);
    (next || $("#landing") || document.body).scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  });
}

setupSmoothScroll();
setupActiveNav();
setupReveal();
setupThemeToggle();
setupScrollToNextCard();
