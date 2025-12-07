# Custom Domain Email Platform

A modern email hosting platform that allows you to set up custom domains and create professional email addresses like `mailbox@hosenur.dev`, accessible through your domain at `mailbox.hosenur.dev`.

![Email Platform](./public/preview.png)

## 🚀 Features

### 🌐 Domain-Based Email Hosting
- **Custom Domain Setup**: Host email for your own domain (e.g., `hosenur.dev`)
- **Professional Email Addresses**: Create addresses like `mailbox@hosenur.dev`, `info@hosenur.dev`, etc.
- **Domain-Based Access**: Users log in via their subdomain (e.g., `mailbox.hosenur.dev`)
- **Subdomain Routing**: Each email address gets its own subdomain for organized access

### 📧 Email Management
- **Real-time Inbox**: Live email updates using Resend's inbound API
- **Email Organization**: Starred, sent, archived, and trash folders
- **Advanced Search**: Search through emails by subject, sender, or content
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🤖 Smart Email Processing (Optional)
- **AI Summaries**: Optional AI-generated summaries for better email comprehension
- **TLDR Generation**: Quick summaries of unread emails
- **Smart Categorization**: Automatic email categorization (Work, Personal, Finance, etc.)
- **Action Items Extraction**: Identify actionable tasks from emails

### 🔐 Security & Authentication
- **Secure Authentication**: Built with Better Auth for robust user management
- **Avatar Generation**: Automatic avatar creation using DiceBear
- **Session Management**: Secure session handling with IP and user agent tracking

### 🎨 Modern UI/UX
- **Beautiful Interface**: Built with React Aria Components and Tailwind CSS 4
- **Dark/Light Theme**: Theme switching support with next-themes
- **Accessible**: Full accessibility support with React Aria
- **Smooth Animations**: Motion-powered animations for enhanced UX

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with Pages Router
- **React 19** - Latest React with React Compiler
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Aria Components** - Accessible UI components
- **Biome** - Fast linter and formatter

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust relational database
- **Better Auth** - Authentication library

### Email Infrastructure
- **Resend Inbound API** - Receive emails for custom domains
- **Resend** - Email service for sending emails
- **Domain-based Routing** - Subdomain-based email access
- **SWR** - Data fetching and caching

### AI & Integrations (Optional)
- **Mistral AI** - Email summarization and analysis (optional)
- **DiceBear** - Avatar generation

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── icons/           # Custom icon components
│   ├── app-sidebar.tsx  # Main navigation sidebar
│   ├── email-sidebar.tsx # Email list sidebar
│   └── email-preview.tsx # Email preview component
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── auth.ts          # Authentication configuration
│   ├── resend.ts        # Resend API integration
│   ├── prisma.ts        # Database client
│   └── primitive.ts     # Utility functions
├── pages/               # Next.js pages and API routes
│   ├── api/             # API endpoints
│   │   ├── portal.ts    # Resend inbound email handler
│   │   ├── emails.ts    # Email management
│   │   └── tldr.ts      # TLDR generation
│   ├── auth/            # Authentication pages
│   └── s/               # Subdomain-based email interface
├── styles/              # Global styles
└── layout/              # Layout components
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Resend account with inbound email enabled
- Custom domain for email hosting

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd email
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/email_db"
   
   # Resend
   RESEND_API_KEY="your_resend_api_key"
   
   # Better Auth
   BETTER_AUTH_SECRET="your_better_auth_secret"
   
   # Optional: Mistral AI
   MISTRAL_API_KEY="your_mistral_api_key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun db:generate
   
   # Run database migrations
   bun db:migrate
   
   # (Optional) Open Prisma Studio
   bun db:studio
   ```

5. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 🌐 Domain Setup

### 1. Configure Your Domain
Set up your domain (e.g., `hosenur.dev`) with the following DNS records:

```
# MX Records
MX 10 inbound-smtp.us-east-1.amazonses.com.

# TXT Records for SPF, DKIM (provided by Resend)
TXT "v=spf1 include:amazonses.com ~all"

# DKIM records (provided by Resend dashboard)
```

### 2. Set Up Subdomains
Create DNS records for your email subdomains:

```
# For mailbox access (mailbox.hosenur.dev)
CNAME mailbox your-domain.com

# For other email addresses
CNAME info your-domain.com
CNAME support your-domain.com
```

### 3. Configure Resend Inbound Email
1. Add your domain to Resend dashboard
2. Enable inbound email for your domain
3. Set webhook URL to: `https://yourdomain.com/api/portal`

