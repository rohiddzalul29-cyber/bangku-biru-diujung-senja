(function () {
  "use strict";

  /* ---------- SVG ornament snippets ---------- */
  const ORN_TOP = `<svg viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 15 C 14 4, 22 26, 30 15 C 38 4, 46 26, 58 15" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="30" cy="15" r="3" fill="currentColor"/>
  </svg>`;

  const ORN_END = `<svg viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20 C 14 6, 24 6, 30 16 C 36 6, 46 6, 56 20" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="30" cy="16" r="2.4" fill="currentColor"/>
  </svg>`;

  const ORN_BOOKEND = `<svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 30 C 25 8, 38 8, 50 24 C 62 8, 75 8, 95 30" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="50" cy="24" r="3.4" fill="currentColor"/>
    <path d="M20 38 C 35 30, 65 30, 80 38" stroke="currentColor" stroke-width="1"/>
  </svg>`;

  const DIAMOND = `<svg viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 0 L10 5 L5 10 L0 5 Z"/></svg>`;

  /* ---------- State ---------- */
  let currentChapterIndex = 0;
  const totalChapters = NOVEL_DATA.length;

  const coverScene = document.getElementById("cover-scene");
  const tocScene = document.getElementById("toc-scene");
  const readingScene = document.getElementById("reading-scene");
  const tocList = document.getElementById("toc-list");
  const pageSheet = document.getElementById("page-sheet");
  const readScroll = document.getElementById("read-scroll");
  const readTopbarTitle = document.getElementById("read-topbar-title");
  const sunDot = document.getElementById("sun-dot");
  const progressFill = document.getElementById("progress-fill");
  const chapterFab = document.getElementById("chapter-fab");
  const btnPrevChapter = document.getElementById("btn-prev-chapter");
  const btnNextChapter = document.getElementById("btn-next-chapter");
  const btnToc = document.getElementById("btn-toc");

  /* ---------- Build Table of Contents ---------- */
  function buildTOC() {
    const frag = document.createDocumentFragment();
    NOVEL_DATA.forEach((ch, idx) => {
      const item = document.createElement("button");
      item.className = "toc-item";
      item.setAttribute("type", "button");
      item.innerHTML = `
        <span class="toc-num">${String(idx + 1).padStart(2, "0")}</span>
        <span class="toc-text">
          <span class="toc-label">${ch.label}</span>
          <span class="toc-subtitle">${ch.subtitle}</span>
        </span>
        <span class="toc-arrow">&#8594;</span>
      `;
      item.addEventListener("click", () => openChapter(idx));
      frag.appendChild(item);
    });
    tocList.appendChild(frag);
  }

  const ICON_PREV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  const ICON_NEXT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  /* ---------- Build prev/next inline navigation for bottom of a chapter ---------- */
  function renderPageNavHTML(idx) {
    const hasPrev = idx > 0;
    const hasNext = idx < totalChapters - 1;

    const prevHTML = hasPrev
      ? `
      <button class="pagenav-btn is-prev" type="button" data-nav="prev">
        <span class="pagenav-icon">${ICON_PREV}</span>
        <span class="pagenav-text">
          <span class="pagenav-eyebrow">Sebelumnya</span>
          <span class="pagenav-label">${NOVEL_DATA[idx - 1].label}</span>
        </span>
      </button>
    `
      : `
      <span class="pagenav-btn is-prev is-disabled">
        <span class="pagenav-icon">${ICON_PREV}</span>
        <span class="pagenav-text">
          <span class="pagenav-eyebrow">Awal</span>
          <span class="pagenav-label">Cerita Dimulai</span>
        </span>
      </span>
    `;

    const nextHTML = hasNext
      ? `
      <button class="pagenav-btn is-next" type="button" data-nav="next">
        <span class="pagenav-icon">${ICON_NEXT}</span>
        <span class="pagenav-text">
          <span class="pagenav-eyebrow">Selanjutnya</span>
          <span class="pagenav-label">${NOVEL_DATA[idx + 1].label}</span>
        </span>
      </button>
    `
      : `
      <span class="pagenav-btn is-next is-disabled">
        <span class="pagenav-icon">${ICON_NEXT}</span>
        <span class="pagenav-text">
          <span class="pagenav-eyebrow">Akhir</span>
          <span class="pagenav-label">Tamat</span>
        </span>
      </span>
    `;

    return `<div class="chapter-pagenav">${prevHTML}${nextHTML}</div>`;
  }

  /* ---------- Build a single chapter's HTML ---------- */
  function renderChapterHTML(ch, idx) {
    let bodyHTML = "";
    ch.paragraphs.forEach((block) => {
      if (block.type === "break") {
        bodyHTML += `<div class="scene-break">${DIAMOND}</div>`;
      } else {
        bodyHTML += `<p>${block.text}</p>`;
      }
    });

    const isLast = idx === totalChapters - 1;

    let html = `
      <div class="chapter-block" data-chapter-index="${idx}" id="chapter-${idx}">
        <div class="chapter-ornament-top">${ORN_TOP}</div>
        <div class="chapter-label">${ch.label}</div>
        <h2 class="chapter-title">${ch.subtitle}</h2>
        <div class="chapter-divider"></div>
        <div class="chapter-body">${bodyHTML}</div>
        <div class="chapter-end-mark">${ORN_END}</div>
        ${renderPageNavHTML(idx)}
      </div>
    `;

    if (isLast) {
      html += `
        <div class="book-end">
          <div class="book-end-orn">${ORN_BOOKEND}</div>
          <div class="book-end-title">Tamat</div>
          <div class="book-end-sub">Bangku Biru di Ujung Senja &mdash; Rohid Dzalul</div>
          <button class="book-end-btn" id="btn-back-to-toc-end" type="button">Kembali ke Daftar Isi</button>
        </div>
      `;
    }
    return html;
  }

  /* ---------- Open a chapter for reading ---------- */
  function openChapter(idx, fromTocClick) {
    currentChapterIndex = idx;
    pageSheet.innerHTML = renderChapterHTML(NOVEL_DATA[idx], idx);
    readTopbarTitle.textContent =
      NOVEL_DATA[idx].label + " \u2014 " + NOVEL_DATA[idx].subtitle;

    const endBtn = document.getElementById("btn-back-to-toc-end");
    if (endBtn) {
      endBtn.addEventListener("click", goToTOC);
    }

    const prevBtn = pageSheet.querySelector('[data-nav="prev"]');
    if (prevBtn) {
      prevBtn.addEventListener("click", () =>
        openChapter(currentChapterIndex - 1),
      );
    }
    const nextBtn = pageSheet.querySelector('[data-nav="next"]');
    if (nextBtn) {
      nextBtn.addEventListener("click", () =>
        openChapter(currentChapterIndex + 1),
      );
    }

    showScene("reading");
    readScroll.scrollTop = 0;
    updateSunAndProgress();
    updateFabVisibility();
  }

  /* ---------- Scene transitions ---------- */
  function showScene(name) {
    coverScene.classList.toggle("leaving", name !== "cover");
    tocScene.classList.toggle("active", name === "toc");
    readingScene.classList.toggle("active", name === "reading");
    if (name !== "cover") {
      document.body.classList.add("scroll-enabled");
    }
  }

  function goToTOC() {
    showScene("toc");
  }

  function openFromCover() {
    showScene("toc");
  }

  /* ---------- Sun progress indicator + scroll progress bar ---------- */
  function updateSunAndProgress() {
    const scrollTop = readScroll.scrollTop;
    const scrollH = readScroll.scrollHeight - readScroll.clientHeight;
    const ratio =
      scrollH > 0 ? Math.min(1, Math.max(0, scrollTop / scrollH)) : 0;

    progressFill.style.width = ratio * 100 + "%";

    // sun moves from top (80% -> rises) to bottom (sets) as ratio goes 0 -> 1
    // at ratio 0: sun high in sky (top: 15%) glowing bright
    // at ratio 1: sun set below horizon (top: 92%) deep orange/red
    const topPos = 15 + ratio * 77; // 15% -> 92%
    sunDot.style.top = topPos + "%";

    // color shift: bright gold -> deep dusk orange/red
    const startColor = [232, 196, 104]; // gold-light
    const endColor = [184, 69, 47]; // dusk-3
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
    sunDot.style.background = `radial-gradient(circle, rgb(${r},${g},${b}), rgb(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(0, b - 20)}))`;
  }

  function updateFabVisibility() {
    // show fab once user scrolls a bit, to allow chapter jump
    btnPrevChapter.style.visibility =
      currentChapterIndex === 0 ? "hidden" : "visible";
    btnNextChapter.style.visibility =
      currentChapterIndex === totalChapters - 1 ? "hidden" : "visible";
  }

  let fabTimer = null;
  function handleReadScroll() {
    updateSunAndProgress();
    chapterFab.classList.add("show");
    clearTimeout(fabTimer);
    fabTimer = setTimeout(() => {
      chapterFab.classList.remove("show");
    }, 1800);
  }

  /* ---------- Event bindings ---------- */
  coverScene.addEventListener("click", openFromCover);
  coverScene.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFromCover();
    }
  });

  btnToc.addEventListener("click", goToTOC);

  btnPrevChapter.addEventListener("click", () => {
    if (currentChapterIndex > 0) openChapter(currentChapterIndex - 1);
  });
  btnNextChapter.addEventListener("click", () => {
    if (currentChapterIndex < totalChapters - 1)
      openChapter(currentChapterIndex + 1);
  });

  readScroll.addEventListener("scroll", handleReadScroll, { passive: true });

  /* ---------- Init ---------- */
  buildTOC();
})();
