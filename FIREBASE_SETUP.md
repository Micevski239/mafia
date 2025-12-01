# Firebase Setup Instructions

Follow these steps to connect your app to Firebase and enable real-time player tracking.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "mafia-invitation")
4. Disable Google Analytics (not needed for this app)
5. Click "Create project"

## 2. Set up Realtime Database

1. In your Firebase project, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (e.g., us-central1)
4. Start in **test mode** (we'll set up security rules next)
5. Click "Enable"

## 3. Configure Database Security Rules

Once your database is created:

1. Click on the "Rules" tab
2. Replace the default rules with:

```json
{
  "rules": {
    "players": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click "Publish"

**Note:** These rules allow anyone to read/write. For production, you should add authentication.

## 4. Get Your Firebase Configuration

1. Go to Project Settings (gear icon in sidebar)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "mafia-web")
5. Copy the `firebaseConfig` object

## 5. Update Your Project

Open `src/firebase.ts` and replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
}
```

## 6. Test It Out

1. Start your dev server: `npm run dev`
2. Open the app in two different browser windows
3. Join with a nickname in one window
4. Watch it appear in real-time in the other window!

## 7. Deploy (Optional)

To deploy your app so friends can access it:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
   - Choose your project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite files
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

Your app will be live at: `https://your-project.web.app`

## Troubleshooting

**Error: "Permission denied"**
- Check that your database rules allow read/write access
- Make sure you published the rules

**Players not syncing**
- Check browser console for errors
- Verify your Firebase config is correct in `src/firebase.ts`
- Make sure you're using the correct `databaseURL`

**Can't connect to database**
- Verify your Firebase project is created
- Check that Realtime Database is enabled (not Firestore)
- Ensure your API key is correct
