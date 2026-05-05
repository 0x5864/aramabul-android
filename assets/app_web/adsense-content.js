(function () {
  "use strict";

  const CONTENT_BY_PAGE = {
  };

  function pageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function addStyle() {
    if (document.getElementById("publisher-content-style")) return;
    const style = document.createElement("style");
    style.id = "publisher-content-style";
    style.textContent = `
      .publisher-content-card {
        margin: 28px 0 24px;
        padding: 24px;
        border: 1px solid rgba(9, 34, 54, 0.14);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.78);
        box-shadow: 0 12px 34px rgba(9, 34, 54, 0.07);
      }
      .publisher-content-card h2 {
        margin: 0 0 12px;
        color: var(--ink, #10283d);
        font-size: clamp(1.35rem, 2.4vw, 2rem);
        line-height: 1.2;
      }
      .publisher-content-card p,
      .publisher-content-card li {
        color: rgba(16, 40, 61, 0.82);
        font-size: 1rem;
        line-height: 1.7;
      }
      .publisher-content-card p { margin: 0 0 16px; }
      .publisher-content-card ul { margin: 0; padding-left: 1.2rem; }
      .publisher-content-card li + li { margin-top: 8px; }
    `;
    document.head.appendChild(style);
  }

  function createCard(content) {
    const section = document.createElement("section");
    section.className = "publisher-content-card";
    section.setAttribute("aria-label", "Sayfa rehberi");

    const title = document.createElement("h2");
    title.textContent = content.title;
    section.appendChild(title);

    const intro = document.createElement("p");
    intro.textContent = content.intro;
    section.appendChild(intro);

    const list = document.createElement("ul");
    content.bullets.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    section.appendChild(list);

    return section;
  }

  function insertContent() {
    const content = CONTENT_BY_PAGE[pageName()];
    if (!content || document.querySelector(".publisher-content-card")) return;

    const main = document.querySelector("main");
    if (!main) return;

    addStyle();
    const card = createCard(content);
    const anchor =
      main.querySelector(".category-grid, .category-group-grid, .hero-grid, .home-category-grid, [data-category-grid]") ||
      main.firstElementChild;

    if (anchor && anchor.parentElement) {
      anchor.parentElement.insertBefore(card, anchor);
    } else {
      main.appendChild(card);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertContent, { once: true });
  } else {
    insertContent();
  }
})();
