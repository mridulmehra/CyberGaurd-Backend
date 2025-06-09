# ToxicTamer

A real-time chat application with content moderation and toxicity scoring.

## Tech Stack

- **Backend:** Node.js, Express.js, WebSocket, PostgreSQL, Passport.js.
- **Frontend:** React, Vite, Radix UI, Tailwind CSS, 
- **Dev Tools:** TypeScript, tsx, PostCSS, autoprefixer

## Prerequisites

- Node.js (v20.x LTS recommended)
- PostgreSQL (v16.x)
- npm or yarn

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/mridulmehra/Toxic-Tamer.git
   cd ToxicTamer
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory with the following content:
     ```
     DATABASE_URL=postgres://localhost:5432/toxictamer
     PORT=3000
     ```

4. Start PostgreSQL:
   - Ensure PostgreSQL is running locally on port 5432.
   - Create a database named `toxictamer`:
     ```sh
     createdb toxictamer
     ```

5. Run database migrations (if applicable):
   ```sh
   npm run db:push
   ```

## Running the App

- **Development mode:**
  ```sh
  npm run dev
  ```
  The app will be available at `http://localhost:3000`.

- **Production mode:**
  ```sh
  npm run build
  npm start
  ```

## Features

- Real-time chat with WebSocket support
- Content moderation and toxicity scoring
- User authentication and session management
- Responsive UI with Radix UI and Tailwind CSS

