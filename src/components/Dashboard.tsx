import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Edit, ExternalLink, Filter, Globe, Loader2, Lock, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { EditResource } from './EditResource';

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

export function Dashboard() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (user) {
      loadResources();
    }
  }, [user]);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedTag, resources]);

  const loadResources = async () => {
    setLoading(true);
    const q = query(collection(db, 'resources'), where('user_id', '==', user!.uid), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Resource[];
    setResources(data);
    const uniqueTags = Array.from(new Set(data.map(r => r.tag)));
    setTags(uniqueTags);
    setLoading(false);
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

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await deleteDoc(doc(db, 'resources', id));
      loadResources();
    } catch (error) {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {editingResource && (
        <EditResource
          resource={editingResource}
          onSuccess={() => {
            setEditingResource(null);
            loadResources();
          }}
          onCancel={() => setEditingResource(null)}
        />
      )}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
            <p className="text-gray-600 mt-1">{resources.length} total resources</p>
          </div>
        </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources..."
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">
            {resources.length === 0
              ? "Start by adding your first resource!"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {resource.tag}
                  </span>
                  {resource.is_public ? (
                    <Globe className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingResource(resource)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit resource"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>

              {resource.note && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.note}</p>
              )}

              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Link
              </a>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                {new Date(resource.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
