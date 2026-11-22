# Daybook task manager

A small full-stack starter app with a browser frontend and a Node.js backend. It
uses only built-in Node.js modules; no dependency installation is required.

## Requirements

- Node.js 18 or newer

## Run the app

Open two terminals in this project folder:

1. Start the API:

   ```powershell
   cd backend
   npm start
   ```

2. Start the frontend:

   ```powershell
   cd frontend
   npm start
   ```

3. Open <http://127.0.0.1:4173> in your browser.

The backend API listens on <http://127.0.0.1:3001>. Tasks are stored in
`backend/data/tasks.json` and remain available after restarting the app.

For the application architecture, task flows, API details, data format, and
verified output, see [DOCUMENTATION.md](DOCUMENTATION.md).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create a task with `{ "title": "..." }` |
| `PATCH` | `/api/tasks/:id` | Change completion with `{ "completed": true }` |
| `DELETE` | `/api/tasks/:id` | Delete a task |
