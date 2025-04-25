# API Pulse

![API Pulse Logo](https://via.placeholder.com/1200x600?text=API+Pulse)

API Pulse is a comprehensive endpoint monitoring system designed to ensure your APIs and services remain operational 24/7. It pings your endpoints at scheduled intervals, provides real-time alerts for issues, and delivers detailed analytics on performance and uptime.

---

## Features

- **Intelligent Scheduling**: Configure custom intervals or cron expressions for endpoint monitoring.
- **Real-time Monitoring**: Track response times, status codes, and success rates with detailed analytics.
- **Multi-channel Alerts**: Receive instant notifications via email, Slack, or in-app when endpoints fail or recover.
- **Comprehensive Logs**: Access detailed logs of all ping attempts, responses, and errors.
- **Advanced Request Configuration**: Customize headers, authentication, and request payloads.
- **Role-based Access Control**: Secure admin features with proper permission management.
- **Team Collaboration**: Invite team members to collaborate on monitoring projects.
- **Responsive Dashboard**: Monitor your endpoints from any device with a clean, intuitive interface.

---

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js with Google OAuth and credentials provider
- **Notifications**: Email (SendGrid), Slack webhooks, in-app notifications
- **Deployment**: Vercel with Cron Jobs

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: Version 18.x or higher
- **MongoDB**: A running MongoDB instance
- **SendGrid API Key**: For email notifications
- **Google OAuth Credentials**: For Google sign-in functionality

---

### Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/api-pulse.git
   cd api-pulse
```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add the following environment variables to the `.env` file:
     ```markdown
     # MongoDB
     MONGODB_URI="your-mongodb-connection-string"
     MONGODB_DB="api-pulse"

     # NextAuth
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="your-nextauth-secret"

     # Google OAuth
     GOOGLE_CLIENT_ID="your-google-client-id"
     GOOGLE_CLIENT_SECRET="your-google-client-secret"

     # Cron
     CRON_SECRET="your-cron-secret"

     # SendGrid
     SENDGRID_API_KEY="your-sendgrid-api-key"
     ```
4. **Run the Development Server**:
    ```bash
    npm run dev
    ```
5. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.
6. **Set Up MongoDB**:
   - Ensure your MongoDB instance is running and accessible.
   - You can use MongoDB Atlas for a cloud-based solution or run a local instance.
7. **Configure SendGrid**:
   - Sign up for a SendGrid account and obtain your API key.
   - Set the `SENDGRID_API_KEY` environment variable in your `.env` file.
   **Configure Google OAuth**:
   - Follow the [Google OAuth documentation](https://next-auth.js.org/providers/google) to set up Google OAuth.
   - Set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables in your `.env` file.
   **Configure Cron**:
   - Set the
    `CRON_SECRET` environment variable in your `.env` file.
    - This secret is used to secure the cron job endpoint.
 