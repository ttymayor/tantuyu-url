# Tantuyu URL Shortener

## Project Overview

**Tantuyu URL** is a modern, full-featured URL shortening service built with Next.js 16. It offers robust analytics, password protection, and link expiration features.

### Key Features
*   **URL Shortening:** Generate short, unique codes for long URLs.
*   **Analytics:** detailed tracking of clicks, including browser, device, OS, referrer, and geographic location (via IPInfo).
*   **Security:** Optional password protection for shortened links.
*   **Expiration:** Set expiration dates for links.
*   **User Management:** User authentication and dashboard for managing personal links.

### Tech Stack
*   **Framework:** Next.js 16 (App Router, React 19)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4, Radix UI, Lucide React
*   **Database:** SQLite (via Better SQLite3), Drizzle ORM
*   **Authentication:** Better Auth
*   **Visualizations:** Recharts, React Simple Maps

## Getting Started

### Prerequisites
*   Node.js (v20+ recommended)
*   npm, yarn, pnpm, or bun

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Copy `.env.example` to `.env` and configure the following:
    *   `BETTER_AUTH_SECRET`: Generate a random secret.
    *   `BETTER_AUTH_URL`: Your app URL (e.g., `http://localhost:3000`).
    *   `IPINFO_TOKEN`: (Optional) For geographic analytics.

3.  **Database Setup:**
    The project uses a local SQLite database (`sqlite.db`).
    Initialize the database schema:
    ```bash
    npx drizzle-kit push
    ```

### Running the App

*   **Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

*   **Production Build:**
    ```bash
    npm run build
    npm start
    ```

## Project Structure

*   `src/app/[code]/route.ts`: **Core Logic.** Handles incoming short link requests, checks expiration/password, records analytics, and redirects.
*   `src/db/schema.ts`: **Data Models.** Defines tables for Users, Sessions, URLs, and URL Events (analytics).
*   `src/lib/auth.ts`: **Authentication.** Configuration for Better Auth.
*   `src/lib/url.ts`: **Business Logic.** Helper functions for creating, retrieving, and updating URLs.
*   `src/app/dashboard`: **UI.** The authenticated user interface for managing links and viewing analytics.
*   `drizzle.config.ts`: **DB Config.** Configuration for Drizzle Kit migrations.

## Development Conventions

*   **Database:** Use Drizzle ORM for all database interactions. Run migrations/push schema changes when modifying `src/db/schema.ts`.
*   **Styling:** Use Tailwind CSS utility classes. UI components are largely based on Radix UI primitives.
*   **Routing:** Uses Next.js App Router. The `[code]` dynamic route is the entry point for short links.
*   **Type Safety:** Strict TypeScript usage is encouraged.
