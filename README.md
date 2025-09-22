# ALX Polly

This project is a full-stack polling application built with Next.js, React, and Supabase. It allows users to create, vote on, and view the results of polls.

## Features Implemented

*   **User Authentication:** Users can sign up and log in using email and password.
*   **Poll Creation:** Authenticated users can create new polls with multiple options.
*   **Poll Voting:** Users can vote on existing polls.
*   **Real-time Results:** View real-time updates of poll results.
*   **Poll Management:** Users can view and manage their created polls.
*   **QR Code Generation:** Each poll has a QR code for easy sharing.

## Technologies Used

*   **Frontend:**
    *   Next.js (React Framework)
    *   React
    *   TypeScript
    *   Tailwind CSS (for styling)
*   **Backend:**
    *   Supabase (PostgreSQL Database, Authentication, Edge Functions)
*   **Testing:**
    *   Jest
*   **Deployment:**
    *   Vercel (for Next.js application)

## Setup and Run Instructions

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/alx-polly.git
cd alx-polly
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Supabase

1.  **Create a new Supabase project:** Go to [Supabase](https://app.supabase.com/) and create a new project.
2.  **Get your Supabase URL and Anon Key:** You can find these in your project settings under "API".
3.  **Set up environment variables:** Create a `.env.local` file in the root of your project and add the following:

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
4.  **Run database migrations:**
    You can use the provided `manual-db-setup.sh` script to set up your database schema.

    ```bash
    chmod +x manual-db-setup.sh
    ./manual-db-setup.sh
    ```
    Alternatively, you can manually create the tables and RLS policies as defined in the Supabase documentation for this project.

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notes on AI Usage (Tools and Contexts)

This project was developed with the assistance of an AI agent. The AI was used for:

*   **Code Generation:** Generating boilerplate code, utility functions, and basic component structures.
*   **Debugging:** Identifying potential issues and suggesting fixes.
*   **Refactoring:** Proposing improvements to code structure and readability.
*   **Documentation:** Assisting in generating and updating project documentation like this `README.md` and the `reflection.md`.
*   **Contextual Understanding:** Providing explanations for unfamiliar code patterns or technologies.

The AI agent was provided with the project's file structure and relevant file contents to understand the context and adhere to existing conventions. This iterative process of prompting, reviewing, and refining the AI's output significantly impacted the development workflow.
