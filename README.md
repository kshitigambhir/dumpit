# DumpIt - Personal Resource Vault

A modern, full-featured web application for saving, organizing, and sharing your valuable links and resources. Built with React, TypeScript, Tailwind CSS, and Firebase.

## ✨ Features

### Core Functionality
- **🔐 User Authentication**: Secure sign up and login with Firebase Auth
- **📚 Resource Management**: Create, read, update, and delete your resources
- **🏷️ Tag Organization**: Categorize resources with predefined tags (Tutorial, Article, Video, Tool, etc.)
- **🔍 Search & Filter**: Quickly find resources with search and tag filtering
- **🌍 Public/Private Toggle**: Share resources publicly or keep them private
- **✏️ Edit Resources**: Update any of your saved resources anytime
- **👥 Shared Dump**: Discover and save public resources from other users
- **📊 Profile Dashboard**: View statistics and manage account settings

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient designs with smooth animations
- **Loading States**: Clear feedback during async operations
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Visual confirmation of actions


## Backend / Local setup (Firebase)

This project uses Firebase Auth and Firestore for runtime data.

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Email/Password authentication in the Authentication settings
3. Create a Firestore database (start in test mode for local development)
4. Add the following environment variables to `.env` or to your deployment platform:

   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID

5. Run the dev server:

   ```bash
   npm install
   npm run dev
   ```

For detailed setup steps, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

### Migration Note
Supabase files have been removed from the codebase as part of the migration to Firebase. If you see any references to Supabase, please open an issue.

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Create an account and start saving resources!

## 📖 Usage

### Adding Resources
1. Click "Add Resource" in the navigation
2. Fill in the title, link, and optional note
3. Select a tag category
4. Toggle public/private visibility
5. Click "Add Resource"

### Editing Resources
1. Go to your Dashboard
2. Find the resource you want to edit
3. Click the edit icon (✏️) on the resource card
4. Update the fields in the modal
5. Click "Save Changes"

### Managing Your Profile
1. Click "Profile" in the navigation
2. View your resource statistics
3. Update your username
4. Set default privacy preference for new resources

### Discovering Resources
1. Click "Shared Dump" to see public resources from the community
2. Search and filter to find what you need
3. Click "Save to My Dump" to add them to your collection

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Firebase (Auth + Firestore)
- **Build Tool**: Vite
- **Linting**: ESLint

## 📁 Project Structure

```
dumpit/
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Authentication UI
│   │   ├── Dashboard.tsx      # User's resource dashboard
│   │   ├── AddResource.tsx    # Form to add new resources
│   │   ├── EditResource.tsx   # Modal to edit resources
│   │   ├── SharedDump.tsx     # Public resources feed
│   │   ├── Profile.tsx        # User profile & settings
│   │   └── Layout.tsx         # App layout with navigation
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/
│   │   └── firebase.ts        # Firebase client & helpers
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
 
│   └── migrations/            # Database schema migrations
└── public/                    # Static assets
```

## 🔄 Recent Updates

### v1.1.0 - Edit Resource Feature
- ✅ Added ability to edit existing resources
- ✅ New EditResource component with modal interface
- ✅ Edit button on resource cards in Dashboard
- ✅ Full CRUD operations now supported
- ✅ Maintains all resource properties (title, link, note, tag, visibility)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Rayan9064**
- GitHub: [@Rayan9064](https://github.com/Rayan9064)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
 
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

