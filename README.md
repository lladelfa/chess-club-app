# Chess Club Management App

A full-stack application for managing a local chess club. This application allows parents to register themselves and their children, view an event calendar, and manage their accounts. The app is built with Next.js and Supabase.

## Features

- **User Authentication:** Secure user registration and login with email/password and Google OAuth.
- **Family Registration:** Parents can register themselves and multiple children.
- **Event Calendar:** View upcoming chess club events and meetings.
- **User Avatars:** Google users have their Google avatar, while other users have a generic avatar.
- **Password Reset:** Users can reset their password via email.

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database and Auth:** [Supabase](https://supabase.io/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/) or other package manager
- A [Supabase](https://supabase.io/) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-github-username/chess-club-app.git
   cd chess-club-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Database Setup

1. **Create a new project on Supabase.**
2. **Navigate to the SQL Editor in your Supabase project.**
3. **Copy the contents of `database.sql` and run it to set up the necessary tables and policies.**

### Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables. You can find these in your Supabase project settings under "API".

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running the Development Server

Once the installation and configuration are complete, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.