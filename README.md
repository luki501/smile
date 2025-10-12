# SMile

A web application designed to help multiple sclerosis (MS) patients monitor their daily health indicators, including weight, blood pressure, and neurological symptoms. The application focuses on simplicity and usability, presenting data in clear charts to facilitate tracking trends over time.

## ✨ Features

- **User Authentication**: Secure sign-up and login using email and password, powered by Supabase.
- **User Profile**: Manage personal data like name, date of birth, and height to calculate BMI.
- **Daily Tracking**: Easily perform CRUD operations for:
  - Weight (kg)
  - Blood Pressure (Systolic, Diastolic, Pulse)
  - Neurological Symptoms (Body part, pain type, description)
- **Data Visualization**: View historical data on interactive line charts.
- **Data Analysis**: Analyze trends with a 5-day moving average overlay.
- **Time-based Filtering**: Filter chart data by week, month, quarter, or year.

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend-as-a-Service**: [Supabase](https://supabase.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Package Manager**: [npm](https://www.npmjs.com/)

## 📋 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) version `22.14.0` or higher.
- [npm](https://www.npmjs.com/) (included with Node.js).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/smile.git
    cd smile
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add your Supabase project credentials. You can find these in your Supabase project's API settings.

    ```env
    PUBLIC_SUPABASE_URL="your-supabase-project-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:4321`.

## ⚙️ Available Scripts

The following scripts are available in the project:

| Script         | Description                                        |
| -------------- | -------------------------------------------------- |
| `npm run dev`    | Starts the development server.                     |
| `npm run build`  | Builds the application for production.             |
| `npm run preview`| Previews the production build locally.             |
| `npm run lint`   | Lints the codebase for errors.                     |
| `npm run lint:fix`| Lints and automatically fixes fixable errors.      |
| `npm run format` | Formats the code using Prettier.                   |

## 🗺️ Project Scope

This project is currently focused on delivering a Minimum Viable Product (MVP) with the core features listed above.

The following features are considered **out of scope** for the MVP:
- Data import and export.
- Integration with external health devices.
- Medication tracking and reminders.
- Offline mode.

## 📊 Project Status

The project is currently **in development**.

## 📄 License

This project is not currently licensed. Please check back later for updates.
