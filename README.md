# OptiCommerce AI

AI-powered e-commerce product listing optimizer for Amazon, Shopify, Etsy, eBay, and Walmart.

## Features

- **Multi-Platform Support**: Optimize listings for Amazon, Shopify, Etsy, eBay, and Walmart
- **AI-Powered Optimization**: Uses Google Gemini 1.5 Flash for intelligent content generation
- **Platform-Specific Engines**: Custom optimization rules for each marketplace
- **SEO Scoring**: Comprehensive SEO analysis with keyword optimization
- **Compliance Checking**: Validates listings against platform policies
- **Quality Assurance**: Grammar checks, mobile optimization, and readability analysis
- **Credit System**: 5 free credits, upgrade plans available
- **Real-time Results**: Instant optimization with before/after comparison

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI**: Google Gemini 1.5 Flash
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/opticommerce-ai.git
cd opticommerce-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   ├── landing/          # Landing page components
│   └── ui/               # Reusable UI components
├── lib/                   # Core libraries
│   ├── engines/          # Platform-specific optimization engines
│   ├── firebase/         # Firebase configuration
│   ├── gemini/           # Gemini AI client
│   ├── hooks/            # React hooks
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
└── types/                 # TypeScript type definitions
```

## Platform Engines

Each platform has a dedicated optimization engine:

- **AmazonEngine**: A9/A10 algorithm optimization, bullet points, backend keywords
- **ShopifyEngine**: Google SEO optimization, meta descriptions, structured data
- **EtsyEngine**: Handmade/vintage focus, tags, emotional storytelling
- **EbayEngine**: Cassini algorithm, item specifics, HTML descriptions
- **WalmartEngine**: Shelf descriptions, compliance, value proposition

## Services

- **SEOOptimizerService**: Keyword research, integration, and scoring
- **ComplianceCheckerService**: Policy validation, prohibited word detection
- **QualityAssuranceService**: Grammar checks, mobile optimization, readability

## Credit System

- **Free Tier**: 5 credits per month
- **Basic Plan**: $9/month - 50 credits
- **Premium Plan**: $19/month - Unlimited credits

Each optimization uses 1 credit. Credits reset monthly.

## Deployment

The app is deployed on Vercel:

```bash
npm run build
vercel deploy --prod
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Add your domain to authorized domains
5. Download service account key for Admin SDK

## API Keys

### Google Gemini
Get your API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open a GitHub issue or contact support.

---

Built with ❤️ using Next.js, Firebase, and Google Gemini AI
