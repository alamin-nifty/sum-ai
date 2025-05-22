# Summarize AI

## Project Overview

Summarize AI is a SaaS web application that automatically summarizes email/chat threads and extracts actionable tasks, integrating with productivity tools like Asana and Todoist.

## Tech Stack

- **Frontend**: Next.js 13+, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (planned)
- **AI**: OpenAI GPT-3.5-turbo (planned)
- **External Services**: Asana API, Todoist API, Stripe (planned)

## Getting Started

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# NextAuth (to be configured)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (to be configured)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI (to be configured)
OPENAI_API_KEY=your_openai_api_key
```

### Dependencies

Currently installed:

```bash
npm install mongodb mongoose
```

To be installed:

```bash
npm install next-auth @auth/mongodb-adapter zod @tanstack/react-query axios openai stripe @stripe/stripe-js
```

### Database Setup

1. Create MongoDB Atlas account
2. Create new cluster (free tier)
3. Get connection string
4. Update MONGODB_URI in .env.local

## Project Structure

```
sum-ai/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes (to be implemented)
│   └── auth/              # Authentication pages (to be implemented)
├── components/            # React components (to be implemented)
├── lib/                   # Utility functions
│   └── mongodb.ts        # MongoDB connection
├── models/               # Mongoose models
│   ├── User.ts          # User model
│   └── Summary.ts       # Summary model
├── types/               # TypeScript types
│   └── index.ts        # Shared types
└── public/             # Static assets
```

## Next Steps

1.  **Authentication Setup**
    *   Install NextAuth.js
    *   Configure Google OAuth
    *   Set up authentication pages
2.  **API Routes**
    *   Create summarization endpoint
    *   Implement rate limiting
    *   Add error handling
3.  **Frontend Development**
    *   Create dashboard layout
    *   Implement summary history view
    *   Build integration management UI
4.  **Chrome Extension**
    *   Set up extension project structure
    *   Create manifest.json
    *   Implement content scripts
5.  **Task Integration**
    *   Set up Asana API integration
    *   Set up Todoist API integration
    *   Implement OAuth flow

## Development Guidelines

1.  Follow TypeScript best practices
2.  Use Zod for input validation
3.  Implement proper error handling
4.  Add appropriate logging
5.  Write tests for new features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Asana API Documentation](https://developers.asana.com/docs)
- [Todoist API Documentation](https://developer.todoist.com)
