# Mafia Game Night - Invitation Website

A dark, atmospheric invitation website for your Mafia-themed game night. Built with React + Vite and designed to be deployed as a static site on Vercel.

## Features

- **Immersive Mafia Theme**: Dark, cinematic design with 1920s mob aesthetic
- **Player Registration**: Guests enter their "alias" to join
- **Live Player Roster**: See all registered players in real-time
- **localStorage Persistence**: All data stored in browser (no backend needed)
- **Fully Responsive**: Works on desktop, tablet, and mobile
- **Easy Customization**: Edit event details in one place

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm run dev
```

The site will open at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## Customization

All event details can be edited in `src/App.tsx`:

```typescript
const EVENT_DETAILS = {
  date: '10.12.2025',
  location: "Filip Micevski's Town",
  time: '20:00',
  dressCode: 'Sharp suits, dark colors, fedoras optional',
  rules: [
    'Arrive on time - the Family waits for no one',
    // ... edit or add more rules
  ]
}
```

## Deploying to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Add New" → "Project"

4. Import your GitHub repository

5. Vercel will automatically detect it's a Vite project and configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Click "Deploy"

Your site will be live at `https://your-project-name.vercel.app`

## How It Works

### Player Registration
- Players enter a nickname (2-30 characters)
- Duplicates are prevented
- Nicknames are stored in localStorage

### Player Roster
- All registered players are shown in a table
- Shows registration time
- Current user is highlighted
- Admin can clear all players with "Clear All Players" button

### Data Storage
- **localStorage Key**: `mafia_players` - Array of all players
- **localStorage Key**: `mafia_current_player` - Current user's nickname
- All data is stored in the browser (persists on page refresh)

## Sharing the Invitation

Once deployed, share the Vercel URL with your guests:
```
Hey! You've been summoned to Mafia Game Night.
Join the Family here: https://your-project-name.vercel.app
```

## Features to Extend (Optional)

If you want to add more features later:

- **QR Code**: Generate a QR code for the invitation URL
- **Email Share**: Add a mailto: link to email the invitation
- **Theme Music**: Add subtle background music toggle
- **Countdown Timer**: Show time remaining until game night
- **Role Assignments**: Pre-assign roles to registered players

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **CSS3**: Custom styling with animations
- **localStorage**: Client-side data persistence

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Players not showing up?**
- Check browser console for errors
- Make sure localStorage is enabled
- Try clearing site data and refreshing

**Styling looks broken?**
- Clear browser cache
- Check if Google Fonts are loading (Playfair Display, Courier Prime)

**Deploy failed on Vercel?**
- Make sure `package.json` has correct build script
- Verify Node version (18+ recommended)
- Check build logs for specific errors

## License

Free to use for your game night!

---

**Need help?** Check the code comments or reach out to your friendly neighborhood developer.
