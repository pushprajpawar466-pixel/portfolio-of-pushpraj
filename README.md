# Pushpraj Pawar – Bio Data Website (with Node.js backend)

## Setup in VS Code
1. Install Node.js (v18+) from https://nodejs.org
2. Open this folder in VS Code (File > Open Folder)
3. Open the terminal (Ctrl + `) and run:
   ```
   npm install
   npm start
   ```
4. Open http://localhost:3000

## Add your files
- `public/assets/profile.jpeg`  → your photo (rename your WhatsApp image)
- `public/assets/resume.pdf`    → your real resume

## Backend API
| Method | Route           | Purpose                                   |
|--------|-----------------|-------------------------------------------|
| GET    | /api/profile    | Profile info as JSON                      |
| GET    | /api/resume     | Downloads resume.pdf                      |
| POST   | /api/contact    | Saves contact form message (validated)    |
| GET    | /api/messages   | Lists messages (header `x-admin-key`)     |

Messages are stored in `data/messages.json`. Set your own `ADMIN_KEY` in `.env`.
