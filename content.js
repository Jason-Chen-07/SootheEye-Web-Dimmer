const STYLE_ID = "sootheve-night-style";
const PANEL_ATTR = "data-sootheve-panel";
const BUTTON_ATTR = "data-sootheve-original-btn";

const DEFAULT_SETTINGS = {
  enabled: true,
  darkness: "heavy",        // soft | normal | heavy
  imageComfort: "medium",   // low | medium | high
  originalPreviewSeconds: 5
};

const THEMES = {
  soft: {
    pageBg: "#0b0d10",
    surface: "#131820",
    surface2: "#1a2029",
    text: "#cfd5de",
    textSoft: "#a7b0bc",
    heading: "#dde3ea",
    border: "#28303a",
    link: "#8fb7ff"
  },
  normal: {
    pageBg: "#07090b",
    surface: "#10141a",
    surface2: "#171c24",
    text: "#c8ced7",
    textSoft: "#9ea7b3",
    heading: "#d8dee6",
    border: "#232b35",
    link: "#8cb5ff"
  },
  heavy: {
    pageBg: "#050607",
    surface: "#0d1014",
    surface2: "#12161c",
    text: "#c3c9d2",
    textSoft: "#98a1ad",
    heading: "#d5dbe3",
    border: "#222933",
    link: "#8eb8ff"
  }
};

const IMAGE_FILTERS = {
  low: "brightness(0.72) contrast(0.92) saturate(0.92)",
  medium: "brightness(0.58) contrast(0.90) saturate(0.88)",
  high: "brightness(0.45) contrast(0.88) saturate(0.82)"
};

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result);
    });
  });
}

function removeExistingStyle() {
  const oldStyle = document.getElementById(STYLE_ID);
  if (oldStyle) oldStyle.remove();
}

function injectStyle(settings) {
  removeExistingStyle();

  const theme = THEMES[settings.darkness] || THEMES.heavy;
  const imageFilter = IMAGE_FILTERS[settings.imageComfort] || IMAGE_FILTERS.medium;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      color-scheme: dark !important;
      --sootheve-page-bg: ${theme.pageBg};
      --sootheve-surface: ${theme.surface};
      --sootheve-surface-2: ${theme.surface2};
      --sootheve-text: ${theme.text};
      --sootheve-text-soft: ${theme.textSoft};
      --sootheve-heading: ${theme.heading};
      --sootheve-border: ${theme.border};
      --sootheve-link: ${theme.link};
      --sootheve-image-filter: ${imageFilter};
    }

    html, body {
      background: var(--sootheve-page-bg) !important;
      color: var(--sootheve-text) !important;
    }

    html {
      color-scheme: dark !important;
    }

    body,
    main, article, section, aside, nav, header, footer,
    div, form, dialog, table, thead, tbody, tr, td, th,
    pre, code, blockquote, details, summary,
    input, textarea, select, button {
      background-color: var(--sootheve-surface) !important;
      color: var(--sootheve-text) !important;
      border-color: var(--sootheve-border) !important;
      box-shadow: none !important;
    }

    h1, h2, h3, h4, h5, h6, strong, b {
      color: var(--sootheve-heading) !important;
    }

    p, span, li, dt, dd, label, small, em, time {
      color: var(--sootheve-text) !important;
    }

    a, a * {
      color: var(--sootheve-link) !important;
    }

    hr {
      border-color: var(--sootheve-border) !important;
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--sootheve-text-soft) !important;
    }

    img, picture img, video, canvas, svg {
      filter: var(--sootheve-image-filter) !important;
      transition: filter 0.2s ease;
    }

    img[data-sootheve-original="true"],
    picture img[data-sootheve-original="true"],
    video[data-sootheve-original="true"],
    canvas[data-sootheve-original="true"],
    svg[data-sootheve-original="true"] {
      filter: none !important;
    }

    [data-sootheve-panel="true"] {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      z-index: 2147483647 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 6px 8px !important;
      background: rgba(8, 10, 12, 0.86) !important;
      color: #d9dee5 !important;
      border: 1px solid #2a313b !important;
      border-radius: 10px !important;
      font-size: 12px !important;
      line-height: 1.2 !important;
      backdrop-filter: blur(6px) !important;
      max-width: 220px !important;
    }

    [data-sootheve-panel="true"] button {
      appearance: none !important;
      border: 1px solid #3a4451 !important;
      background: #151a21 !important;
      color: #dce3ea !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      cursor: pointer !important;
    }
  `;

  document.documentElement.appendChild(style);
}

function isLargeMedia(el) {
  if (!el || !el.getBoundingClientRect) return false;
  const rect = el.getBoundingClientRect();
  return rect.width >= 180 && rect.height >= 120;
}

function ensureAnchorWrapper(el) {
  const parent = el.parentElement;
  if (!parent) return null;

  const parentStyle = window.getComputedStyle(parent);
  if (parentStyle.position === "static") {
    parent.style.position = "relative";
  }
  return parent;
}

function removePanelFor(el) {
  if (!el || !el.parentElement) return;
  const panel = el.parentElement.querySelector(`[${PANEL_ATTR}="true"]`);
  if (panel) panel.remove();
}

function showOriginalTemporarily(el, seconds) {
  el.setAttribute("data-sootheve-original", "true");
  removePanelFor(el);

  window.setTimeout(() => {
    el.removeAttribute("data-sootheve-original");
    attachImagePanel(el, seconds);
  }, seconds * 1000);
}

function attachImagePanel(el, seconds) {
  if (!isLargeMedia(el)) return;
  if (!el.parentElement) return;
  if (el.parentElement.querySelector(`[${PANEL_ATTR}="true"]`)) return;

  const wrapper = ensureAnchorWrapper(el);
  if (!wrapper) return;

  const panel = document.createElement("div");
  panel.setAttribute(PANEL_ATTR, "true");
  panel.innerHTML = `
    <span>护眼模式已降低图片亮度</span>
    <button type="button">原彩 ${seconds} 秒</button>
  `;

  const btn = panel.querySelector("button");
  btn.setAttribute(BUTTON_ATTR, "true");
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showOriginalTemporarily(el, seconds);
  });

  wrapper.appendChild(panel);
}

function patchImages(settings) {
  const mediaList = document.querySelectorAll("img, video, canvas, svg");
  mediaList.forEach((el) => {
    if (isLargeMedia(el)) {
      attachImagePanel(el, settings.originalPreviewSeconds);
    }
  });
}

function clearPanels() {
  document.querySelectorAll(`[${PANEL_ATTR}="true"]`).forEach((el) => el.remove());
}

function disableMode() {
  removeExistingStyle();
  clearPanels();
}

async function applyMode() {
  const settings = await loadSettings();

  if (!settings.enabled) {
    disableMode();
    return;
  }

  injectStyle(settings);
  clearPanels();
  patchImages(settings);
}

let applyTimer = null;

function scheduleApply() {
  if (applyTimer) clearTimeout(applyTimer);
  applyTimer = setTimeout(() => {
    applyMode();
  }, 250);
}

applyMode();

const observer = new MutationObserver(() => {
  scheduleApply();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: false
});
