// Selectors
const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");
const toggleBtn = document.querySelector(".dropdown-toggle");
const options = document.querySelectorAll(".dropdown-menu li");
const themeToggle = document.querySelector("#theme-toggle");
const runButton = document.querySelector(".run-button");
const clearButton = document.querySelector(".clear-button");
const downloadButton = document.querySelector(".download-button");
const editor = document.getElementById("editor-body");
const outputBox = document.getElementById("output-box");
const newFileBtn = document.querySelector(".new-file");
const fileList = document.querySelector(".file-list");
const editorHeader = document.querySelector(".editor-header");
const statusLanguage = document.getElementById("status-language");
const statusLines = document.getElementById("status-lines");
const statusChars = document.getElementById("status-chars");
const statusCursor = document.getElementById("status-cursor");
const maximizeBtn = document.getElementById("maximize-output");
const outputSection = document.querySelector(".output-section");
const toast = document.getElementById("toast");
const shortcutsBtn = document.getElementById("shortcuts-btn");
const shortcutsModal = document.getElementById("shortcuts-modal");
const shortcutsClose = document.getElementById("shortcuts-close");

// Variables
let selectedLanguage = "HTML";
let activeFile = "index.html";
const API_KEY = "612bcb7b5802c37885a8dd58b41fc0dc";

// Load files from localStorage or use defaults
const defaultFiles = {
  "index.html": "",
  "style.css": "",
  "script.js": ""
};
const savedFiles = localStorage.getItem("codenest-files");
const files = savedFiles ? JSON.parse(savedFiles) : { ...defaultFiles };

// Save to localStorage
function saveToStorage() {
  files[activeFile] = editor.value;
  localStorage.setItem("codenest-files", JSON.stringify(files));
}

// Load saved file list into explorer
function loadSavedFileList() {
  const savedFileNames = Object.keys(files);
  const existingItems = [...fileList.querySelectorAll(".file")].map(li => li.getAttribute("data-file"));
  savedFileNames.forEach(fileName => {
    if (!existingItems.includes(fileName)) {
      const li = document.createElement("li");
      li.classList.add("file");
      li.setAttribute("data-file", fileName);
      li.textContent = fileName;
      fileList.appendChild(li);
      attachFileListener(li);
    }
  });
}

// Toast
function showToast(message, duration = 2000) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

// Detect language from filename
function detectLanguage(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C++"
  };
  return map[ext] || "HTML";
}

// Status bar update
function updateStatus() {
  const text = editor.value;
  const lines = text.split("\n").length;
  const chars = text.length;
  statusLines.textContent = `Lines: ${lines}`;
  statusChars.textContent = `Chars: ${chars}`;
  statusLanguage.textContent = selectedLanguage;
}

// Dropdown open/close
toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle("show");
});

// Select language
options.forEach(option => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedLanguage = option.textContent.trim();
    toggleBtn.textContent = option.textContent;
    dropdownMenu.classList.remove("show");
    statusLanguage.textContent = selectedLanguage;
  });
});

// Close dropdown outside click
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdownMenu.classList.remove("show");
  }
});

// Theme toggle
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("codenest-theme", document.body.classList.contains("dark") ? "dark" : "light");

  const existingIframe = outputBox.querySelector("iframe");
  if (existingIframe) {
    const isDark = document.body.classList.contains("dark");
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    outputBox.innerHTML = "";
    outputBox.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(`
      <style>
        body { 
          background: ${isDark ? "#0d1117" : "#ffffff"}; 
          color: ${isDark ? "#e6edf3" : "#111"};
          margin: 12px;
          font-family: sans-serif;
        }
      </style>
      ${editor.value}
    `);
    iframe.contentDocument.close();
  }
});

