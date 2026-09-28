import React, { useState, useEffect } from 'react';
import {
  adminService,
  placeService,
  postService,
  foodService,
  artisanVerificationService,
  supportService,
  setLocalCachedData,
  getLocalCachedData,
} from '../services/api';
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
  Utensils,
  Soup,
  Coffee,
  Tag,
  MapPin,
  Info,
  Store,
  Award,
  BadgeCheck,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  Upload,
  Image as ImageIcon,
  HelpCircle,
  Mail,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  const { user, isAdmin, login } = useAuth();
  const [stats, setStats] = useState(null);
  const [places, setPlaces] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [aiLoading, setAiLoading] = useState(false);

  // Image Upload States (Supports offline & local file upload)
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [editingCoverImageFile, setEditingCoverImageFile] = useState(null);
  const [editingCoverImagePreview, setEditingCoverImagePreview] = useState('');
  const [foodImageFile, setFoodImageFile] = useState(null);
  const [foodImagePreview, setFoodImagePreview] = useState('');

  // Artisan & Workshop Verification State (Admin Approvals)
  const [artisanApps, setArtisanApps] = useState([]);
  const [artisanFilter, setArtisanFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  // Tourist Support & Grievance Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'open' | 'in_review' | 'resolved'
  const [ticketSearch, setTicketSearch] = useState('');
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [ticketStatusUpdating, setTicketStatusUpdating] = useState(false);

  // Food / Culinary Heritage State (Admin-Only)
  const [foodList, setFoodList] = useState([]);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [foodSubmitting, setFoodSubmitting] = useState(false);
  const [foodFormData, setFoodFormData] = useState({
    placeId: '',
    name: '',
    nameHi: '',
    categoryType: 'Iconic Royal Sweet',
    categoryTypeHi: 'शाही मिष्ठान',
    diet: 'veg',
    famousSince: '',
    shortLore: '',
    shortLoreHi: '',
    famousSpots: '',
    famousSpotsHi: '',
    priceRange: '₹50 - ₹150',
    imageUrl: '',
  });

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
      const [statsRes, placesRes, feedRes, foodRes, appsRes, ticketsRes] = await Promise.all([
        adminService.getStats().catch(() => ({ success: false })),
        placeService.getAll().catch(() => ({ success: false })),
        postService.getFeed().catch(() => ({ success: false })),
        foodService.getAll().catch(() => ({ success: false })),
        artisanVerificationService.getAll().catch(() => ({ success: false })),
        supportService.getAll().catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (placesRes.success) setPlaces(placesRes.places);
      if (feedRes.success) setRecentPosts(feedRes.posts);
      if (foodRes.success) setFoodList(foodRes.foods || []);
      if (appsRes.success) setArtisanApps(appsRes.applications || []);
      if (ticketsRes.success) setSupportTickets(ticketsRes.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    setTicketStatusUpdating(true);
    try {
      const res = await supportService.updateStatus(ticketId, newStatus);
      if (res.success) {
        setSupportTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId || t.ticketNumber === ticketId
              ? {
                  ...t,
                  status: newStatus,
                  statusHi: newStatus === 'RESOLVED' ? 'निस्तारित' : newStatus === 'IN_REVIEW' ? 'समीक्षाधीन' : 'खुला',
                }
              : t
          )
        );
        if (selectedTicketModal && (selectedTicketModal.id === ticketId || selectedTicketModal.ticketNumber === ticketId)) {
          setSelectedTicketModal((prev) => ({ ...prev, status: newStatus }));
        }
        setFeedback({
          type: 'success',
          message: `Ticket status updated to "${newStatus}" successfully!`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update ticket status.' });
    } finally {
      setTicketStatusUpdating(false);
    }
  };

  const handleDeleteTicket = async (ticketId, ticketNumber) => {
    if (!window.confirm(`Are you sure you want to delete support ticket ${ticketNumber || ticketId}?`)) return;
    try {
      const res = await supportService.delete(ticketId);
      if (res.success) {
        setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId && t.ticketNumber !== ticketId));
        if (selectedTicketModal && (selectedTicketModal.id === ticketId || selectedTicketModal.ticketNumber === ticketId)) {
          setSelectedTicketModal(null);
        }
        setFeedback({ type: 'success', message: `Ticket ${ticketNumber || ticketId} removed.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete ticket.' });
    }
  };

  const handleApproveArtisan = async (applicationId, artisanName) => {
    try {
      const res = await artisanVerificationService.updateStatus(
        applicationId,
        'APPROVED',
        'Physical workshop proximity & Pehchan ID verified by Tourism Administration.'
      );
      if (res.success) {
        setArtisanApps(res.applications);
        setFeedback({
          type: 'success',
          message: `Artisan "${artisanName}" has been successfully approved! They can now choose a subscription plan and list crafts.`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to approve artisan application.' });
    }
  };

  const handleRejectArtisan = async (applicationId, artisanName) => {
    const reason = window.prompt(`Please enter rejection reason for "${artisanName}":`, 'Workshop address or credentials verification incomplete.');
    if (reason === null) return;
    try {
      const res = await artisanVerificationService.updateStatus(
        applicationId,
        'REJECTED',
        reason || 'Application rejected by Administration.'
      );
      if (res.success) {
        setArtisanApps(res.applications);
        setFeedback({
          type: 'error',
          message: `Application for "${artisanName}" has been rejected.`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update application status.' });
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    if (!foodFormData.placeId || !foodFormData.name.trim()) {
      setFeedback({ type: 'error', message: 'Please select an associated monument and enter the food name.' });
      return;
    }
    setFoodSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const selectedPlace = places.find((p) => String(p.id) === String(foodFormData.placeId));
      const payload = new FormData();
      Object.keys(foodFormData).forEach((key) => {
        if (foodFormData[key] !== undefined && foodFormData[key] !== null) {
          payload.append(key, foodFormData[key]);
        }
      });
      payload.append('monumentName', selectedPlace ? selectedPlace.name : 'Heritage Monument');
      if (foodImageFile) {
        payload.append('image', foodImageFile);
      }

      const res = await foodService.create(payload);
      if (res.success) {
        setFeedback({ type: 'success', message: `Added famous regional delicacy "${foodFormData.name}" successfully!` });
        setShowAddFoodModal(false);
        setFoodImageFile(null);
        setFoodImagePreview('');
        setFoodFormData({
          placeId: '',
          name: '',
          nameHi: '',
          categoryType: 'Iconic Royal Sweet',
          categoryTypeHi: 'शाही मिष्ठान',
          diet: 'veg',
          famousSince: '',
          shortLore: '',
          shortLoreHi: '',
          famousSpots: '',
          famousSpotsHi: '',
          priceRange: '₹50 - ₹150',
          imageUrl: '',
        });
        // Sync with local offline cache
        if (res.food) {
          const currentCached = getLocalCachedData('foods', []);
          setLocalCachedData('foods', [res.food, ...currentCached]);
        }
        loadData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to add food item.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error creating food item.' });
    } finally {
      setFoodSubmitting(false);
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from regional culinary heritage guide?`)) return;
    try {
      const res = await foodService.delete(id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Deleted "${name}" from food guide.` });
        loadData();
      }
    } catch (err) {
      alert('Failed to delete food item');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }

    const handleTicketCreated = () => {
      supportService.getAll().then((res) => {
        if (res.success && res.tickets) {
          setSupportTickets(res.tickets);
        }
      });
    };
    window.addEventListener('sanskriti_ticket_created', handleTicketCreated);
    return () => {
      window.removeEventListener('sanskriti_ticket_created', handleTicketCreated);
    };
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
        } else if (key !== 'coverImage') {
          payload.append(key, formData[key]);
        }
      });

      // Attach file or URL
      if (coverImageFile) {
        payload.append('coverImage', coverImageFile);
      } else if (formData.coverImage) {
        payload.append('coverImage', formData.coverImage);
      }

      const res = await adminService.createPlace(payload);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Heritage site added successfully!' });
        setShowAddForm(false);
        setCoverImageFile(null);
        setCoverImagePreview('');
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
        // Sync with local offline cache
        if (res.place) {
          const currentCached = getLocalCachedData('places', []);
          setLocalCachedData('places', [res.place, ...currentCached]);
        }
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
    setEditingCoverImageFile(null);
    setEditingCoverImagePreview(place.coverImage || '');
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
        } else if (key !== 'id' && key !== 'coverImage') {
          payload.append(key, editingPlace[key]);
        }
      });

      if (editingCoverImageFile) {
        payload.append('coverImage', editingCoverImageFile);
      } else if (editingPlace.coverImage) {
        payload.append('coverImage', editingPlace.coverImage);
      }

      const res = await adminService.updatePlace(editingPlace.id, payload);
      if (res.success) {
        setFeedback({ type: 'success', message: `Updated "${editingPlace.name}" and cultural media links successfully!` });
        setEditingPlace(null);
        setEditingCoverImageFile(null);
        setEditingCoverImagePreview('');
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
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              onClick={async () => {
                try {
                  await login('admin@heritage.gov.in', 'password123');
                } catch {
                  window.location.href = '/login';
                }
              }}
              className="px-5 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              ⚡ 1-Click Admin Access (Demo)
            </button>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
            >
              Go to Login Page
            </Link>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase">Heritage Sites</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalPlaces}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase">Registered Users</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase">Visitor Reviews</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalPosts}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase">Famous Delicacies</p>
                <h3 className="font-serif text-2xl font-bold text-stone-900">{foodList.length}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase">Artisan Approvals</p>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-2xl font-bold text-stone-900">{artisanApps.length}</h3>
                  {artisanApps.filter((a) => a.status === 'PENDING').length > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      {artisanApps.filter((a) => a.status === 'PENDING').length} Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                const el = document.getElementById('support-tickets-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center gap-3.5 hover:border-amber-400 cursor-pointer transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase">Support Tickets</p>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-2xl font-bold text-stone-900">{supportTickets.length}</h3>
                  {supportTickets.filter((t) => t.status === 'OPEN').length > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      {supportTickets.filter((t) => t.status === 'OPEN').length} New
                    </span>
                  )}
                </div>
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
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase">
                    Cover Photo (File Upload / URL) *
                  </label>

                  {/* Dual Upload / URL Selector */}
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer border border-dashed border-stone-300 transition-colors">
                    <Upload className="w-4 h-4 text-heritage-600" />
                    <span>{coverImageFile ? coverImageFile.name : 'Upload Photo from Device (Offline Ready)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCoverImagePreview(reader.result);
                            setFormData((prev) => ({ ...prev, coverImage: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {coverImagePreview && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                      <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview('');
                          setFormData((prev) => ({ ...prev, coverImage: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase whitespace-nowrap">or web url</span>
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage?.startsWith('data:') ? '' : formData.coverImage}
                      onChange={(e) => {
                        setCoverImageFile(null);
                        setCoverImagePreview(e.target.value);
                        handleChange(e);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
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
                  <p className="text-[10px] text-stone-400 mt-1">
                    Used for virtual tour video link on the monument chronicle page.
                  </p>
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

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase">
                    Cover Photo (File Upload / URL)
                  </label>

                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer border border-dashed border-stone-300 transition-colors">
                    <Upload className="w-4 h-4 text-heritage-600" />
                    <span>{editingCoverImageFile ? editingCoverImageFile.name : 'Change Photo from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditingCoverImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditingCoverImagePreview(reader.result);
                            setEditingPlace((prev) => ({ ...prev, coverImage: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {(editingCoverImagePreview || editingPlace.coverImage) && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                      <img
                        src={editingCoverImagePreview || editingPlace.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase whitespace-nowrap">or web url</span>
                    <input
                      type="url"
                      value={editingPlace.coverImage?.startsWith('data:') ? '' : editingPlace.coverImage}
                      onChange={(e) => {
                        setEditingCoverImageFile(null);
                        setEditingCoverImagePreview(e.target.value);
                        setEditingPlace({ ...editingPlace, coverImage: e.target.value });
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
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

        {/* Regional Food & Culinary Heritage Guide (Admin Curated • Non-Deliverable) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Regional Food & Culinary Heritage Guide (स्थानीय स्वाद धरोहर)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    Admin Curated • Non-Deliverable
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Publish famous regional delicacies, historic street food lore, and recommended local spots for tourists. Strictly non-deliverable.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddFoodModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-2xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Famous Regional Food</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Dish / Delicacy</th>
                  <th className="p-4">Monument / Place</th>
                  <th className="p-4">Category / Type</th>
                  <th className="p-4">Diet</th>
                  <th className="p-4">Where to Taste (Famous Spots)</th>
                  <th className="p-4">Price Range</th>
                  <th className="p-4">Policy Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {foodList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      No culinary heritage items configured yet. Click "Add Famous Regional Food" to curate one!
                    </td>
                  </tr>
                ) : (
                  foodList.map((food) => (
                    <tr key={food.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-2xs flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div>
                          <div className="font-bold text-stone-900">{food.name}</div>
                          {food.nameHi && (
                            <div className="text-[11px] text-amber-800 font-normal">{food.nameHi}</div>
                          )}
                          <div className="text-[10px] text-stone-400 italic">{food.famousSince}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-stone-900">{food.monumentName}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {food.categoryType}
                        </span>
                      </td>
                      <td className="p-4">
                        {food.diet === 'veg' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            🟢 Pure Veg
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            🔴 Non-Veg
                          </span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="text-[11px] text-stone-700 line-clamp-2" title={food.famousSpots}>
                          {food.famousSpots}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-stone-800">
                        {food.priceRange || '₹50 - ₹150'}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                          🚫 Non-Deliverable
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteFood(food.id, food.name)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Food Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Artisan & Physical Shop Verification Approvals (कारीगर सत्यापन एवं दुकान अनुमोदन) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Artisan & Workshop Approvals (कारीगर सत्यापन एवं दुकान अनुमोदन)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-900 border border-purple-200">
                    Admin Approval Gated
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Review artisan applications, verify Ministry Pehchan IDs, and approve physical workshops. Artisans can only purchase subscription plans and list crafts after your approval.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setArtisanFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  artisanFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All ({artisanApps.length})
              </button>
              <button
                onClick={() => setArtisanFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  artisanFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Pending Review ({artisanApps.filter((a) => a.status === 'PENDING').length})</span>
              </button>
              <button
                onClick={() => setArtisanFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  artisanFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Approved ({artisanApps.filter((a) => a.status === 'APPROVED').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Artisan & Workshop</th>
                  <th className="p-4">Govt Pehchan / GI</th>
                  <th className="p-4">Monument & Distance</th>
                  <th className="p-4">Craft Type</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {artisanApps
                  .filter((a) => {
                    if (artisanFilter === 'pending') return a.status === 'PENDING';
                    if (artisanFilter === 'approved') return a.status === 'APPROVED';
                    if (artisanFilter === 'rejected') return a.status === 'REJECTED';
                    return true;
                  })
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-stone-900">{app.shopName}</div>
                        <div className="text-[11px] text-stone-500">{app.artisanName}</div>
                        <div className="text-[10px] text-stone-400 font-mono truncate max-w-xs">{app.shopAddress}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 block w-fit">
                          {app.pehchanId}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block truncate max-w-[150px]">
                          {app.giRegNumber || 'GI Verified'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-stone-800">{app.monumentName}</div>
                        <div className="text-[10px] text-stone-500 truncate max-w-xs">{app.shopLandmark}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold text-[10px]">
                          {app.craftType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-stone-800">{app.phone}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">WhatsApp Active</div>
                      </td>
                      <td className="p-4">
                        {app.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved & Certified</span>
                          </span>
                        ) : app.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span>Admin Review Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedAppModal(app)}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                            title="View Full Application Dossier"
                          >
                            Dossier
                          </button>
                          {app.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveArtisan(app.id, app.artisanName)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectArtisan(app.id, app.artisanName)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === 'APPROVED' && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              Unlocked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tourist Support & Grievance Tickets (पर्यटक सहायता एवं शिकायत निवारण) */}
        <div id="support-tickets-section" className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden scroll-mt-6">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Tourist Support & Grievance Tickets (पर्यटक सहायता एवं शिकायत निवारण)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                    Real-Time Support
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Review reported app bugs, handicraft order issues, missing monument requests, and general feedback submitted by tourists.
                </p>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTicketFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticketFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All ({supportTickets.length})
              </button>
              <button
                onClick={() => setTicketFilter('open')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ticketFilter === 'open'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Open ({supportTickets.filter((t) => t.status === 'OPEN').length})</span>
              </button>
              <button
                onClick={() => setTicketFilter('in_review')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticketFilter === 'in_review'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                In Review ({supportTickets.filter((t) => t.status === 'IN_REVIEW').length})
              </button>
              <button
                onClick={() => setTicketFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticketFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Resolved ({supportTickets.filter((t) => t.status === 'RESOLVED').length})
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-amber-500 w-36 sm:w-48"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
              </div>

              <button
                onClick={async () => {
                  const res = await supportService.getAll();
                  if (res.success) setSupportTickets(res.tickets || []);
                }}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                title="Refresh Tickets"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Ticket Number</th>
                  <th className="p-4">Category & Priority</th>
                  <th className="p-4">Tourist Contact</th>
                  <th className="p-4">Subject & Issue Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {supportTickets
                  .filter((t) => {
                    if (ticketFilter === 'open') return t.status === 'OPEN';
                    if (ticketFilter === 'in_review') return t.status === 'IN_REVIEW';
                    if (ticketFilter === 'resolved') return t.status === 'RESOLVED';
                    return true;
                  })
                  .filter((t) => {
                    if (!ticketSearch.trim()) return true;
                    const q = ticketSearch.toLowerCase();
                    return (
                      (t.ticketNumber || '').toLowerCase().includes(q) ||
                      (t.subject || '').toLowerCase().includes(q) ||
                      (t.category || '').toLowerCase().includes(q) ||
                      (t.description || '').toLowerCase().includes(q) ||
                      (t.contactEmail || '').toLowerCase().includes(q) ||
                      (t.contactPhone || '').toLowerCase().includes(q) ||
                      (t.referenceId || '').toLowerCase().includes(q)
                    );
                  })
                  .map((ticket) => (
                    <tr key={ticket.id || ticket.ticketNumber} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-900">
                        <span className="bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 block w-fit">
                          {ticket.ticketNumber || ticket.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-stone-900">{ticket.category}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ticket.priority === 'urgent'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : ticket.priority === 'high'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {ticket.priority || 'normal'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-stone-800 font-medium">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{ticket.contactEmail || 'N/A'}</span>
                        </div>
                        {ticket.contactPhone && (
                          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{ticket.contactPhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="font-bold text-stone-900 line-clamp-1">{ticket.subject}</div>
                        <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{ticket.description}</div>
                        {ticket.referenceId && (
                          <div className="mt-1 text-[10px] font-mono text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded w-fit border border-amber-200/50">
                            Ref: {ticket.referenceId}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-stone-500 whitespace-nowrap">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="p-4">
                        {ticket.status === 'RESOLVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Resolved (निस्तारित)</span>
                          </span>
                        ) : ticket.status === 'IN_REVIEW' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>In Review (समीक्षाधीन)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span>Open (खुला)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTicketModal(ticket)}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            Details
                          </button>
                          {ticket.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticket.id || ticket.ticketNumber, 'RESOLVED')}
                              disabled={ticketStatusUpdating}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="Mark as Resolved"
                            >
                              <Check className="w-3 h-3" />
                              <span className="hidden sm:inline">Resolve</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTicket(ticket.id || ticket.ticketNumber, ticket.ticketNumber)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {supportTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      No support tickets registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: View Support Ticket Details */}
        {selectedTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Support Ticket Dossier
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      {selectedTicketModal.ticketNumber || selectedTicketModal.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicketModal(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-bold text-stone-900">{selectedTicketModal.category}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Priority</span>
                    <span className="font-bold uppercase text-amber-800">{selectedTicketModal.priority || 'Normal'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Contact Email</span>
                    <span className="font-semibold text-stone-800">{selectedTicketModal.contactEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Contact Phone</span>
                    <span className="font-semibold text-stone-800">{selectedTicketModal.contactPhone || 'N/A'}</span>
                  </div>
                  {selectedTicketModal.referenceId && (
                    <div className="col-span-2">
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">Reference Identifier</span>
                      <span className="font-mono text-amber-900 font-semibold">{selectedTicketModal.referenceId}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">Subject</span>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 font-bold text-stone-900">
                    {selectedTicketModal.subject}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">Issue Description</span>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTicketModal.description}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 font-bold">Change Status:</span>
                    <select
                      value={selectedTicketModal.status || 'OPEN'}
                      onChange={(e) => handleUpdateTicketStatus(selectedTicketModal.id || selectedTicketModal.ticketNumber, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 font-bold text-stone-800 bg-white"
                    >
                      <option value="OPEN">🟡 Open (खुला)</option>
                      <option value="IN_REVIEW">🔵 In Review (समीक्षाधीन)</option>
                      <option value="RESOLVED">🟢 Resolved (निस्तारित)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateTicketStatus(selectedTicketModal.id || selectedTicketModal.ticketNumber, 'RESOLVED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => setSelectedTicketModal(null)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Famous Regional Food (Admin Only) */}
        {showAddFoodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Add Famous Regional Delicacy
                    </h3>
                    <p className="text-xs text-stone-500">
                      Curate culinary heritage for tourists to discover on monument pages
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Policy:</strong> Food items added here will be published strictly as <strong>Non-Deliverable</strong>. Tourists will explore their historical lore, origin story, and where to taste them in person near the monument.
                </span>
              </div>

              <form onSubmit={handleCreateFood} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Associated Heritage Monument / Place *
                    </label>
                    <select
                      required
                      value={foodFormData.placeId}
                      onChange={(e) => setFoodFormData({ ...foodFormData, placeId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">-- Select Heritage Monument --</option>
                      {places.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.state})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Diet Classification *
                    </label>
                    <select
                      value={foodFormData.diet}
                      onChange={(e) => setFoodFormData({ ...foodFormData, diet: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="veg">🟢 Pure Vegetarian</option>
                      <option value="non-veg">🔴 Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Delicacy / Dish Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Agra Petha (Kesar & Angoori)"
                      value={foodFormData.name}
                      onChange={(e) => setFoodFormData({ ...foodFormData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Delicacy Name (Hindi / स्थानीय नाम)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. आगरा का पेठा (केसर व अंगूरी)"
                      value={foodFormData.nameHi}
                      onChange={(e) => setFoodFormData({ ...foodFormData, nameHi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Category Type</label>
                    <select
                      value={foodFormData.categoryType}
                      onChange={(e) => setFoodFormData({ ...foodFormData, categoryType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Iconic Royal Sweet">Iconic Royal Sweet</option>
                      <option value="Traditional Breakfast & Savory">Traditional Breakfast & Savory</option>
                      <option value="Famous Heritage Street Food">Famous Heritage Street Food</option>
                      <option value="Royal Slow-Cooked Stew">Royal Slow-Cooked Stew</option>
                      <option value="Traditional Thali & Meal">Traditional Thali & Meal</option>
                      <option value="Aromatic Digestive / Beverage">Aromatic Digestive / Beverage</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Famous Since / Era</label>
                    <input
                      type="text"
                      placeholder="e.g. Mughal Era (1632 AD)"
                      value={foodFormData.famousSince}
                      onChange={(e) => setFoodFormData({ ...foodFormData, famousSince: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Approximate Tourist Price</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹60 - ₹180 / plate"
                      value={foodFormData.priceRange}
                      onChange={(e) => setFoodFormData({ ...foodFormData, priceRange: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Iconic Local Spots / Where Tourists Can Taste (कहाँ मिलेगा) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panchhi Petha (Sadar Bazaar & Hari Parbat), Noori Gate, Agra"
                    value={foodFormData.famousSpots}
                    onChange={(e) => setFoodFormData({ ...foodFormData, famousSpots: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Historical Lore & Cultural Significance (इतिहास व महत्व)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how this food originated, royal kitchen background, or traditional method..."
                    value={foodFormData.shortLore}
                    onChange={(e) => setFoodFormData({ ...foodFormData, shortLore: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">
                    Dish Photo (File Upload / URL)
                  </label>

                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer border border-dashed border-stone-300 transition-colors">
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span>{foodImageFile ? foodImageFile.name : 'Upload Dish Photo from Device (Offline Ready)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFoodImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFoodImagePreview(reader.result);
                            setFoodFormData((prev) => ({ ...prev, imageUrl: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {foodImagePreview && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                      <img src={foodImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFoodImageFile(null);
                          setFoodImagePreview('');
                          setFoodFormData((prev) => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase whitespace-nowrap">or web url</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={foodFormData.imageUrl?.startsWith('data:') ? '' : foodFormData.imageUrl}
                      onChange={(e) => {
                        setFoodImageFile(null);
                        setFoodImagePreview(e.target.value);
                        setFoodFormData({ ...foodFormData, imageUrl: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFoodModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={foodSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {foodSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish Famous Food Guide</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Full Artisan Shop Application Dossier */}
        {selectedAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Artisan & Workshop Dossier
                    </h3>
                    <p className="text-xs text-stone-500">
                      Application ID: <span className="font-mono font-bold text-stone-700">{selectedAppModal.id}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAppModal(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Header Bar */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">Verification Status:</span>
                  <span className="font-bold text-stone-900">
                    {selectedAppModal.status === 'APPROVED' && '🟢 Approved & Certified Partner'}
                    {selectedAppModal.status === 'PENDING' && '🟡 Pending Administrative Physical Audit'}
                    {selectedAppModal.status === 'REJECTED' && '🔴 Rejected by Administration'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px]">Submission Date:</span>
                  <span className="font-mono text-stone-700">{selectedAppModal.submissionDate}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Shop & Workshop</span>
                  <div className="font-bold text-stone-900 text-sm">{selectedAppModal.shopName}</div>
                  <div className="text-stone-600">Master Artisan: <strong>{selectedAppModal.artisanName}</strong></div>
                  <div className="text-stone-500 text-[11px] font-mono pt-1">{selectedAppModal.shopAddress}</div>
                </div>

                <div className="space-y-1 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Monument Proximity</span>
                  <div className="font-bold text-stone-900 text-sm">{selectedAppModal.monumentName}</div>
                  <div className="text-stone-600">Walking Landmark: <strong>{selectedAppModal.shopLandmark}</strong></div>
                  <div className="text-stone-500 text-[11px] pt-1">Hours: {selectedAppModal.shopTiming}</div>
                </div>

                <div className="space-y-1 p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                  <span className="text-[10px] text-purple-900 block uppercase font-bold">Ministry Pehchan Credentials</span>
                  <div className="font-mono font-bold text-purple-950 text-sm">{selectedAppModal.pehchanId}</div>
                  <div className="text-purple-800 text-[11px]">GI Tag: {selectedAppModal.giRegNumber || 'Under Cluster Audit'}</div>
                  <div className="text-purple-700 text-[11px]">Guild: {selectedAppModal.cooperativeName}</div>
                </div>

                <div className="space-y-1 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] text-emerald-900 block uppercase font-bold">Direct Tourist Contact</span>
                  <div className="font-mono font-bold text-stone-900 text-sm">{selectedAppModal.phone}</div>
                  <div className="text-emerald-700 text-[11px]">WhatsApp: {selectedAppModal.whatsapp}</div>
                  <div className="text-stone-500 text-[11px]">Cluster: {selectedAppModal.clusterLocation}</div>
                </div>
              </div>

              {selectedAppModal.adminNote && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Administration Audit Remarks:</strong> {selectedAppModal.adminNote}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedAppModal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  Close Dossier
                </button>

                <div className="flex items-center gap-2">
                  {selectedAppModal.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          handleRejectArtisan(selectedAppModal.id, selectedAppModal.artisanName);
                          setSelectedAppModal(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                      >
                        Reject Application
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleApproveArtisan(selectedAppModal.id, selectedAppModal.artisanName);
                          setSelectedAppModal(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Certify Workshop</span>
                      </button>
                    </>
                  )}
                  {selectedAppModal.status === 'APPROVED' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Certified Heritage Partner</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
