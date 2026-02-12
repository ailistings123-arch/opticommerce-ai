# OptiCommerce AI

A full-stack SaaS application for optimizing e-commerce product listings using AI. Built with Next.js 15, Firebase, and Google Gemini 1.5 Flash API.

## Features

- 🤖 AI-powered product listing optimization
- 📊 SEO scoring (0-100) with detailed improvements
- 🛍️ Multi-platform support (Amazon, Shopify, Etsy, eBay)
- 🔐 Secure authentication (Email/Password & Google OAuth)
- 📈 Usage tracking and tier-based limits
- 📜 Optimization history
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini 1.5 Flash API
- **Deployment**: Vercel-ready

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

All credentials are already configured in `.env.local`. The file includes:
- Firebase client configuration
- Firebase Admin SDK credentials
- Google Gemini API key

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Enable Firestore Database (production mode)
4. Enable Authentication (Email/Password and Google)
5. Apply Firestore security rules (see `SETUP.md`)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Auth forms
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── firebase/         # Firebase setup
│   ├── gemini/           # Gemini AI client
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
└── types/                 # TypeScript type definitions
```

## Subscription Tiers

| Tier | Monthly Cost | Optimizations/Month |
|------|--------------|---------------------|
| Free | $0 | 3 |
| Basic | $19 | 20 |
| Premium | $49 | 75 |

## Documentation

- `requirements.md` - Full requirements specification (EARS notation)
- `design.md` - Technical design document
- `tasks.md` - Implementation task list
- `SETUP.md` - Detailed setup instructions

## Deployment

### Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables from `.env.local`
4. Deploy

## Support

For issues or questions, refer to the troubleshooting section in `SETUP.md`.

## License

MIT
