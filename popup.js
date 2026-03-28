const enabledEl = document.getElementById("enabled");
const modeEl = document.getElementById("mode");
const thresholdEl = document.getElementById("threshold");
const thresholdValueEl = document.getElementById("thresholdValue");

const DEFAULT_SETTINGS = {
  enabled: true,
  threshold: 6,
  mode: "auto",
};

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    enabledEl.checked = settings.enabled;
    modeEl.value = settings.mode;
    thresholdEl.value = settings.threshold;
    thresholdValueEl.textContent = settings.threshold;
  });
}

function saveSettings() {
  const settings = {
    enabled: enabledEl.checked,
    mode: modeEl.value,
    threshold: Number(thresholdEl.value),
  };

  thresholdValueEl.textContent = settings.threshold;

  chrome.storage.sync.set(settings);
}

enabledEl.addEventListener("change", saveSettings);
modeEl.addEventListener("change", saveSettings);
thresholdEl.addEventListener("input", saveSettings);

loadSettings();