// Run button
runButton.addEventListener("click", async () => {
  const code = editor.value;
  const isDark = document.body.classList.contains("dark");

  if (selectedLanguage === "HTML" || selectedLanguage === "CSS") {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    outputBox.innerHTML = "";
    outputBox.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(`
      <style>
        body { 
          background: ${isDark ? "#0d1117" : "#ffffff"}; 
          color: ${isDark ? "#e6edf3" : "#111"};
          margin: 12px;
          font-family: sans-serif;
        }
      </style>
      ${code}
    `);
    iframe.contentDocument.close();

  } else if (selectedLanguage === "JavaScript") {
    outputBox.innerHTML = "";
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(" "));
    try {
      eval(code);
    } catch (err) {
      logs.push(`Error: ${err.message}`);
    }
    console.log = originalLog;
    outputBox.innerHTML = `<pre style="margin:0;color:${isDark ? "#e6edf3" : "#111"}">${logs.join("\n") || "No output"}</pre>`;

  }  else {
    const languageMap = {
      "C++": "g++-15",
      "Python": "python-3.14",
      "Java": "openjdk-25"
    };

    const compiler = languageMap[selectedLanguage];
    if (!compiler) {
      outputBox.innerHTML = `<pre style="color:#ff4444">Language not supported yet.</pre>`;
      return;
    }

    outputBox.innerHTML = `<pre style="color:#888">Running...</pre>`;

    const WIDGET_KEY = "e5efa037adfd370fb63571bd9555f014";

    const socket = io("wss://api.onlinecompiler.io", {
      auth: { token: WIDGET_KEY }
    });

    socket.on("connect", () => {
      socket.emit("runcode", {
        api_key: WIDGET_KEY,
        compiler: compiler,
        code: code,
        input: document.getElementById("input-text").value
      });
    });

    socket.on("codeoutput", (result) => {
      socket.disconnect();
      const output = result.output || result.error || "No output";
      const isError = result.status === "error" || !!result.error;
      outputBox.innerHTML = `<pre style="margin:0;color:${isError ? "#ff4444" : isDark ? "#e6edf3" : "#111"}">${output}</pre>`;
    });

    socket.on("connect_error", (err) => {
      outputBox.innerHTML = `
        <div style="padding:12px;color:#888;display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:12px;height:12px;border:2px solid #888;border-top-color:#2f81f7;border-radius:50%;animation:spin 0.8s linear infinite"></span>
            Compiling and running...
        </div>
        `;
    });
  }
});

// Clear button
clearButton.addEventListener("click", () => {
  editor.value = "";
  outputBox.innerHTML = "";
  saveToStorage();
});

// Tab key support
editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + "    " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 4;
  }
});

// Auto save on input
editor.addEventListener("input", () => {
  saveToStorage();
  updateStatus();
});

// Download button
downloadButton.addEventListener("click", () => {
  const code = editor.value;
  const language = selectedLanguage.toLowerCase();
  const extensions = {
    html: "html",
    css: "css",
    javascript: "js",
    python: "py",
    java: "java",
    "c++": "cpp"
  };
  const ext = extensions[language] || "txt";
  const filename = `code.${ext}`;
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    runButton.click();
  }
  if (e.ctrlKey && e.key === "l") {
    e.preventDefault();
    clearButton.click();
  }
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    downloadButton.click();
  }
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    shortcutsModal.classList.toggle("show");
  }
  if (e.key === "Escape") {
    if (outputSection.classList.contains("maximized")) {
      outputSection.classList.remove("maximized");
      maximizeBtn.textContent = "⛶";
    }
    if (shortcutsModal.classList.contains("show")) {
      shortcutsModal.classList.remove("show");
    }
  }
});

// Status bar listeners
editor.addEventListener("keyup", () => {
  const text = editor.value.substring(0, editor.selectionStart);
  const lines = text.split("\n");
  const ln = lines.length;
  const col = lines[lines.length - 1].length + 1;
  statusCursor.textContent = `Ln ${ln}, Col ${col}`;
});

// Maximize output
maximizeBtn.addEventListener("click", () => {
  outputSection.classList.toggle("maximized");
  if (outputSection.classList.contains("maximized")) {
    maximizeBtn.textContent = "✕";
    showToast("Press Esc to exit fullscreen");
  } else {
    maximizeBtn.textContent = "⛶";
  }
});

// Shortcuts modal
shortcutsBtn.addEventListener("click", () => {
  shortcutsModal.classList.toggle("show");
});
shortcutsClose.addEventListener("click", () => {
  shortcutsModal.classList.remove("show");
});
shortcutsModal.addEventListener("click", (e) => {
  if (e.target === shortcutsModal) {
    shortcutsModal.classList.remove("show");
  }
});

// Close tab
function closeTab(fileName) {
  const tab = editorHeader.querySelector(`[data-tab="${fileName}"]`);
  if (tab) tab.remove();

  if (activeFile === fileName) {
    const remaining = editorHeader.querySelectorAll(".tab");
    if (remaining.length > 0) {
      switchFile(remaining[0].getAttribute("data-tab"));
    } else {
      activeFile = "";
      editor.value = "";
    }
  }
}

