// Ghostty Configurator - Frontend Application
// Vanilla JS, no frameworks, no build step.

const CATEGORIES = {
  font: {
    title: "Font",
    description: "Configure font family, size, and rendering options",
    settings: [
      { key: "font-family", label: "Font Family", type: "text", desc: "Primary font family for the terminal. Can specify multiple fallback fonts for better glyph coverage across languages." },
      { key: "font-family-bold", label: "Bold Font Family", type: "text", desc: "Font family to use for bold text. If not set, stylistic variants of the regular font are used." },
      { key: "font-family-italic", label: "Italic Font Family", type: "text", desc: "Font family to use for italic text. Falls back to regular font if not specified." },
      { key: "font-family-bold-italic", label: "Bold Italic Font Family", type: "text", desc: "Font family to use for bold italic text. Falls back to regular font if not specified." },
      { key: "font-size", label: "Font Size", type: "number", min: 6, max: 72, desc: "Font size in points. Supports non-integer values for precise sizing on high-DPI displays." },
      { key: "font-style", label: "Font Style", type: "text", desc: "Named font style to use for regular text, based on the font's advertised style names." },
      { key: "font-style-bold", label: "Bold Font Style", type: "text", desc: "Named style for bold text. Can be set to false to disable bold styling entirely." },
      { key: "font-style-italic", label: "Italic Font Style", type: "text", desc: "Named style for italic text. Can be set to false to disable italic styling." },
      { key: "font-thicken", label: "Font Thicken", type: "boolean", desc: "Thicken font strokes for better visibility, especially on high-DPI displays." },
      { key: "font-synthetic-style", label: "Synthetic Style", type: "text", desc: "Control synthetic generation of bold, italic, and bold-italic when not available in the font natively." },
    ]
  },
  colors: {
    title: "Colors & Theme",
    description: "Customize colors and select a theme",
    settings: [
      { key: "theme", label: "Theme", type: "theme", desc: "Apply a built-in or custom theme. Supports light/dark mode switching with syntax like light:theme,dark:theme." },
      { key: "background", label: "Background", type: "color", desc: "Background color for the window, specified as hex or named X11 color." },
      { key: "foreground", label: "Foreground", type: "color", desc: "Foreground text color for the window, specified as hex or named X11 color." },
      { key: "selection-foreground", label: "Selection Foreground", type: "color", desc: "Text color within selected regions. Can match cell foreground/background or use custom colors." },
      { key: "selection-background", label: "Selection Background", type: "color", desc: "Background color for selected text. Defaults to inverted window colors if not set." },
      { key: "cursor-color", label: "Cursor Color", type: "color", desc: "Color of the cursor. Can match cell foreground/background or use a direct color value." },
      { key: "cursor-text", label: "Cursor Text Color", type: "color", desc: "Color of text under the cursor. Can match cell colors or use a custom color." },
      { key: "minimum-contrast", label: "Minimum Contrast", type: "number", min: 1, max: 21, step: 0.5, desc: "Minimum WCAG contrast ratio (1\u201321) between foreground and background to ensure text readability." },
      { key: "background-opacity", label: "Background Opacity", type: "number", min: 0, max: 1, step: 0.05, desc: "Window background opacity from 0 (transparent) to 1 (opaque). On macOS requires full restart." },
    ]
  },
  cursor: {
    title: "Cursor",
    description: "Cursor appearance and behavior",
    settings: [
      { key: "cursor-style", label: "Cursor Style", type: "enum", options: ["block", "bar", "underline"], desc: "Cursor appearance: block, bar, or underline. Programs can override via escape sequences." },
      { key: "cursor-style-blink", label: "Cursor Blink", type: "boolean", desc: "Default blinking state of the cursor. Can be true, false, or unset to respect DEC Mode 12." },
      { key: "cursor-opacity", label: "Cursor Opacity", type: "number", min: 0, max: 1, step: 0.05, desc: "Cursor opacity level from 0 (transparent) to 1 (opaque)." },
      { key: "cursor-click-to-move", label: "Click to Move", type: "boolean", desc: "Enable moving cursor at shell prompts by clicking. Requires shell integration with prompt marking." },
    ]
  },
  window: {
    title: "Window",
    description: "Window size, padding, and appearance",
    settings: [
      { key: "window-padding-x", label: "Padding X", type: "number", min: 0, max: 100, desc: "Horizontal padding in points between terminal cells and window borders. Supports separate left/right values." },
      { key: "window-padding-y", label: "Padding Y", type: "number", min: 0, max: 100, desc: "Vertical padding in points between terminal cells and window borders. Supports separate top/bottom values." },
      { key: "window-padding-balance", label: "Padding Balance", type: "boolean", desc: "Automatically balance extra padding across all edges to minimize visual imbalance." },
      { key: "window-padding-color", label: "Padding Color", type: "text", desc: "Color of padding area: background, extend, or extend-always." },
      { key: "window-decoration", label: "Window Decoration", type: "enum", options: ["auto", "client", "server", "none"], desc: "Window decoration preference. System may override this preference." },
      { key: "window-theme", label: "Window Theme", type: "enum", options: ["auto", "system", "dark", "light", "ghostty"], desc: "Window theme preference for title bar and frame appearance." },
      { key: "window-height", label: "Window Height", type: "number", min: 0, desc: "Initial window height in terminal grid cells. Must be paired with window-width to take effect." },
      { key: "window-width", label: "Window Width", type: "number", min: 0, desc: "Initial window width in terminal grid cells. Must be paired with window-height to take effect." },
      { key: "maximize", label: "Maximize", type: "boolean", desc: "Start new windows in maximized state instead of normal windowed mode." },
      { key: "fullscreen", label: "Fullscreen", type: "boolean", desc: "Start windows in fullscreen with options for native or non-native modes on macOS." },
      { key: "window-save-state", label: "Save State", type: "text", desc: "Save and restore window state (position, size, tabs, splits) on exit. Values: default, never, always. macOS only." },
      { key: "window-show-tab-bar", label: "Show Tab Bar", type: "enum", options: ["auto", "always", "never"], desc: "Control tab bar visibility: always, auto (show when 2+ tabs), or never." },
    ]
  },
  mouse: {
    title: "Mouse & Input",
    description: "Mouse behavior and input settings",
    settings: [
      { key: "mouse-hide-while-typing", label: "Hide While Typing", type: "boolean", desc: "Automatically hide the mouse pointer when typing, reappear on mouse use." },
      { key: "mouse-shift-capture", label: "Shift Capture", type: "boolean", desc: "Determine if running programs detect shift key with mouse clicks." },
      { key: "mouse-reporting", label: "Mouse Reporting", type: "boolean", desc: "Enable or disable mouse event reporting to terminal applications." },
      { key: "mouse-scroll-multiplier", label: "Scroll Multiplier", type: "text", desc: "Multiplier for mouse wheel scrolling distance. Supports precision: and discrete: prefixes for device types." },
      { key: "scroll-to-bottom", label: "Scroll to Bottom", type: "text", desc: "When to auto-scroll to bottom: keystroke, output, or combinations with comma-separated options." },
    ]
  },
  scrollback: {
    title: "Scrollback",
    description: "Scrollback buffer and scrollbar settings",
    settings: [
      { key: "scrollback-limit", label: "Scrollback Limit", type: "number", min: 0, desc: "Maximum scrollback buffer size in bytes. Older lines are discarded when limit reached." },
      { key: "scrollbar", label: "Scrollbar", type: "enum", options: ["system", "none", "auto"], desc: "Scrollbar visibility: system (respect OS settings) or never (hide but allow scrolling)." },
    ]
  },
  advanced: {
    title: "Advanced",
    description: "Advanced shell and behavior settings",
    settings: [
      { key: "command", label: "Shell Command", type: "text", desc: "Shell command to execute in new terminal surfaces. Supports direct: or shell: prefixes to control argument parsing." },
      { key: "working-directory", label: "Working Directory", type: "text", desc: "Directory to change to after starting. Values: absolute path, ~/path, home, or inherit." },
      { key: "link-url", label: "Clickable URLs", type: "boolean", desc: "Enable URL pattern matching and opening with system default application via Ctrl/Cmd+click." },
      { key: "link-previews", label: "Link Previews", type: "boolean", desc: "Show preview tooltips for matched links. Options: true, false, or osc8 (OSC 8 hyperlinks only)." },
      { key: "wait-after-command", label: "Wait After Command", type: "boolean", desc: "Keep terminal open after command exits, waiting for a keypress before closing." },
      { key: "abnormal-command-exit-runtime", label: "Abnormal Exit Runtime (ms)", type: "number", min: 0, desc: "Milliseconds threshold below which process exit is considered abnormal and triggers error message." },
      { key: "auto-update-channel", label: "Auto Update Channel", type: "text", desc: "Channel for automatic updates. Leave empty to use default." },
    ]
  }
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  currentConfig: {},   // { key: [value, ...] }
  defaults: {},        // { key: [value, ...] }
  themes: [],          // ["theme1", ...]
  modifiedKeys: new Set(),
  activeCategory: "font",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const getValue = (key) => {
  const vals = state.currentConfig[key];
  return vals?.length ? vals[0] : "";
};

const getDefault = (key) => {
  const vals = state.defaults[key];
  return vals?.length ? vals[0] : "";
};

const setValue = (key, value) => {
  if (value === "" || value === undefined || value === null) {
    delete state.currentConfig[key];
  } else {
    state.currentConfig[key] = [String(value)];
  }
  state.modifiedKeys.add(key);
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const api = {
  async getConfig() {
    const res = await fetch("/api/config");
    if (!res.ok) throw new Error(`Failed to load config: ${res.statusText}`);
    const data = await res.json();
    return data.entries ?? {};
  },

  async getDefaults() {
    const res = await fetch("/api/defaults");
    if (!res.ok) throw new Error(`Failed to load defaults: ${res.statusText}`);
    const data = await res.json();
    return data.defaults ?? {};
  },

  async getThemes() {
    const res = await fetch("/api/themes");
    if (!res.ok) throw new Error(`Failed to load themes: ${res.statusText}`);
    const data = await res.json();
    return data.themes ?? [];
  },

  async saveConfig(entries) {
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text || res.statusText);
    }
    return res.json();
  },
};

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
const showToast = (message, type = "success") => {
  const container = $("#toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger reflow for animation
  toast.offsetHeight;
  toast.classList.add("toast-visible");

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    // Fallback removal
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};

// ---------------------------------------------------------------------------
// Render: Controls
// ---------------------------------------------------------------------------
const renderTextControl = (setting, value) => {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "control-input";
  input.value = value;
  input.placeholder = getDefault(setting.key) || "";
  input.addEventListener("input", () => {
    setValue(setting.key, input.value);
    markModified(input, setting.key);
  });
  return input;
};

const renderNumberControl = (setting, value) => {
  const input = document.createElement("input");
  input.type = "number";
  input.className = "control-input";
  input.value = value;
  input.placeholder = getDefault(setting.key) || "";
  if (setting.min !== undefined) input.min = setting.min;
  if (setting.max !== undefined) input.max = setting.max;
  if (setting.step !== undefined) input.step = setting.step;
  input.addEventListener("input", () => {
    setValue(setting.key, input.value);
    markModified(input, setting.key);
  });
  return input;
};

const renderBooleanControl = (setting, value) => {
  const label = document.createElement("label");
  label.className = "toggle-switch";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = value === "true" || value === true;

  const slider = document.createElement("span");
  slider.className = "toggle-slider";

  checkbox.addEventListener("change", () => {
    setValue(setting.key, checkbox.checked ? "true" : "false");
    markModified(label, setting.key);
  });

  label.appendChild(checkbox);
  label.appendChild(slider);
  return label;
};

const renderColorControl = (setting, value) => {
  const wrapper = document.createElement("div");
  wrapper.className = "color-control";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "control-color";
  colorInput.value = normalizeColor(value) || "#000000";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "control-input control-color-text";
  textInput.value = value;
  textInput.placeholder = getDefault(setting.key) || "#000000";

  colorInput.addEventListener("input", () => {
    textInput.value = colorInput.value;
    setValue(setting.key, colorInput.value);
    markModified(wrapper, setting.key);
  });

  textInput.addEventListener("input", () => {
    const normalized = normalizeColor(textInput.value);
    if (normalized) colorInput.value = normalized;
    setValue(setting.key, textInput.value);
    markModified(wrapper, setting.key);
  });

  wrapper.appendChild(colorInput);
  wrapper.appendChild(textInput);
  return wrapper;
};

const normalizeColor = (value) => {
  if (!value) return null;
  const s = value.trim();
  // Accept 3 or 6 digit hex with or without #
  if (/^#?[0-9a-fA-F]{6}$/.test(s)) {
    return s.startsWith("#") ? s : `#${s}`;
  }
  if (/^#?[0-9a-fA-F]{3}$/.test(s)) {
    const hex = s.replace("#", "");
    const expanded = hex.split("").map((c) => c + c).join("");
    return `#${expanded}`;
  }
  return null;
};

const renderEnumControl = (setting, value) => {
  const select = document.createElement("select");
  select.className = "control-select";

  // Add empty/default option
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = `Default (${getDefault(setting.key) || "none"})`;
  select.appendChild(emptyOpt);

  for (const opt of setting.options) {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === value) option.selected = true;
    select.appendChild(option);
  }

  select.addEventListener("change", () => {
    setValue(setting.key, select.value);
    markModified(select, setting.key);
  });

  return select;
};

