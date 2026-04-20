# 🪺 CodeNest — Online Code Editor

> A lightweight, browser-based multi-language code editor built with pure HTML, CSS, and JavaScript — no frameworks, just clean engineering.

---

## 🌐 Live Demo
👉 https://codenest-editor.netlify.app

---

## ✨ Features

### 🗂️ File Management
- Create, rename, delete, and switch between multiple files
- VS Code-style file tabs with close buttons
- Auto-save using `localStorage`

### 💻 Code Execution
- Live HTML & CSS preview (instant rendering)
- Real-time JavaScript execution in browser
- Backend-powered execution for:
  - C++
  - Python
  - Java

### ⚡ Developer Experience
- Input (stdin) support for programs
- Status bar (line count, character count, cursor position)
- Keyboard shortcuts for fast workflow
- Download files with correct extensions

### 🎨 UI / UX
- Clean, minimal IDE-like interface
- Dark / Light theme toggle (with persistence)
- Fullscreen output panel
- Toast notifications for actions

---

## 🛠️ Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript  
- API: OnlineCompiler.io  
- Realtime Communication: Socket.IO  

---

## 🌐 Supported Languages

| Language   | Execution Method                  |
|------------|----------------------------------|
| HTML       | Browser iframe preview           |
| CSS        | Browser iframe preview           |
| JavaScript | Browser execution (`eval`)       |
| C++        | OnlineCompiler.io API            |
| Python     | OnlineCompiler.io API            |
| Java       | OnlineCompiler.io API            |

---

## 📸 Screenshots

### 🌞 Light Mode
![Light Mode](./Media/light.png)

### 🌙 Dark Mode
![Dark Mode](./Media/dark.png)

---

## ⌨️ Keyboard Shortcuts

| Action            | Shortcut        |
|------------------|----------------|
| Run Code         | Ctrl + Enter   |
| Clear Editor     | Ctrl + L       |
| Download File    | Ctrl + S       |
| Open Shortcuts   | Ctrl + /       |
| Exit Fullscreen  | Esc            |
| Insert Tab       | Tab            |

---

## 📦 Installation & Setup

### 1. Clone the repository
git clone https://github.com/yourusername/codenest.git

### 2. Navigate to project folder
cd codenest

### 3. Run locally
Use any local server:

- VS Code → Live Server extension  
- OR any simple HTTP server  

⚠️ Opening via file:// may cause CORS issues.

---

## ⚠️ Known Limitations

- Execution of compiled languages (C++, Java, Python) may not work in the deployed version due to API/CORS restrictions.
- Works perfectly in local environment.

---

## 🔮 Future Improvements

- Syntax highlighting (Prism.js)
- Line numbers in editor
- Resizable panels
- Find & Replace
- Backend integration for reliable execution
- User authentication & cloud storage
- Shareable code links

---

## 👨‍💻 Author

Abhijnyan Saikia  
CSE, NIT Silchar  

---

## 📄 License

This project is licensed under the MIT License — feel free to use and modify.