// Attach click + dblclick + right-click to file
function attachFileListener(li) {
  li.addEventListener("click", () => {
    switchFile(li.getAttribute("data-file"));
  });

  li.addEventListener("dblclick", () => {
    const oldName = li.getAttribute("data-file");
    const newName = prompt("Rename file:", oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;

    files[newName] = files[oldName];
    delete files[oldName];
    saveToStorage();

    li.setAttribute("data-file", newName);
    li.textContent = newName;

    if (activeFile === oldName) {
      activeFile = newName;
      const tab = editorHeader.querySelector(`[data-tab="${oldName}"]`);
      if (tab) {
        tab.setAttribute("data-tab", newName);
        tab.innerHTML = `${newName} <span class="close-tab">✕</span>`;
        tab.querySelector(".close-tab").addEventListener("click", (e) => {
          e.stopPropagation();
          closeTab(newName);
        });
      }
    }
  });

  li.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const existing = document.querySelector(".context-menu");
    if (existing) existing.remove();

    const menu = document.createElement("div");
    menu.classList.add("context-menu");
    menu.innerHTML = `
      <div class="context-item rename-item">✏️ Rename</div>
      <div class="context-item delete-item">🗑️ Delete</div>
    `;
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;
    document.body.appendChild(menu);

    menu.querySelector(".rename-item").addEventListener("click", () => {
      menu.remove();
      const oldName = li.getAttribute("data-file");
      const newName = prompt("Rename file:", oldName);
      if (!newName || newName.trim() === "" || newName === oldName) return;

      files[newName] = files[oldName];
      delete files[oldName];
      saveToStorage();

      li.setAttribute("data-file", newName);
      li.textContent = newName;

      if (activeFile === oldName) {
        activeFile = newName;
        const tab = editorHeader.querySelector(`[data-tab="${oldName}"]`);
        if (tab) {
          tab.setAttribute("data-tab", newName);
          tab.innerHTML = `${newName} <span class="close-tab">✕</span>`;
          tab.querySelector(".close-tab").addEventListener("click", (ev) => {
            ev.stopPropagation();
            closeTab(newName);
          });
        }
      }
    });

    menu.querySelector(".delete-item").addEventListener("click", () => {
      menu.remove();
      const fileName = li.getAttribute("data-file");
      if (!confirm(`Delete ${fileName}? This cannot be undone.`)) return;
      delete files[fileName];
      saveToStorage();
      li.remove();
      closeTab(fileName);
      showToast(`${fileName} deleted`);
    });

    setTimeout(() => {
      document.addEventListener("click", () => menu.remove(), { once: true });
    }, 0);
  });
}

// Switch file
function switchFile(fileName) {
  files[activeFile] = editor.value;
  activeFile = fileName;
  editor.value = files[activeFile] || "";

  selectedLanguage = detectLanguage(fileName);
  toggleBtn.textContent = selectedLanguage;
  statusLanguage.textContent = selectedLanguage;

  let existingTab = editorHeader.querySelector(`[data-tab="${fileName}"]`);
  if (!existingTab) {
    const tab = document.createElement("div");
    tab.classList.add("tab");
    tab.setAttribute("data-tab", fileName);
    tab.innerHTML = `${fileName} <span class="close-tab">✕</span>`;
    tab.addEventListener("click", () => switchFile(fileName));
    tab.querySelector(".close-tab").addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(fileName);
    });
    editorHeader.appendChild(tab);
  }

  editorHeader.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  editorHeader.querySelector(`[data-tab="${fileName}"]`).classList.add("active");

  document.querySelectorAll(".file-list .file").forEach(f => f.classList.remove("active"));
  const activeItem = document.querySelector(`.file-list [data-file="${fileName}"]`);
  if (activeItem) activeItem.classList.add("active");

  updateStatus();
}

// Attach listeners to existing files
document.querySelectorAll(".file-list .file").forEach(f => attachFileListener(f));

// New file button
newFileBtn.addEventListener("click", () => {
  const fileName = prompt("Enter file name (e.g. app.js):");
  if (!fileName || fileName.trim() === "") return;

  files[fileName] = "";
  saveToStorage();

  const li = document.createElement("li");
  li.classList.add("file");
  li.setAttribute("data-file", fileName);
  li.textContent = fileName;
  fileList.appendChild(li);

  attachFileListener(li);
  switchFile(fileName);
});

// Load saved theme
const savedTheme = localStorage.getItem("codenest-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.checked = true;
}

// Load saved files into explorer
loadSavedFileList();

// Open index.html tab on load
switchFile("index.html");