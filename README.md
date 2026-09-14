# Fashion Marketplace

A modern fashion marketplace platform built with React, TypeScript, and Firebase. Features separate authentication flows for customers, brands, and administrators.

## Features

- **Customer Portal**: Browse and shop fashion products from various brands
- **Brand Dashboard**: Manage products, track sales, and view analytics
- **Admin Panel**: Oversee platform operations, verify brands, and manage users
- **Authentication**: Separate sign-up flows for customers, brands, and admin access
- **Modern UI**: Built with TailwindCSS and shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (18 or higher)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up Firebase:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config

3. Update Firebase configuration:

   Open `src/lib/firebase.ts` and replace the placeholder config with your Firebase project credentials:

   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   }
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   └── ui/          # Reusable UI components (Button, Card, Input, etc.)
├── context/
│   └── AuthContext.tsx  # Firebase authentication context
├── lib/
│   ├── firebase.ts   # Firebase configuration
│   └── utils.ts      # Utility functions
├── pages/
│   ├── Auth/         # Authentication pages
│   ├── Brand/        # Brand dashboard
│   ├── Admin/        # Admin panel
│   ├── Home.tsx      # Landing page
│   └── Shop.tsx      # Customer shopping interface
├── types/
│   └── index.ts      # TypeScript type definitions
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flows

### Customer
- Sign up at `/auth/signup`
- Sign in at `/auth/signin`
- Access shop at `/shop`

### Brand
- Register at `/auth/brand-signup`
- Sign in at `/auth/signin`
- Access dashboard at `/brand/dashboard`

### Admin
- Sign in at `/auth/admin-login`
- Access dashboard at `/admin/dashboard`

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Firebase** - Authentication and database
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Future Enhancements

- Payment integration (Stripe)
- Product image upload
- Real-time inventory updates
- Order management system
- Customer reviews and ratings
- Advanced search and filters
- Email notifications