### 4. Create Email Addresses
Users can create email addresses through the platform:
- `mailbox@hosenur.dev` → accessible at `mailbox.hosenur.dev`
- `info@hosenur.dev` → accessible at `info.hosenur.dev`
- `support@hosenur.dev` → accessible at `support.hosenur.dev`

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: User accounts and profile information
- **Email**: Email messages with metadata and content
- **Session**: User sessions for authentication
- **Account**: OAuth account connections
- **Verification**: Email verification tokens

Key email fields:
- `recipient`: The email address that received the message
- `from`: Sender information
- `subject`: Email subject line
- `textBody`/`htmlBody`: Email content
- `summary`: AI-generated summary (optional)
- `category`: Email category (Work, Personal, etc.)
- `opened`: Read status

## 🔧 API Endpoints

### Email Management
- `GET /api/emails` - Fetch user's emails
- `GET /api/emails/[id]` - Get specific email
- `GET /api/search` - Search emails
- `GET /api/tldr` - Generate TLDR summary (optional)

### Email Processing
- `POST /api/portal` - Resend webhook for inbound emails
- Processes incoming emails via Resend inbound API
- Stores emails in database with AI analysis (if enabled)

### User Management
- `GET /api/users` - User management
- Authentication endpoints via Better Auth

## 🔄 Email Flow

1. **Incoming Email**: Email sent to `mailbox@hosenur.dev`
2. **Resend Processing**: Resend receives email and forwards to webhook
3. **Webhook Handler**: `/api/portal` processes the email
4. **Database Storage**: Email stored in PostgreSQL with metadata
5. **User Notification**: User sees new email in real-time interface
6. **AI Analysis** (Optional): Mistral AI analyzes and categorizes email

## 🛡 Security Features

- **Domain Verification**: Ensures emails are from verified domains
- **Authentication**: Secure user authentication with Better Auth
- **Session Management**: Automatic session handling with security features
- **CSRF Protection**: Built-in CSRF protection
- **Input Validation**: Zod schema validation for API inputs

## 🎨 UI Components

The application includes a comprehensive UI component library:
- **Buttons**: Various button styles and states
- **Forms**: Input fields, text areas, and form controls
- **Navigation**: Sidebars, breadcrumbs, and menus
- **Data Display**: Tables, lists, cards, and charts
- **Feedback**: Toasts, loaders, and progress indicators
- **Overlays**: Modals, dialogs, and popovers

## 🔄 Development Workflow

### Available Scripts
```bash
# Development
bun dev                    # Start development server

# Building
bun build                  # Production build
bun start                  # Start production server

# Code Quality
bun lint                   # Run Biome linter
bun format                 # Format code with Biome

# Database
bun db:generate            # Generate Prisma client
bun db:migrate             # Run database migrations
bun db:push                # Push schema changes
bun db:studio              # Open Prisma Studio
```

### Code Style
- **Formatting**: 2-space indentation, enforced by Biome
- **Linting**: Biome linter with React and Next.js rules
- **TypeScript**: Strict TypeScript configuration
- **Imports**: Organized with path aliases (`@/*` for `src/*`)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Configure custom domains in Vercel
5. Deploy automatically on push

### Manual Deployment
1. Build the application: `bun build`
2. Start the production server: `bun start`
3. Ensure PostgreSQL database is accessible
4. Configure environment variables
5. Set up domain DNS records

## 🌟 Example Usage

### Setting up `mailbox@hosenur.dev`

1. **Domain Setup**: Configure DNS for `hosenur.dev`
2. **Create User**: Register user for `mailbox@hosenur.dev`
3. **Access Email**: User visits `mailbox.hosenur.dev`
4. **Receive Emails**: Emails sent to `mailbox@hosenur.dev` appear in the interface
5. **Send Replies**: Use Resend API to send responses

### Multi-Domain Support
- `company.com` → users access via `mailbox.company.com`
- `personal.net` → users access via `inbox.personal.net`
- Each domain operates independently with its own email addresses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Run linting and formatting: `bun lint && bun format`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Resend** for excellent email infrastructure and inbound API
- **Better Auth** for robust authentication
- **React Aria** for accessible UI components
- **Prisma** for excellent database tooling
- **Next.js** team for the amazing framework

## 📞 Support

For support, email support@yourdomain.com or join our [Discord community](https://discord.gg/your-invite).

---

Built with ❤️ using Next.js, Resend, and modern web technologies
