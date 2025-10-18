'use client'

import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { CheckCircle, ExternalLink, Filter, Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

// Helper function to safely format dates
function formatDate(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle string dates or timestamps
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

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

export function SharedDump() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadPublicResources();
    loadUserResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedTag, resources]);

  const loadPublicResources = async () => {
    setLoading(true);
    try {
      // Try the optimal query first (requires the composite index)
      const q = query(
        collection(db, 'resources'), 
        where('is_public', '==', true), 
        where('user_id', '!=', user!.uid), 
        orderBy('user_id'), 
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Resource[];
      setResources(data);
      const uniqueTags = Array.from(new Set(data.map(r => r.tag)));
      setTags(uniqueTags);
    } catch (error) {
      console.log("Index not ready yet, using fallback query");
      
      // Fallback query: Get all public resources and filter client-side
      const fallbackQuery = query(
        collection(db, 'resources'),
        where('is_public', '==', true)
      );
      
      const querySnapshot = await getDocs(fallbackQuery);
      
      // Filter out the current user's resources and sort manually
      const allData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Resource[];
      const filteredData = allData.filter(item => item.user_id !== user!.uid);
      
      // Manual sorting by created_at in descending order
      filteredData.sort((a, b) => {
        const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
        const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
      
      setResources(filteredData);
      const uniqueTags = Array.from(new Set(filteredData.map(r => r.tag)));
      setTags(uniqueTags);
    }
    setLoading(false);
  };

  const loadUserResources = async () => {
    const q = query(collection(db, 'resources'), where('user_id', '==', user!.uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data());
    const links = new Set(data.map((r: any) => r.link));
    setSavedResources(links);
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(query) ||
          r.note?.toLowerCase().includes(query) ||
          r.link.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(r => r.tag === selectedTag);
    }

    setFilteredResources(filtered);
  };

  const saveToMyDump = async (resource: Resource) => {
    setSavingId(resource.id);

    try {
      await addDoc(collection(db, 'resources'), {
        user_id: user!.uid,
        title: resource.title,
        link: resource.link,
        note: resource.note,
        tag: resource.tag,
        is_public: false,
        created_at: new Date(),
      });
      setSavedResources(new Set([...savedResources, resource.link]));
    } catch (error) {
      // handle error
    }

    setSavingId(null);
  };

  const isResourceSaved = (link: string) => savedResources.has(link);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Shared Dump</h2>
          <p className="text-gray-600 mt-1">Discover public resources from the community</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search public resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No public resources found</h3>
          <p className="text-gray-600">
            {resources.length === 0
              ? "No one has shared resources yet. Be the first!"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => {
            const isSaved = isResourceSaved(resource.link);
            const isSaving = savingId === resource.id;

            return (
              <div
                key={resource.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    {resource.tag}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>

                {resource.note && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.note}</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Link
                  </a>
                </div>

                <button
                  onClick={() => !isSaved && saveToMyDump(resource)}
                  disabled={isSaved || isSaving}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-green-50 text-green-700 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Save to My Dump
                    </>
                  )}
                </button>

                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  {formatDate(resource.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
