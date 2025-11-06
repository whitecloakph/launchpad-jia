# Project: Jia Web Application

## Project Overview

Jia is a web application built with Next.js 15 that provides interview assistance, opportunity management, and communication tools. The tech stack includes:

*   **Framework**: Next.js 15.x (with App Router)
*   **Language**: TypeScript
*   **Styling**: SASS
*   **Frontend**: React 19.x
*   **Backend**: Next.js API Routes
*   **Database**: MongoDB
*   **Authentication/Storage**: Firebase
*   **APIs & Services**: OpenAI, Socket.io for real-time features.
*   **Deployment**: Vercel

The application source code is located in the `src/` directory, following the Next.js App Router structure. Key directories include `src/app` for routes, `src/lib` for shared utilities and components, and `public/` for static assets.

## Building and Running

### Prerequisites

*   Node.js (v18 or higher)
*   `npm` or `yarn`
*   MongoDB, Firebase, and OpenAI API credentials.

### Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Environment Variables:**
    *   Copy `.env.example` to a new `.env` file.
    *   Fill in the necessary credentials for MongoDB, Firebase, and OpenAI.

### Key Commands

*   **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Start Production Server:**
    ```bash
    npm run start
    ```

*   **Clean Project:**
    ```bash
    npm run clean
    ```

## Development Conventions

*   **Code Style**: Follow the existing code style and organization.
*   **Type Safety**: Utilize TypeScript for all new code.
*   **Project Structure**: Adhere to the established Next.js App Router structure as outlined in the `README.md`. Reusable components are located in `src/lib/components`.
