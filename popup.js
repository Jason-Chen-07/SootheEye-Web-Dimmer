const enabledEl = document.getElementById("enabled");
const darknessEl = document.getElementById("darkness");
const imageComfortEl = document.getElementById("imageComfort");
const originalPreviewSecondsEl = document.getElementById("originalPreviewSeconds");
const previewValueEl = document.getElementById("previewValue");

const DEFAULT_SETTINGS = {
  enabled: true,
  darkness: "heavy",
  imageComfort: "medium",
  originalPreviewSeconds: 5
};

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    enabledEl.checked = settings.enabled;
    darknessEl.value = settings.darkness;
    imageComfortEl.value = settings.imageComfort;
    originalPreviewSecondsEl.value = settings.originalPreviewSeconds;
    previewValueEl.textContent = settings.originalPreviewSeconds;
  });
}

function saveSettings() {
  const settings = {
    enabled: enabledEl.checked,
    darkness: darknessEl.value,
    imageComfort: imageComfortEl.value,
    originalPreviewSeconds: Number(originalPreviewSecondsEl.value)
  };

  previewValueEl.textContent = settings.originalPreviewSeconds;
  chrome.storage.sync.set(settings);
}

enabledEl.addEventListener("change", saveSettings);
darknessEl.addEventListener("change", saveSettings);
imageComfortEl.addEventListener("change", saveSettings);
originalPreviewSecondsEl.addEventListener("input", saveSettings);

loadSettings();
