const STYLE_ID = "smart-bright-dark-style";

const DEFAULT_SETTINGS = {
  enabled: true,
  threshold: 6,
  mode: "auto", // auto | always | off
};

function parseRgb(color) {
  if (!color) return null;

  // rgb(255, 255, 255) / rgba(255,255,255,1)
  const match = color.match(/\d+(\.\d+)?/g);
  if (!match || match.length < 3) return null;

  return {
    r: Number(match[0]),
    g: Number(match[1]),
    b: Number(match[2]),
  };
}

function luminance({ r, g, b }) {
  const arr = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * arr[0] + 0.7152 * arr[1] + 0.0722 * arr[2];
}

function isLightColor(color) {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  return luminance(rgb) > 0.8;
}

function isDarkColor(color) {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  return luminance(rgb) < 0.25;
}

function getStyleColor(el, prop) {
  if (!el) return null;
  return getComputedStyle(el)[prop];
}

function scorePageBrightness() {
  let score = 0;

  const htmlBg = getStyleColor(document.documentElement, "backgroundColor");
  const bodyBg = getStyleColor(document.body, "backgroundColor");
  const bodyText = getStyleColor(document.body, "color");

  if (htmlBg && isLightColor(htmlBg)) score += 2;
  if (bodyBg && isLightColor(bodyBg)) score += 3;
  if (bodyText && isDarkColor(bodyText)) score += 2;

  const sampleEls = Array.from(
    document.querySelectorAll("main, article, section, div, header, footer")
  ).slice(0, 100);

  let checked = 0;
  let lightCount = 0;

  for (const el of sampleEls) {
    const rect = el.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 80) continue;

    const bg = getComputedStyle(el).backgroundColor;
    checked += 1;
    if (isLightColor(bg)) lightCount += 1;
  }

  if (checked > 0) {
    const ratio = lightCount / checked;
    if (ratio > 0.5) score += 3;
    if (ratio > 0.75) score += 2;
  }

  return score;
}

function removeDarkMode() {
  const oldStyle = document.getElementById(STYLE_ID);
  if (oldStyle) oldStyle.remove();
}

function applyDarkMode() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;

  style.textContent = `
    :root {
      color-scheme: dark;
      --ext-bg: #15171a;
      --ext-bg-soft: #1d2127;
      --ext-card: #232831;
      --ext-text: #f2f4f8;
      --ext-text-soft: #c8d0da;
      --ext-border: #353c48;
      --ext-link: #7ab7ff;
      --ext-highlight: #2b3340;
    }

    html, body {
      background: var(--ext-bg) !important;
      color: var(--ext-text) !important;
    }

    body, main, article, section, header, footer, nav, aside, div {
      border-color: var(--ext-border) !important;
    }

    main, article, section, header, footer, nav, aside {
      background: transparent !important;
    }

    p, span, li, label, td, th, h1, h2, h3, h4, h5, h6 {
      color: var(--ext-text) !important;
    }

    a {
      color: var(--ext-link) !important;
    }

    pre, code, blockquote,
    [class*="card"], [class*="panel"], [class*="container"] {
      background: var(--ext-bg-soft) !important;
      color: var(--ext-text) !important;
      border-color: var(--ext-border) !important;
    }

    input, textarea, select, button {
      background: var(--ext-card) !important;
      color: var(--ext-text) !important;
      border: 1px solid var(--ext-border) !important;
    }

    img, video, canvas, svg, picture {
      filter: none !important;
    }

    ::selection {
      background: var(--ext-highlight) !important;
      color: var(--ext-text) !important;
    }
  `;

  document.documentElement.appendChild(style);
}

function evaluate(settings) {
  if (!settings.enabled || settings.mode === "off") {
    removeDarkMode();
    return;
  }

  if (settings.mode === "always") {
    applyDarkMode();
    return;
  }

  const score = scorePageBrightness();
  console.log("[SmartDark] score =", score);

  if (score >= settings.threshold) {
    applyDarkMode();
  } else {
    removeDarkMode();
  }
}

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result);
    });
  });
}

async function init() {
  const settings = await loadSettings();
  evaluate(settings);
}

init();

const observer = new MutationObserver(async () => {
  const settings = await loadSettings();
  evaluate(settings);
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
});
