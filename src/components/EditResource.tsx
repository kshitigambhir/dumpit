'use client'

import { doc, updateDoc } from 'firebase/firestore';
import { CheckCircle, Loader2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { db } from '../lib/firebase';

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

interface Resource {
  id: string;
  user_id: string;
  title: string;
  link: string;
  note?: string;
  tag: string;
  is_public: boolean;
  created_at: Date;
}

interface EditResourceProps {
  resource: Resource;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditResource({ resource, onSuccess, onCancel }: EditResourceProps) {
  const [title, setTitle] = useState(resource.title);
  const [link, setLink] = useState(resource.link);
  const [note, setNote] = useState(resource.note || '');
  const [tag, setTag] = useState(resource.tag);
  const [isPublic, setIsPublic] = useState(resource.is_public);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

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
      const docRef = doc(db, 'resources', resource.id);
      await updateDoc(docRef, {
        title,
        link,
        note: note.trim() || null,
        tag,
        is_public: isPublic,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1000);
    } catch (error) {
      setError('Failed to update resource. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Resource</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
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
              <label htmlFor="link" className="block text-sm font-semibold text-gray-700 mb-2">Link</label>
              <input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-2">Note (optional)</label>
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
              <label htmlFor="tag" className="block text-sm font-semibold text-gray-700 mb-2">Tag</label>
              <select
                id="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
              >
                {PREDEFINED_TAGS.map((tagOption) => (
                  <option key={tagOption} value={tagOption}>{tagOption}</option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="isPublic" className="font-semibold text-gray-700">Make this resource public</label>
                  <p className="text-sm text-gray-600 mt-1">Public resources can be viewed by others in Shared Dump</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Resource updated successfully!
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowComingSoon(true)}
                className="flex-1 bg-yellow-100 text-yellow-700 py-3 px-4 rounded-lg font-semibold hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
              >
                AI Generate (Coming Soon)
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        {showComingSoon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Coming Soon</h3>
              <p className="text-gray-700 mb-4">
                The AI Generate feature will allow you to automatically enrich your resources with intelligent summaries and metadata.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Save time by automating metadata generation.</li>
                <li>Get intelligent summaries tailored to your content.</li>
                <li>Enhance resource discoverability with AI-driven tags.</li>
              </ul>
              <button
                onClick={() => setShowComingSoon(false)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
