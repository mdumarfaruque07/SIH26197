import React, { useState, useEffect, useMemo } from 'react';
import { X, Star, Upload, Image as ImageIcon, Loader2, Search, Camera, RefreshCw } from 'lucide-react';
import { Camera as CameraPlugin, CameraResultType, CameraSource } from '@capacitor/camera';
import { placeService, postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostModal({ isOpen, onClose, onSuccess, initialPlaceId = null }) {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [placeId, setPlaceId] = useState(initialPlaceId || '');
  const [placeSearch, setPlaceSearch] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [submitting, setSubmitting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');

  const filteredPlaces = useMemo(() => {
    if (!placeSearch.trim()) return places;
    const q = placeSearch.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.state && p.state.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [places, placeSearch]);

  useEffect(() => {
    if (isOpen) {
      placeService.getAll().then((res) => {
        if (res.success) {
          setPlaces(res.places);
          if (initialPlaceId) setPlaceId(initialPlaceId);
          else if (res.places.length > 0 && !placeId) {
            setPlaceId(res.places[0].id);
          }
        }
      });
    }
  }, [isOpen, initialPlaceId]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const takePhotoWithCamera = async () => {
    setError('');
    setCapturing(true);
    try {
      if (typeof CameraPlugin !== 'undefined' && CameraPlugin.getPhoto) {
        try {
          await CameraPlugin.requestPermissions({ permissions: ['camera'] });
        } catch (permErr) {
          console.warn('Camera permission check:', permErr);
        }

        const photo = await CameraPlugin.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });

        if (photo && photo.webPath) {
          const res = await fetch(photo.webPath);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `camera_capture_${Date.now()}.${photo.format || 'jpg'}`,
            { type: `image/${photo.format || 'jpeg'}` }
          );
          setImageFile(file);
          setImagePreview(photo.webPath);
          setUploadMode('file');
          setCapturing(false);
          return;
        }
      }
      throw new Error('Capacitor camera not available');
    } catch (err) {
      console.warn('Native camera capture failed, using browser input fallback:', err);
      setCapturing(false);
      const camInput = document.getElementById('camera-capture-input');
      if (camInput) camInput.click();
    }
  };

  const pickPhotoFromGallery = async () => {
    setError('');
    setCapturing(true);
    try {
      if (typeof CameraPlugin !== 'undefined' && CameraPlugin.getPhoto) {
        try {
          await CameraPlugin.requestPermissions({ permissions: ['photos'] });
        } catch (permErr) {
          console.warn('Photos permission check:', permErr);
        }

        const photo = await CameraPlugin.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
        });

        if (photo && photo.webPath) {
          const res = await fetch(photo.webPath);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `gallery_photo_${Date.now()}.${photo.format || 'jpg'}`,
            { type: `image/${photo.format || 'jpeg'}` }
          );
          setImageFile(file);
          setImagePreview(photo.webPath);
          setUploadMode('file');
          setCapturing(false);
          return;
        }
      }
      throw new Error('Capacitor photos not available');
    } catch (err) {
      console.warn('Native gallery pick failed, using browser input fallback:', err);
      setCapturing(false);
      const galInput = document.getElementById('gallery-file-input');
      if (galInput) galInput.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If user is guest, continue smoothly with guest attribution
    if (!placeId) {
      setError('Please select a heritage place.');
      return;
    }

    if (uploadMode === 'file' && !imageFile) {
      setError('Please select an image file to upload.');
      return;
    }

    if (uploadMode === 'url' && !imageUrl.trim()) {
      setError('Please enter a valid image URL.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('placeId', placeId);
      formData.append('rating', rating);
      formData.append('caption', caption);

      if (uploadMode === 'file' && imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('imageUrl', imageUrl.trim());
      }

      const res = await postService.create(formData);
      if (res.success && res.post) {
        // Record created post id to my posts tracker
        try {
          const ids = JSON.parse(localStorage.getItem('sanskriti_my_post_ids') || '[]');
          if (!ids.includes(res.post.id)) {
            localStorage.setItem('sanskriti_my_post_ids', JSON.stringify([res.post.id, ...ids]));
          }
        } catch {}
        window.dispatchEvent(new Event('sanskriti_my_posts_changed'));
        onSuccess && onSuccess(res.post);
        onClose();
      } else {
        setError(res.message || 'Failed to submit post');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading photo. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 flex-shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Share Your Heritage Visit</h3>
            <p className="text-xs text-stone-600">Post photos and rate your experience for fellow travelers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-600 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Searchable Place Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Select Heritage Site *
              </label>
              {placeId && (
                <span className="text-[11px] text-heritage-600 font-semibold flex items-center gap-1">
                  ✓ Selected: {places.find((p) => String(p.id) === String(placeId))?.name}
                </span>
              )}
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="🔍 Search site by name or state (e.g. Taj, Hampi, Delhi)..."
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-heritage-500 transition-all placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              {placeSearch && (
                <button
                  type="button"
                  onClick={() => setPlaceSearch('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtered Scrollable Places Chips / Cards */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-stone-200/80 rounded-2xl p-2 bg-stone-50/50">
              {filteredPlaces.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-3">No matching heritage sites found</p>
              ) : (
                filteredPlaces.map((p) => {
                  const isSelected = String(placeId) === String(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPlaceId(p.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-heritage-50 border border-heritage-400 shadow-xs'
                          : 'hover:bg-white hover:border-stone-200 border border-transparent'
                      }`}
                    >
                      <img
                        src={p.coverImage}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-heritage-800' : 'text-stone-900'}`}>
                            {p.name}
                          </p>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">{p.state || 'India'}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-heritage-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Your Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-medium text-stone-600 ml-2">
                {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : 'Average'}
              </span>
            </div>
          </div>

          {/* Photo Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Visit Photo
              </label>
              <div className="flex gap-1 text-[11px] font-medium bg-stone-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    uploadMode === 'file' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    uploadMode === 'url' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div className="mt-1">
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors shadow-md"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Change / Retake Actions */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={takePhotoWithCamera}
                        disabled={capturing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold hover:bg-orange-100 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Retake with Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={pickPhotoFromGallery}
                        disabled={capturing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Choose Another</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Direct Camera Click */}
                      <button
                        type="button"
                        onClick={takePhotoWithCamera}
                        disabled={capturing}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-heritage-400 bg-heritage-50/70 hover:bg-heritage-100 text-heritage-800 transition-all group active:scale-95 shadow-xs"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-heritage-600 text-white flex items-center justify-center mb-2 shadow-md shadow-heritage-600/30 group-hover:scale-110 transition-transform">
                          {capturing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-stone-900">Direct Camera Click</span>
                        <span className="text-[10px] text-heritage-700 font-medium mt-0.5">
                          📸 Capture live photo
                        </span>
                      </button>

                      {/* Phone Gallery / Storage */}
                      <button
                        type="button"
                        onClick={pickPhotoFromGallery}
                        disabled={capturing}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-all group active:scale-95 shadow-xs"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-stone-800 text-white flex items-center justify-center mb-2 shadow-md shadow-stone-800/20 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-stone-900">Phone Storage</span>
                        <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                          🖼️ Pick from Gallery
                        </span>
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-stone-400">
                      Supports high-resolution JPG, PNG, WEBP from camera or phone files
                    </p>

                    {/* Hidden fallback HTML inputs for desktop / fallback */}
                    <input
                      id="camera-capture-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      id="gallery-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500"
                  />
                </div>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
              </div>
            )}
          </div>

          {/* Caption / Review */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Caption / Experience
            </label>
            <textarea
              rows={3}
              placeholder="What was the best part of your visit? Any tips for other visitors?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-heritage-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-heritage-600 hover:bg-heritage-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