// Theme color cache to avoid redundant fetches
const themeColorCache = {};

const fetchThemeColors = async (name) => {
  if (themeColorCache[name]) return themeColorCache[name];
  try {
    const res = await fetch(`/api/theme/${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const data = await res.json();
    themeColorCache[name] = data;
    return data;
  } catch {
    return null;
  }
};

const renderTerminalPreview = (colors) => {
  const preview = document.createElement("div");
  preview.className = "theme-preview";
  const bg = colors.background || "#1e1e2e";
  const fg = colors.foreground || "#cdd6f4";
  preview.style.background = bg;
  preview.style.color = fg;

  // Fake terminal prompt lines using palette colors
  const lines = [
    { prompt: true, color: colors.palette?.[2] || "#a6e3a1", user: "scott", dir: "~/Code", cmd: "ghostty --version" },
    { text: "Ghostty 1.2.0", color: fg },
    { prompt: true, color: colors.palette?.[4] || "#89b4fa", user: "scott", dir: "~/Code", cmd: "ls" },
    { parts: [
      { text: "README.md  ", color: fg },
      { text: "src/", color: colors.palette?.[4] || "#89b4fa" },
      { text: "  config.go", color: colors.palette?.[2] || "#a6e3a1" },
    ]},
    { prompt: true, color: colors.palette?.[2] || "#a6e3a1", user: "scott", dir: "~/Code", cmd: "" },
  ];

  for (const line of lines) {
    const row = document.createElement("div");
    row.className = "theme-preview-line";
    if (line.prompt) {
      const promptSpan = document.createElement("span");
      promptSpan.style.color = line.color;
      promptSpan.textContent = `${line.user}@ghost `;
      const dirSpan = document.createElement("span");
      dirSpan.style.color = colors.palette?.[6] || "#94e2d5";
      dirSpan.textContent = line.dir;
      const arrow = document.createElement("span");
      arrow.style.color = colors.palette?.[5] || "#f5c2e7";
      arrow.textContent = " ❯ ";
      const cmdSpan = document.createElement("span");
      cmdSpan.style.color = fg;
      cmdSpan.textContent = line.cmd;
      row.append(promptSpan, dirSpan, arrow, cmdSpan);
      if (line.cmd === "") {
        const cursor = document.createElement("span");
        cursor.className = "theme-preview-cursor";
        cursor.style.background = colors.cursor || fg;
        cursor.textContent = " ";
        row.appendChild(cursor);
      }
    } else if (line.parts) {
      for (const part of line.parts) {
        const span = document.createElement("span");
        span.style.color = part.color;
        span.textContent = part.text;
        row.appendChild(span);
      }
    } else {
      row.style.color = line.color || fg;
      row.textContent = line.text;
    }
    preview.appendChild(row);
  }
  return preview;
};

const renderThemeBrowser = () => {
  const wrapper = document.createElement("div");
  wrapper.className = "theme-browser";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "control-input theme-search";
  searchInput.placeholder = "Search themes...";

  const grid = document.createElement("div");
  grid.className = "theme-grid";

  let currentTheme = getValue("theme");

  // Lazy-load theme colors when card scrolls into view
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const card = entry.target;
        const themeName = card.dataset.theme;
        if (themeName && !card.dataset.loaded) {
          card.dataset.loaded = "true";
          fetchThemeColors(themeName).then(colors => {
            if (colors) {
              const placeholder = card.querySelector(".theme-preview-placeholder");
              if (placeholder) {
                placeholder.replaceWith(renderTerminalPreview(colors));
              }
            }
          });
        }
        observer.unobserve(card);
      }
    }
  }, { rootMargin: "100px" });

  const renderGrid = (filter = "") => {
    grid.innerHTML = "";
    const lowerFilter = filter.toLowerCase();
    const filtered = state.themes.filter((t) =>
      t.toLowerCase().includes(lowerFilter)
    );

    for (const theme of filtered) {
      const card = document.createElement("button");
      card.className = "theme-card";
      card.dataset.theme = theme;
      if (theme === currentTheme) card.classList.add("theme-active");

      // Preview placeholder (replaced when visible)
      const placeholder = document.createElement("div");
      placeholder.className = "theme-preview-placeholder theme-preview";
      card.appendChild(placeholder);

      const label = document.createElement("div");
      label.className = "theme-card-label";
      label.textContent = theme;
      card.appendChild(label);

      card.addEventListener("click", () => {
        currentTheme = theme;
        setValue("theme", theme);
        grid.querySelectorAll(".theme-card").forEach((c) =>
          c.classList.remove("theme-active")
        );
        card.classList.add("theme-active");
        const container = wrapper.closest(".setting-item");
        if (container) container.classList.add("setting-modified");
      });

      grid.appendChild(card);
      observer.observe(card);
    }

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "theme-empty";
      empty.textContent = "No themes found";
      grid.appendChild(empty);
    }
  };

  searchInput.addEventListener("input", () => {
    renderGrid(searchInput.value);
  });

  renderGrid();

  wrapper.appendChild(searchInput);
  wrapper.appendChild(grid);
  return wrapper;
};

// ---------------------------------------------------------------------------
// Render: Setting Item
// ---------------------------------------------------------------------------
const markModified = (element, key) => {
  const defaultVal = getDefault(key);
  const currentVal = getValue(key);
  const container = element.closest(".setting-item");
  if (!container) return;

  if (currentVal !== defaultVal && currentVal !== "") {
    container.classList.add("setting-modified");
  } else {
    container.classList.remove("setting-modified");
  }
};

const renderSettingItem = (setting) => {
  const value = getValue(setting.key);
  const defaultValue = getDefault(setting.key);

  const item = document.createElement("div");
  item.className = "setting-item";
  item.dataset.key = setting.key;

  // Mark as modified if value differs from default
  if (value && value !== defaultValue) {
    item.classList.add("setting-modified");
  }

  const labelEl = document.createElement("label");
  labelEl.className = "setting-label";
  labelEl.textContent = setting.label;

  const keyHint = document.createElement("span");
  keyHint.className = "setting-key";
  keyHint.textContent = setting.key;

  const controlWrapper = document.createElement("div");
  controlWrapper.className = "setting-control";

  let control;
  switch (setting.type) {
    case "text":
      control = renderTextControl(setting, value);
      break;
    case "number":
      control = renderNumberControl(setting, value);
      break;
    case "boolean":
      control = renderBooleanControl(setting, value);
      break;
    case "color":
      control = renderColorControl(setting, value);
      break;
    case "enum":
      control = renderEnumControl(setting, value);
      break;
    case "theme":
      control = renderThemeBrowser();
      break;
    default:
      control = renderTextControl(setting, value);
  }

  controlWrapper.appendChild(control);

  item.appendChild(labelEl);
  item.appendChild(keyHint);
  if (setting.desc) {
    const descEl = document.createElement("p");
    descEl.className = "setting-desc";
    descEl.textContent = setting.desc;
    item.appendChild(descEl);
  }
  item.appendChild(controlWrapper);

  return item;
};

// ---------------------------------------------------------------------------
// Render: Category
// ---------------------------------------------------------------------------
const renderCategory = (name) => {
  const content = $("#content");
  if (!content) return;
  content.innerHTML = "";

  state.activeCategory = name;

  // Update sidebar active state
  $$(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === name);
  });

  // Raw editor for "all" category
  if (name === "all") {
    renderRawEditor(content);
    return;
  }

  const category = CATEGORIES[name];
  if (!category) return;

  const header = document.createElement("div");
  header.className = "category-header";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = category.title;

  const desc = document.createElement("p");
  desc.className = "category-description";
  desc.textContent = category.description;

  header.appendChild(title);
  header.appendChild(desc);
  content.appendChild(header);

  const form = document.createElement("div");
  form.className = "settings-form";

  for (const setting of category.settings) {
    form.appendChild(renderSettingItem(setting));
  }

  content.appendChild(form);
};

// ---------------------------------------------------------------------------
// Render: Raw Editor
// ---------------------------------------------------------------------------
const renderRawEditor = (content) => {
  const header = document.createElement("div");
  header.className = "category-header";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = "All Settings";

  const desc = document.createElement("p");
  desc.className = "category-description";
  desc.textContent = "Edit raw configuration. Each line should be: key = value";

  header.appendChild(title);
  header.appendChild(desc);
  content.appendChild(header);

  const textarea = document.createElement("textarea");
  textarea.className = "raw-editor";
  textarea.id = "raw-editor";
  textarea.spellcheck = false;

  // Build text from current config
  const lines = [];
  const entries = state.currentConfig;
  const sortedKeys = Object.keys(entries).sort();
  for (const key of sortedKeys) {
    const values = entries[key];
    if (values) {
      for (const val of values) {
        lines.push(`${key} = ${val}`);
      }
    }
  }
  textarea.value = lines.join("\n");

  content.appendChild(textarea);
};

const parseRawEditor = () => {
  const textarea = $("#raw-editor");
  if (!textarea) return null;

  const entries = {};
  const lines = textarea.value.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (!key) continue;

    if (!entries[key]) {
      entries[key] = [];
    }
    entries[key].push(value);
  }

  return entries;
};

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------
const save = async () => {
  const saveBtn = $("#save-btn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  try {
    let entries;

    if (state.activeCategory === "all") {
      // Parse from raw editor
      entries = parseRawEditor();
      if (!entries) {
        showToast("Failed to parse configuration", "error");
        return;
      }
    } else {
      // Build entries from current config, omitting empty values
      entries = {};
      for (const [key, values] of Object.entries(state.currentConfig)) {
        const filtered = values.filter((v) => v !== "" && v !== undefined && v !== null);
        if (filtered.length > 0) {
          entries[key] = filtered;
        }
      }
    }

    await api.saveConfig(entries);

    // Update local state to match what was saved
    state.currentConfig = { ...entries };
    state.modifiedKeys.clear();

    // Remove all modified markers
    $$(".setting-modified").forEach((el) =>
      el.classList.remove("setting-modified")
    );

    showToast("Configuration saved", "success");
  } catch (err) {
    showToast(`Error saving: ${err.message}`, "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  }
};

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
const setupSidebar = () => {
  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      if (category) renderCategory(category);
    });
  });
};

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
const init = async () => {
  try {
    const [config, defaults, themes] = await Promise.all([
      api.getConfig(),
      api.getDefaults(),
      api.getThemes(),
    ]);

    state.currentConfig = config;
    state.defaults = defaults;
    state.themes = themes;

    setupSidebar();
    renderCategory("font");

    const saveBtn = $("#save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", save);
    }
  } catch (err) {
    showToast(`Failed to initialize: ${err.message}`, "error");
    console.error("Init error:", err);
  }
};

document.addEventListener("DOMContentLoaded", init);
