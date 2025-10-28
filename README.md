# Japanese Sensei - PWA

A Progressive Web App (PWA) built with Next.js, TypeScript, and Tailwind CSS for Japanese language learning. Features offline support, persistent storage, and modern web app capabilities.

## Features

- 🌐 **Progressive Web App** with offline support
- ⚡ **Next.js 15** with App Router and Turbopack
- 🎨 **Tailwind CSS 4** for modern styling
- 📱 **Mobile-first responsive design**
- 💾 **Storage API** integration with quota monitoring
- 🔄 **Online/offline status detection**
- 🚀 **Ready for Vercel deployment**

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Development

1. **Clone and install dependencies:**

```bash
git clone <your-repo-url>
cd japanese-sensei
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

The app will automatically reload when you make changes.

### Build

**Build for production:**

```bash
npm run build
```

**Start production server locally:**

```bash
npm run start
```

**Lint the code:**

```bash
npm run lint
```

## PWA Configuration

The app includes the following PWA features:

- **Service Worker**: Active only in production with auto-register and skipWaiting
- **Manifest**: Configured for standalone display mode
- **Icons**: Placeholder icons (replace `/public/icon-*.png` files)
- **Offline Support**: Caching strategy via next-pwa
- **Storage Persistence**: Automatic request for persistent storage

### PWA Testing

1. Build and run in production mode:

```bash
npm run build
npm run start
```

2. Open Chrome DevTools → Application → Service Workers to verify PWA installation

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel:**

   - Visit [vercel.com](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect Next.js and configure build settings

2. **Environment Variables:**
   No additional environment variables required for basic setup

3. **Deploy:**
   - Push to your main branch
   - Vercel will automatically build and deploy

### Manual Deployment

For other platforms, build the static files:

```bash
npm run build
```

The build output will be in the `.next` folder.

## Project Structure

```
├── src/
│   └── app/
│       ├── layout.tsx       # Root layout with PWA meta tags
│       ├── page.tsx         # Homepage with PWA features
│       └── globals.css      # Global styles
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-*.png.txt       # Icon placeholders (replace)
│   └── ...                  # Static assets
├── next.config.ts           # Next.js config with PWA
└── package.json            # Dependencies and scripts
```

## Customization

### Replace Placeholder Icons

1. Replace `/public/icon-192x192.png.txt` with actual `icon-192x192.png`
2. Replace `/public/icon-512x512.png.txt` with actual `icon-512x512.png`
3. Update `manifest.json` if needed

### Update App Identity

1. **Manifest** (`/public/manifest.json`): Update name, description, and theme colors
2. **Layout** (`/src/app/layout.tsx`): Update metadata and page titles
3. **Homepage** (`/src/app/page.tsx`): Customize content and styling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **PWA**: next-pwa
- **Build Tool**: Turbopack
- **Deployment**: Vercel-ready

## License

MIT License - see LICENSE file for details.
