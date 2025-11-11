# Jia Web Application

Jia is a web application built with Next.js that appears to provide interview assistance, opportunity management, and communication tools. This README provides comprehensive information about the project, how to set it up, run it, and deploy it.

## Tech Stack

- **Frontend**:

  - Next.js 15.x (with App Router)
  - React 19.x
  - SASS for styling
  - TypeScript

- **Backend**:

  - Next.js API Routes (serverless functions)
  - MongoDB for database
  - Firebase for authentication and storage

- **APIs & Services**:

  - OpenAI API integration
  - Socket.io for real-time communication

- **DevOps**:
  - Vercel for deployment
  - Git for version control

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB account (for database connection)
- Firebase account (for authentication)
- OpenAI API key

## Getting Started

### Setting Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in the required environment variables in `.env`:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Firebase
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json

# App Configuration
NEXT_PUBLIC_CORE_API_URL=your_backend_api_url
```

### Installing Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### Running Locally

Development mode with hot reloading (using Turbopack):

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Starting Production Server

```bash
npm run start
# or
yarn start
```

### Additional Scripts

Clean project (removes node_modules, .next, bun.lock, next-env.d.ts):

```bash
npm run clean
# or
yarn clean
```

## Project Structure

```
jia-web-app/
├── .env                 # Environment variables
├── .env.example         # Example environment configuration
├── .gitignore           # Git ignore file
├── next-env.d.ts        # TypeScript declarations for Next.js
├── package.json         # Project dependencies and scripts
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router structure
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── interview/   # Interview related pages
│   │   ├── login/       # Authentication pages
│   │   ├── my-interviews/ # User interviews management
│   │   ├── applicant/ # Applicant tracking
│   │   ├── talk/        # Communication features
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── contexts/        # React contexts
│   └── lib/             # Shared libraries and utilities
│       ├── components/  # Reusable UI components
│       ├── context/     # Context providers
│       ├── firebase/    # Firebase configuration
│       ├── mongoDB/     # MongoDB utilities
│       ├── styles/      # Global styles
│       ├── Modal/       # Modal components
│       ├── Loader/      # Loading UI components
│       ├── PageComponent/ # Page-specific components
│       └── VoiceAssistant/ # Voice interaction features
└── tsconfig.json        # TypeScript configuration
```

## Key Features

- App Router-based routing system
- Authentication with Firebase
- Data storage with MongoDB
- Real-time communication with Socket.io
- AI-powered features using OpenAI

## Deployment with Vercel

This project is designed to run on Vercel (serverless) out‑of‑the‑box. Below is a concise, reproducible flow.

### 1) Push your code
- Ensure all changes are committed and pushed to your Git host (GitHub/GitLab/Bitbucket).

### 2) Create the Vercel project
1. Go to [Vercel](https://vercel.com) → New Project → Import your Git repository.
2. Framework Preset: Next.js (auto‑detected).
3. Build command / Output directory: use defaults.

### 3) Set environment variables (required)
In Vercel → Project → Settings → Environment Variables

Required
- `MONGODB_URI` — your full MongoDB connection string.

Recommended
- `OPENAI_API_KEY` — used by the LLM engine. If not set, the app also supports reading the key from the `global-settings` document in Mongo (see Optional below).
- `BYPASS_JOB_LIMIT` — set to `true` for demos/dev to ignore plan job limits (optional).

Firebase/Client config
- Add any `NEXT_PUBLIC_*` variables you use for client features (Firebase, etc.).

Notes
- Vercel automatically provides `NODE_ENV=production` on Production deployments.

### 4) Allow Vercel to access MongoDB
- In MongoDB Atlas, add Vercel’s egress IP(s) to your Network Access, or allow access from anywhere (0.0.0.0/0) for testing.

### 5) Deploy
- Click “Deploy” and wait for the green “Ready” badge.

### 6) Post‑deploy checks
Navigate to your deployed URL and verify:
- Recruiter flow → Add career:
  - Step 1: Career Details (Work Arrangement, Location, etc.).
  - Step 2: CV Review & Pre‑screening (Add custom, Dropdown/Range options).
  - Step 3: AI Interview Setup (“Generate all questions” works if `OPENAI_API_KEY` is present or seeded in DB).
  - Step 5: Review (collapsible sections) → Save & Publish (disabled until required fields are valid).

### Optional: Seed global settings in Mongo
If you prefer not to set `OPENAI_API_KEY` in Vercel and want DB‑based config, create this upsert in your DB:
```json
{
  "name": "global-settings",
  "openai_api_key": "sk-...",
  "openai_model": "gpt-4o-mini",
  "question_gen_prompt": { "prompt": "Instruction used when generating interview questions" }
}
```
The app gracefully handles an empty `global-settings` (returns `{}`), so this is truly optional.

### Troubleshooting production deploys
- LLM engine returns 500: set `OPENAI_API_KEY` on Vercel or seed it in `global-settings`.
- Add career returns 400: required fields missing (`jobTitle`, `description`, `questions`, `location`, `workSetup`) or validation failed.
- Mongo connection errors: verify `MONGODB_URI` and Atlas network access.

### Setting up a Custom Domain

1. In your Vercel project, go to "Settings" > "Domains".
2. Add your custom domain and follow the verification steps.

## Contributing

Please follow the existing code style and organization when contributing to the project. Make use of TypeScript for type safety.

## Troubleshooting

- If you encounter issues with the MongoDB connection, verify your connection string and network access settings.
- For Firebase authentication problems, check your Firebase service account credentials.
- For development issues, try running `npm run clean` followed by `npm install` and `npm run dev`.
