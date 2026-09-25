import React, { useState, useEffect } from 'react';
import { adminService, placeService, postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  PlusCircle,
  Landmark,
  Users,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Edit3,
  X,
  Star,
  Sparkles,
  Film,
  Music,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [places, setPlaces] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add Place Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'monument',
    state: '',
    shortDescription: '',
    fullStory: '',
    latitude: '',
    longitude: '',
    coverImage: '',
    youtubeVideoId: '',
    mediaLinks: [],
  });

  const handleAiAutoDiscover = async (target = 'add') => {
    const isEdit = target === 'edit';
    const currentName = isEdit ? editingPlace?.name : formData.name;
    const currentState = isEdit ? editingPlace?.state : formData.state;
    const currentCategory = isEdit ? editingPlace?.category : formData.category;

    if (!currentName || !currentName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a Monument / Site Name first to run AI auto-discovery.',
      });
      return;
    }

    setAiLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await adminService.aiDiscover({
        placeName: currentName,
        state: currentState,
        category: currentCategory,
      });

      if (res.success && res.data) {
        if (isEdit) {
          setEditingPlace((prev) => ({
            ...prev,
            shortDescription: res.data.shortDescription || prev.shortDescription,
            fullStory: res.data.fullStory || prev.fullStory,
            youtubeVideoId: res.data.youtubeVideoId || prev.youtubeVideoId,
            mediaLinks: res.data.mediaLinks || prev.mediaLinks || [],
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            shortDescription: res.data.shortDescription || prev.shortDescription,
            fullStory: res.data.fullStory || prev.fullStory,
            youtubeVideoId: res.data.youtubeVideoId || prev.youtubeVideoId,
            mediaLinks: res.data.mediaLinks || prev.mediaLinks,
          }));
        }

        setFeedback({
          type: 'success',
          message: `✨ AI auto-discovered cultural story, YouTube documentary, and related movies/songs for "${currentName}"!`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'AI discovery failed. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, placesRes, feedRes] = await Promise.all([
        adminService.getStats().catch(() => ({ success: false })),
        placeService.getAll().catch(() => ({ success: false })),
        postService.getFeed().catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (placesRes.success) setPlaces(placesRes.places);
      if (feedRes.success) setRecentPosts(feedRes.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'mediaLinks') {
          if (formData.mediaLinks && formData.mediaLinks.length > 0) {
            payload.append('mediaLinks', JSON.stringify(formData.mediaLinks));
          }
        } else {
          payload.append(key, formData[key]);
        }
      });

      const res = await adminService.createPlace(payload);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Heritage site added successfully!' });
        setShowAddForm(false);
        setFormData({
          name: '',
          category: 'monument',
          state: '',
          shortDescription: '',
          fullStory: '',
          latitude: '',
          longitude: '',
          coverImage: '',
          youtubeVideoId: '',
          mediaLinks: [],
        });
        loadData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to add place.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error occurred while saving.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (place) => {
    setEditingPlace({
      id: place.id,
      name: place.name,
      category: place.category,
      state: place.state || '',
      shortDescription: place.shortDescription,
      fullStory: place.fullStory,
      latitude: place.latitude,
      longitude: place.longitude,
      coverImage: place.coverImage,
      youtubeVideoId: place.youtubeVideoId || '',
      mediaLinks: place.mediaLinks ? JSON.parse(JSON.stringify(place.mediaLinks)) : [],
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlace) return;
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = new FormData();
      Object.keys(editingPlace).forEach((key) => {
        if (key === 'mediaLinks') {
          payload.append('mediaLinks', JSON.stringify(editingPlace.mediaLinks || []));
        } else if (key !== 'id') {
          payload.append(key, editingPlace[key]);
        }
      });

      const res = await adminService.updatePlace(editingPlace.id, payload);
      if (res.success) {
        setFeedback({ type: 'success', message: `Updated "${editingPlace.name}" and cultural media links successfully!` });
        setEditingPlace(null);
        loadData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to update place.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error updating place.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderMediaLinksEditor = (target) => {
    const isEdit = target === 'edit';
    const currentList = isEdit ? editingPlace?.mediaLinks || [] : formData.mediaLinks || [];

    const updateItem = (index, field, value) => {
      const updated = [...currentList];
      updated[index] = { ...updated[index], [field]: value };
      if (isEdit) {
        setEditingPlace({ ...editingPlace, mediaLinks: updated });
      } else {
        setFormData({ ...formData, mediaLinks: updated });
      }
    };

    const removeItem = (index) => {
      const updated = currentList.filter((_, i) => i !== index);
      if (isEdit) {
        setEditingPlace({ ...editingPlace, mediaLinks: updated });
      } else {
        setFormData({ ...formData, mediaLinks: updated });
      }
    };

    const addItem = () => {
      const newItem = {
        type: 'movie',
        title: '',
        youtubeUrl: '',
        thumbnailUrl: '',
      };
      if (isEdit) {
        setEditingPlace({ ...editingPlace, mediaLinks: [...currentList, newItem] });
      } else {
        setFormData({ ...formData, mediaLinks: [...currentList, newItem] });
      }
    };

    return (
      <div className="bg-stone-50/95 p-4 sm:p-5 rounded-2xl border border-stone-200/90 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Folklore, Cinema & Melodies ({currentList.length})
              </h4>
              <p className="text-[11px] text-stone-500">
                Movies filmed here, folk anthems, and architectural documentaries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-heritage-600" />
            <span>Add Media Link</span>
          </button>
        </div>

        {currentList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center bg-white/70">
            <p className="text-xs text-stone-500 font-medium">
              No cultural media links configured yet.
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Click "+ Add Media Link" above or use "✨ AI Re-Discover" to auto-fetch songs & movies!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={item.type || 'documentary'}
                      onChange={(e) => updateItem(idx, 'type', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold bg-stone-50 text-stone-700 focus:outline-none"
                    >
                      <option value="movie">🎬 Cinema / Movie</option>
                      <option value="song">🎵 Traditional Song</option>
                      <option value="documentary">🏛️ Documentary</option>
                    </select>

                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      placeholder="Title (e.g. Jodhaa Akbar scene / Ganga Aarti Theme)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-800 placeholder-stone-400 font-medium focus:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Remove this media link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={item.youtubeUrl || ''}
                    onChange={(e) => updateItem(idx, 'youtubeUrl', e.target.value)}
                    placeholder="YouTube URL (https://www.youtube.com/...)"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-800 placeholder-stone-400 focus:bg-white"
                    required
                  />
                  <input
                    type="url"
                    value={item.thumbnailUrl || ''}
                    onChange={(e) => updateItem(idx, 'thumbnailUrl', e.target.value)}
                    placeholder="Thumbnail Image URL (optional)"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-800 placeholder-stone-400 focus:bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await adminService.deletePlace(id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Deleted ${name} successfully!` });
        loadData();
      }
    } catch (err) {
      alert('Failed to delete place');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this visitor photo/review?')) return;
    try {
      const res = await postService.delete(postId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Visitor post removed.' });
        loadData();
      }
    } catch (err) {
      alert('Failed to delete visitor post');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 shadow-md text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-stone-900">Admin Authentication Required</h2>
          <p className="text-xs text-stone-500">
            Please log in with the admin account (<code className="bg-stone-100 px-1 py-0.5 rounded text-heritage-600">admin@heritage.gov.in</code> / password: <code className="bg-stone-100 px-1 py-0.5 rounded text-heritage-600">password123</code>).
          </p>
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-stone-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-heritage-600" />
              <span>Heritage Admin Dashboard</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage heritage places, monitor visitor photos, and publish verified cultural chronicles
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-heritage-600 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Close Add Form' : 'Add Heritage Site'}</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500">Total Heritage Sites</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalPlaces}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500">Registered Users</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500">Visitor Posts & Ratings</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalPosts}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Add Heritage Site Form */}
        {showAddForm && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-lg space-y-6">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Add New Heritage Place
              </h3>
              <p className="text-xs text-stone-500">
                Enter site coordinates, story, and media links. It will instantly appear on the map and feed!
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* AI Cultural Assistant Trigger Banner */}
              <div className="bg-gradient-to-r from-amber-50 via-heritage-50 to-orange-50 border border-heritage-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-heritage-800">
                    <Sparkles className="w-4 h-4 text-heritage-600 animate-pulse" />
                    <span>AI Cultural Link & Folklore Discovery</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Type site name & state, then click to auto-generate stories, YouTube documentary, and related movies/songs!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAiAutoDiscover('add')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-heritage-600 to-heritage-500 hover:from-heritage-700 hover:to-heritage-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 disabled:opacity-50 whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{aiLoading ? 'Searching Archives...' : '✨ AI Auto-Discover Media'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Monument / Site Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Khajuraho Temples"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  >
                    <option value="monument">Monument</option>
                    <option value="temple">Temple</option>
                    <option value="fort">Fort</option>
                    <option value="festival">Festival / Ghats</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Latitude (Decimal) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 24.8318"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Longitude (Decimal) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g. 79.9199"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Media & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    YouTube Video ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="youtubeVideoId"
                    value={formData.youtubeVideoId}
                    onChange={handleChange}
                    placeholder="e.g. i9E_Bl4E6nE"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Short Description (2-3 sentences for cards) *
                </label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Overview shown in map popup and feed cards..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  required
                />
              </div>

              {/* Full Story */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Full Story & Cultural Significance *
                </label>
                <textarea
                  name="fullStory"
                  rows={5}
                  value={formData.fullStory}
                  onChange={handleChange}
                  placeholder="Detailed history, architecture, legends, and significance (will be read aloud by the AI audio guide)..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  required
                />
              </div>

              {/* Folklore, Cinema & Melodies Interactive Manager */}
              {renderMediaLinksEditor('add')}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Heritage Site</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Modal */}
        {editingPlace && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Edit Site: {editingPlace.name}
                </h3>
                <button
                  onClick={() => setEditingPlace(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AI Auto-Discover trigger inside Edit Modal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs">
                <span className="text-amber-900 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Auto-fill or refresh story & video with AI
                </span>
                <button
                  type="button"
                  onClick={() => handleAiAutoDiscover('edit')}
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center gap-1 transition-colors"
                >
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>AI Re-Discover</span>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Place Name
                    </label>
                    <input
                      type="text"
                      value={editingPlace.name}
                      onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={editingPlace.category}
                      onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    >
                      <option value="monument">Monument</option>
                      <option value="temple">Temple</option>
                      <option value="fort">Fort</option>
                      <option value="festival">Festival / Ghats</option>
                      <option value="natural">Natural</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editingPlace.latitude}
                      onChange={(e) => setEditingPlace({ ...editingPlace, latitude: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editingPlace.longitude}
                      onChange={(e) => setEditingPlace({ ...editingPlace, longitude: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={editingPlace.coverImage}
                    onChange={(e) => setEditingPlace({ ...editingPlace, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    YouTube Video ID
                  </label>
                  <input
                    type="text"
                    value={editingPlace.youtubeVideoId}
                    onChange={(e) => setEditingPlace({ ...editingPlace, youtubeVideoId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingPlace.shortDescription}
                    onChange={(e) => setEditingPlace({ ...editingPlace, shortDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Full Story (AI Audio Narration reads this)
                  </label>
                  <textarea
                    rows={4}
                    value={editingPlace.fullStory}
                    onChange={(e) => setEditingPlace({ ...editingPlace, fullStory: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    required
                  />
                </div>

                {/* Folklore, Cinema & Melodies Interactive Manager */}
                {renderMediaLinksEditor('edit')}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlace(null)}
                    className="px-4 py-2 text-sm text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Update Heritage Site</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Places Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-900">Manage Heritage Sites</h3>
            <span className="text-xs text-stone-500">{places.length} Total Places</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Place</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">State</th>
                  <th className="p-4">Coordinates</th>
                  <th className="p-4">Reviews</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {places.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.coverImage}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-stone-900">{p.name}</div>
                        <div className="text-[10px] text-stone-600 font-normal">slug: {p.slug}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4">{p.state || 'India'}</td>
                    <td className="p-4 font-mono text-stone-600">
                      {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                    </td>
                    <td className="p-4">{p.postsCount || 0} posts</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/place/${p.slug}`}
                          className="p-1.5 text-stone-600 hover:text-heritage-600"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-stone-600 hover:text-blue-600"
                          title="Edit Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-stone-600 hover:text-red-600"
                          title="Delete Place"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visitor Community Photos Moderation Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Visitor Photos & Community Reviews Moderation
              </h3>
              <p className="text-xs text-stone-500">Monitor and remove inappropriate user photos or spam</p>
            </div>
            <span className="text-xs text-stone-500">{recentPosts.length} Recent Reviews</span>
          </div>

          <div className="p-6">
            {recentPosts.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">No visitor posts to moderate yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${post.user?.name}`}
                            alt={post.user?.name}
                            className="w-7 h-7 rounded-full border border-stone-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-stone-900">{post.user?.name}</p>
                            <p className="text-[10px] text-stone-500">at {post.place?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{post.rating}</span>
                        </div>
                      </div>

                      {post.imageUrl && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-stone-200 mb-2">
                          <img src={post.imageUrl} alt="Review" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {post.caption && (
                        <p className="text-xs text-stone-600 italic">"{post.caption}"</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Inappropriate Post</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
