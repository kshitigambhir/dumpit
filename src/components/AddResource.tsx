import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { generateTitleDescription } from '../lib/ai';

const PREDEFINED_TAGS = [
  'Tutorial',
  'Article',
  'Video',
  'Tool',
  'Documentation',
  'Course',
  'GitHub',
  'Design',
  'Library',
  'Other'
];

interface UserProfile {
  id: string;
  username: string;
  email: string;
  share_by_default: boolean;
}

interface AddResourceProps {
  onSuccess: () => void;
}

export function AddResource({ onSuccess }: AddResourceProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState(PREDEFINED_TAGS[0]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [autoLoading, setAutoLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    const docRef = doc(db, 'users', user!.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      setUserProfile(data);
      setIsPublic(data.share_by_default);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      setError('Link must start with http:// or https://');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'resources'), {
        user_id: user!.uid,
        title,
        link,
        note: note.trim() || null,
        tag,
        is_public: isPublic,
        created_at: new Date(),
      });
      setSuccess(true);
      setTitle('');
      setLink('');
      setNote('');
      setTag(PREDEFINED_TAGS[0]);
      setIsPublic(userProfile?.share_by_default || false);

      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      setError('Failed to add resource. Please try again.');
    }

    setLoading(false);
  };

  const handleAutofill = async () => {
    if (!link) return;
    setAutoLoading(true);
    try {
      const result = await generateTitleDescription(link);
      if (result.title) setTitle((prev) => (prev ? prev : result.title!));
      if (result.description) setNote((prev) => (prev ? prev : result.description!));
    } catch (err) {
      // ignore
    }
    setAutoLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Add New Resource</h2>
        <p className="text-gray-600 mt-1">Save a link to your vault</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Resource"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-semibold text-gray-700 mb-2">
              Link
            </label>
            <div className="flex gap-2">
              <input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={handleAutofill}
                disabled={autoLoading}
                className="inline-flex items-center gap-2 bg-gray-100 px-3 rounded-md border border-gray-200 text-sm"
              >
                {autoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Autofill'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-2">
              Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a description or note about this resource..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-semibold text-gray-700 mb-2">
              Tag
            </label>
            <select
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
            >
              {PREDEFINED_TAGS.map((tagOption) => (
                <option key={tagOption} value={tagOption}>
                  {tagOption}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="isPublic" className="font-semibold text-gray-700">
                  Make this resource public
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Public resources can be viewed by others in Shared Dump
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isPublic ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Resource added successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Resource
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
