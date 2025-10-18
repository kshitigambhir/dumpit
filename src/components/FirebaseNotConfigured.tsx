import React from 'react'

export function FirebaseNotConfiguredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Firebase Not Configured</h1>
          <p className="text-slate-400 mb-6">
            Your Firebase credentials are missing or using dummy values.
          </p>
          
          <div className="bg-slate-900 rounded p-4 text-left mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">Quick Setup:</h2>
            <ol className="text-sm text-slate-300 space-y-2">
              <li className="flex">
                <span className="font-bold text-blue-400 mr-2">1.</span>
                <span>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Firebase Console</a></span>
              </li>
              <li className="flex">
                <span className="font-bold text-blue-400 mr-2">2.</span>
                <span>Create or select your project</span>
              </li>
              <li className="flex">
                <span className="font-bold text-blue-400 mr-2">3.</span>
                <span>Go to Project Settings → App</span>
              </li>
              <li className="flex">
                <span className="font-bold text-blue-400 mr-2">4.</span>
                <span>Copy the config object</span>
              </li>
              <li className="flex">
                <span className="font-bold text-blue-400 mr-2">5.</span>
                <span>Update your <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">.env.local</code> file</span>
              </li>
              <li className="flex">
                <span className="font-bold text-blue-400 mr-2">6.</span>
                <span>Restart dev server: <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">npm run dev</code></span>
              </li>
            </ol>
          </div>

          <div className="text-left">
            <p className="text-xs text-slate-500 mb-3">Expected env variables:</p>
            <code className="text-xs bg-slate-900 p-3 rounded block text-left text-slate-300 overflow-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`}
            </code>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            📖 See <a href="https://github.com/yourusername/dumpit/blob/main/FIREBASE_SETUP.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">FIREBASE_SETUP.md</a> for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  )
}
