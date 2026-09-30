import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Star,
  MoreHorizontal,
  Send,
  Sparkles,
  Check,
  Compass,
  Volume2,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { postService } from '../services/api';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

// Sample realistic community comments for seed posts
const INITIAL_DEMO_COMMENTS = {
  default: [
    {
      id: 1,
      author: 'Ananya Verma',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ananya',
      text: 'The symmetry and morning lighting here is unmatched! Great capture! ✨',
      timeAgo: '1h ago',
    },
    {
      id: 2,
      author: 'David Miller',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David',
      text: 'Visited last week with the audio guide. Truly a world-class experience.',
      timeAgo: '3h ago',
    },
  ],
  15: [
    {
      id: 101,
      author: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Taj Mahal at sunrise is breathtaking. Did you check out the marble inlay workshop nearby?',
      timeAgo: '2h ago',
    },
    {
      id: 102,
      author: 'Vikramaditya Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      text: 'Verified monument review. Incredible preservation work by ASI.',
      timeAgo: '4h ago',
    },
  ],
  16: [
    {
      id: 103,
      author: 'Karthik Rao',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Karthik',
      text: 'Hampi ruins feel like a time travel machine. The musical pillars are magical!',
      timeAgo: '5h ago',
    },
  ],
  19: [
    {
      id: 104,
      author: 'Meera Sen',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Meera',
      text: 'The evening Ganga Aarti gives me chills every time. Har Har Mahadev! 🙏',
      timeAgo: '1d ago',
    },
  ],
};

const isDemoComment = (c) => {
  if (!c) return false;
  const author = (c.author || '').toLowerCase().trim();
  const text = (c.text || '').toLowerCase().trim();
  return (
    (author === 'ananya verma' && text.includes('symmetry')) ||
    (author === 'david miller' && text.includes('visited last week')) ||
    (author === 'priya patel' && text.includes('sunrise is breathtaking')) ||
    (author === 'vikramaditya sharma' && text.includes('preservation work')) ||
    (author === 'karthik rao' && text.includes('musical pillars')) ||
    (author === 'meera sen' && text.includes('ganga aarti'))
  );
};

export const getSavedPostsList = () => {
  try {
    const raw = localStorage.getItem('sanskriti_saved_posts');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const isPostSavedInStorage = (id) => {
  if (!id) return false;
  const list = getSavedPostsList();
  return list.some((p) => String(p.id) === String(id));
};

export const toggleSavePostInStorage = (postData) => {
  try {
    const list = getSavedPostsList();
    const targetId = postData.id || postData._id || 1;
    const exists = list.some((p) => String(p.id) === String(targetId));
    let updated;
    if (exists) {
      updated = list.filter((p) => String(p.id) !== String(targetId));
    } else {
      const newEntry = {
        id: targetId,
        rating: postData.rating || 5,
        caption: postData.caption || '',
        imageUrl: postData.imageUrl || '',
        user: postData.user || { name: 'Explorer' },
        place: postData.place || { name: 'Heritage Site' },
        createdAt: postData.createdAt || new Date().toISOString(),
        savedAt: new Date().toISOString(),
      };
      updated = [newEntry, ...list];
    }
    localStorage.setItem('sanskriti_saved_posts', JSON.stringify(updated));
    window.dispatchEvent(new Event('sanskriti_saved_posts_changed'));
    return !exists;
  } catch (err) {
    console.error('toggleSavePost error:', err);
    return false;
  }
};

export default function InstagramPostCard({ post, onLikeChange, onPostDelete, onPostUpdate }) {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const postId = post.id || post._id || 1;
  const storageKey = `sanskriti_post_${postId}_meta`;

  // Local storage state for persistence
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(() => isPostSavedInStorage(postId));
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(null);
  const [comments, setComments] = useState([]);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // When comment drawer is open, lock body scroll completely and hide bottom navigation bar
  useEffect(() => {
    if (isCommentDrawerOpen) {
      lockBodyScroll();
      window.dispatchEvent(
        new CustomEvent('sanskriti_comment_drawer_toggle', { detail: { open: true } })
      );
    } else {
      unlockBodyScroll();
      window.dispatchEvent(
        new CustomEvent('sanskriti_comment_drawer_toggle', { detail: { open: false } })
      );
    }
    return () => {
      unlockBodyScroll();
      window.dispatchEvent(
        new CustomEvent('sanskriti_comment_drawer_toggle', { detail: { open: false } })
      );
    };
  }, [isCommentDrawerOpen]);

  // Edit and Delete states
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editRating, setEditRating] = useState(post.rating || 5);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(post.caption || '');
  const [currentRating, setCurrentRating] = useState(post.rating || 5);

  // Author check (logged-in user, locally recorded my_post_ids, or admin)
  const myPostIds = (() => {
    try {
      return JSON.parse(localStorage.getItem('sanskriti_my_post_ids') || '[]');
    } catch {
      return [];
    }
  })();

  const isAuthor =
    (user?.id && (post.userId === user.id || post.user?.id === user.id)) ||
    myPostIds.includes(postId) ||
    myPostIds.includes(Number(postId)) ||
    user?.role === 'admin';

  useEffect(() => {
    // Sync saved status with global storage
    setSaved(isPostSavedInStorage(postId));

    const handleSavedChanged = () => {
      setSaved(isPostSavedInStorage(postId));
    };
    window.addEventListener('sanskriti_saved_posts_changed', handleSavedChanged);

    // Load stored interactions or initialize with MySQL post data
    try {
      const stored = localStorage.getItem(storageKey);
      let initialLiked = post.liked || false;
      let initialCount = post.likesCount || 24;
      const serverComments = Array.isArray(post.comments) && post.comments.length > 0 ? post.comments : [];
      let initialComments = [...serverComments];

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.liked !== undefined) initialLiked = parsed.liked;
        if (parsed.likesCount !== undefined) initialCount = parsed.likesCount;

        if (Array.isArray(parsed.comments) && parsed.comments.length > 0) {
          // Build sets of known server comments by ID and by author+text
          const knownIds = new Set(initialComments.map((c) => String(c.id)));
          const knownContentKeys = new Set(
            initialComments.map((c) => `${(c.author || '').toLowerCase()}:::${(c.text || '').trim().toLowerCase()}`)
          );

          // Only keep local comments that are truly unique and not demo comments if server comments exist
          const extra = [];
          for (const c of parsed.comments) {
            if (!c || !c.text) continue;
            // If the post has real comments from the server, never retain demo comments
            if (serverComments.length > 0 && isDemoComment(c)) continue;

            const idKey = String(c.id);
            const contentKey = `${(c.author || '').toLowerCase()}:::${(c.text || '').trim().toLowerCase()}`;

            // If it matches a server comment by ID or by (author + text), it's already in initialComments! Discard duplicate!
            if (!knownIds.has(idKey) && !knownContentKeys.has(contentKey)) {
              knownIds.add(idKey);
              knownContentKeys.add(contentKey);
              extra.push(c);
            }
          }

          initialComments = [...initialComments, ...extra];

          // Self-healing: permanently clean duplicate/demo comments from localStorage
          parsed.comments = extra;
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
      } else {
        // Only load demo comments if the post is a fallback seed post with NO comments
        if (!initialComments.length && !post.userId && (postId === 15 || postId === 16 || postId === 19)) {
          initialComments = INITIAL_DEMO_COMMENTS[postId] || INITIAL_DEMO_COMMENTS.default;
        }
      }

      // Final deduplication on initialComments to ensure single copy of each comment
      const seenIds = new Set();
      const seenContent = new Set();
      const uniqueComments = [];
      for (const c of initialComments) {
        if (!c || !c.text) continue;
        // Never show demo comments if server comments exist
        if (serverComments.length > 0 && isDemoComment(c)) continue;

        const idKey = String(c.id);
        const contentKey = `${(c.author || '').toLowerCase()}:::${(c.text || '').trim().toLowerCase()}`;
        if (!seenIds.has(idKey) && !seenContent.has(contentKey)) {
          seenIds.add(idKey);
          seenContent.add(contentKey);
          uniqueComments.push(c);
        }
      }

      setLiked(initialLiked);
      setLikesCount(initialCount);
      setComments(uniqueComments);
      setCurrentCaption(post.caption || '');
      setCurrentRating(post.rating || 5);
    } catch {
      setLikesCount(post.likesCount || 35);
      setComments(post.comments || []);
    }

    return () => {
      window.removeEventListener('sanskriti_saved_posts_changed', handleSavedChanged);
    };
  }, [postId, post.likesCount, post.caption, post.rating, post.comments]);

  const saveInteractions = (updated) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          liked: updated.liked !== undefined ? updated.liked : liked,
          likesCount: updated.likesCount !== undefined ? updated.likesCount : likesCount,
          saved: updated.saved !== undefined ? updated.saved : saved,
          comments: updated.comments !== undefined ? updated.comments : comments,
        })
      );
    } catch {}
  };

  const handleToggleLike = () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLiked(nextLiked);
    setLikesCount(nextCount);
    saveInteractions({ liked: nextLiked, likesCount: nextCount });
    if (onLikeChange) onLikeChange(postId, nextLiked);

    if (nextLiked) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 500);
    }

    // Persist like directly to MySQL database
    postService
      .toggleLike(postId)
      .then((res) => {
        if (res.success && res.likesCount !== undefined) {
          setLikesCount(res.likesCount);
          saveInteractions({ liked: res.liked, likesCount: res.likesCount });
        }
      })
      .catch((err) => {
        console.warn('MySQL like sync notice:', err.message);
      });
  };

  // Double tap on image to like with pop animation
  const handleDoubleTap = () => {
    if (!liked) {
      handleToggleLike();
    } else {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 500);
    }
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleToggleSave = () => {
    const isNowSaved = toggleSavePostInStorage({
      id: postId,
      ...post,
      caption: currentCaption,
      rating: currentRating,
    });
    setSaved(isNowSaved);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 500);

    setSavedToast(
      isNowSaved
        ? (lang === 'hi' ? 'सहेजा गया ✨' : 'Saved to Bookmarks ✨')
        : (lang === 'hi' ? 'हटा दिया गया' : 'Removed from Saved')
    );
    setTimeout(() => setSavedToast(null), 2500);

    saveInteractions({ saved: isNowSaved });

    // Persist bookmark to MySQL database
    postService.toggleBookmark(postId).catch((err) => {
      console.warn('MySQL bookmark sync notice:', err.message);
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = user?.name || 'Explorer';
    const authorAvatar =
      user?.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;

    const commentText = newComment.trim();
    const tempId = `temp_${Date.now()}`;
    const commentItem = {
      id: tempId,
      author: authorName,
      avatar: authorAvatar,
      text: commentText,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...comments, commentItem];
    setComments(updatedComments);
    setNewComment('');
    setShowAllComments(true);

    // Persist comment directly to MySQL database
    postService
      .addComment(postId, {
        text: commentText,
        authorName,
        avatarUrl: authorAvatar,
      })
      .then((res) => {
        if (res.success && res.comment) {
          setComments((prev) => {
            // Replace the temporary comment with the persisted MySQL comment
            const replaced = prev.map((c) =>
              c.id === tempId || (c.author === authorName && c.text.trim() === commentText && String(c.id).startsWith('temp_'))
                ? {
                    ...c,
                    id: res.comment.id,
                    author: res.comment.author || authorName,
                    avatar: res.comment.avatar || authorAvatar,
                    text: res.comment.text || commentText,
                    timeAgo: res.comment.timeAgo || 'Just now',
                    createdAt: res.comment.createdAt,
                  }
                : c
            );
            // Save clean state to localStorage so no duplicate temp comment lingers
            saveInteractions({ comments: replaced });
            return replaced;
          });
        }
      })
      .catch((err) => {
        console.warn('MySQL comment sync notice:', err.message);
        // On error or offline, keep in localStorage
        saveInteractions({ comments: updatedComments });
      });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const res = await postService.update(postId, {
        caption: editCaption,
        rating: editRating,
      });
      if (res.success) {
        setCurrentCaption(editCaption);
        setCurrentRating(editRating);
        setIsEditing(false);
        setShowOptionsMenu(false);
        if (onPostUpdate) {
          onPostUpdate(res.post || { ...post, caption: editCaption, rating: editRating });
        }
        setSavedToast(lang === 'hi' ? 'समीक्षा संशोधित हो गई ✨' : 'Post updated successfully! ✨');
        setTimeout(() => setSavedToast(null), 2500);
      }
    } catch (err) {
      console.warn('Update post fallback:', err);
      setCurrentCaption(editCaption);
      setCurrentRating(editRating);
      setIsEditing(false);
      setShowOptionsMenu(false);
      setSavedToast(lang === 'hi' ? 'समीक्षा अपडेट हो गई' : 'Post updated locally');
      setTimeout(() => setSavedToast(null), 2500);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postService.delete(postId);
      // Remove from local trackers
      try {
        const ids = JSON.parse(localStorage.getItem('sanskriti_my_post_ids') || '[]');
        localStorage.setItem(
          'sanskriti_my_post_ids',
          JSON.stringify(ids.filter((id) => id !== postId && id !== Number(postId)))
        );
      } catch {}
      setShowDeleteConfirm(false);
      setShowOptionsMenu(false);
      window.dispatchEvent(new Event('sanskriti_my_posts_changed'));
      if (onPostDelete) onPostDelete(postId);
    } catch (err) {
      console.warn('Delete post fallback:', err);
      setShowDeleteConfirm(false);
      setShowOptionsMenu(false);
      if (onPostDelete) onPostDelete(postId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/place/${post.place?.slug || 'taj-mahal'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const userAvatar =
    post.user?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.user?.name || 'User')}`;

  const placeName = post.place?.name || 'Heritage Destination';
  const placeSlug = post.place?.slug || '';
  const postDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <article className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
      {/* 1. Header: Avatar + User Info + Location + 3-Dot Options */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Instagram Gradient Ring Avatar */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
              <img
                src={userAvatar}
                alt={post.user?.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.user?.name || 'User')}`;
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                {post.user?.name || 'Cultural Traveler'}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{currentRating}.0</span>
              </span>
              {isAuthor && (
                <span className="px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 font-bold text-[9px] uppercase tracking-wider">
                  {lang === 'hi' ? 'आपकी पोस्ट' : 'You'}
                </span>
              )}
              {/* Algorithmic Discovery Badges */}
              {post.isNearby && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] whitespace-nowrap">
                  <span>📍</span>
                  <span>{post.distKm ? `${post.distKm} km` : (lang === 'hi' ? 'निकट' : 'Nearby')}</span>
                </span>
              )}
              {!post.isNearby && post.isTrending && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[9px] whitespace-nowrap">
                  <span>🔥</span>
                  <span>{lang === 'hi' ? 'ट्रेंडिंग' : 'Trending'}</span>
                </span>
              )}
              {!post.isNearby && !post.isTrending && post.isFresh && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[9px] whitespace-nowrap">
                  <span>✨</span>
                  <span>{lang === 'hi' ? 'नया' : 'Fresh'}</span>
                </span>
              )}
            </div>

            {/* Clickable Location with Map Marker */}
            {placeSlug ? (
              <Link
                to={`/place/${placeSlug}`}
                className="text-[11px] text-heritage-700 hover:text-heritage-900 font-medium flex items-center gap-1 truncate transition-colors"
              >
                <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                <span className="truncate">{placeName}</span>
              </Link>
            ) : (
              <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                <span>{placeName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Options Button / Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 text-xs animate-fadeIn">
              <button
                onClick={() => {
                  handleShare();
                  setShowOptionsMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-stone-100 flex items-center gap-2 text-stone-700 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Monument Link</span>
              </button>
              {placeSlug && (
                <Link
                  to={`/place/${placeSlug}`}
                  onClick={() => setShowOptionsMenu(false)}
                  className="w-full text-left px-3.5 py-2 hover:bg-stone-100 flex items-center gap-2 text-stone-700"
                >
                  <Compass className="w-3.5 h-3.5 text-heritage-600" />
                  <span>View Heritage Guide</span>
                </Link>
              )}

              {/* Author Specific Options: Edit & Delete */}
              {isAuthor && (
                <>
                  <div className="my-1 border-t border-stone-100" />
                  <button
                    onClick={() => {
                      setEditCaption(currentCaption);
                      setEditRating(currentRating);
                      setIsEditing(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-100 flex items-center gap-2 text-stone-800 font-medium cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lang === 'hi' ? 'समीक्षा संशोधित करें' : 'Edit Review & Rating'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === 'hi' ? 'पोस्ट हटाएं' : 'Delete Post'}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Media Area: High-Res Photo with Double-Tap to Like Animation */}
      <div
        onDoubleClick={handleDoubleTap}
        className="relative w-full aspect-[4/3] sm:aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer select-none group"
      >
        <img
          src={post.imageUrl || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'}
          alt={placeName}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Double-Tap Popping Heart Overlay */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-scale-up">
            <Heart className="w-24 h-24 fill-white text-rose-500 drop-shadow-2xl animate-pulse" />
          </div>
        )}

        {/* Quick Monument Badge Overlay */}
        <div className="absolute bottom-3 left-3 z-10">
          <Link
            to={placeSlug ? `/place/${placeSlug}` : '/map'}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold transition-all shadow-md"
          >
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{placeName}</span>
          </Link>
        </div>
      </div>

      {/* 3. Instagram Action Bar (Heart, Comment, Share, Bookmark) */}
      <div className="p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Heart / Like Button */}
            <button
              onClick={handleToggleLike}
              className="flex items-center gap-1.5 text-stone-700 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
              aria-label="Like post"
            >
              <Heart
                className={`w-6 h-6 transition-all duration-300 ${
                  liked
                    ? 'fill-rose-600 text-rose-600'
                    : 'text-stone-700 hover:text-rose-500'
                } ${isBouncing ? 'scale-125 -translate-y-1' : 'scale-100 translate-y-0'}`}
              />
            </button>

            {/* Comment Button (Opens Instagram-Style Bottom Sheet) */}
            <button
              onClick={() => setIsCommentDrawerOpen(true)}
              className="flex items-center gap-1.5 text-stone-700 hover:text-amber-700 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
              aria-label="Comment on post"
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="text-stone-700 hover:text-heritage-600 hover:scale-110 active:scale-90 transition-transform cursor-pointer relative"
              aria-label="Share post"
            >
              {copiedShare ? (
                <Check className="w-6 h-6 text-emerald-600" />
              ) : (
                <Share2 className="w-6 h-6" />
              )}
              {copiedShare && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] whitespace-nowrap shadow-md">
                  Link Copied!
                </span>
              )}
            </button>
          </div>

          {/* Bookmark Button */}
          <div className="relative">
            <button
              onClick={handleToggleSave}
              className="text-stone-700 hover:text-amber-600 hover:scale-110 active:scale-90 transition-transform cursor-pointer p-0.5"
              aria-label="Save to bookmarks"
            >
              <Bookmark
                className={`w-6 h-6 transition-all duration-300 ${
                  saved ? 'fill-amber-500 text-amber-500' : 'hover:text-amber-500'
                } ${isSaving ? 'scale-125 -translate-y-1' : 'scale-100 translate-y-0'}`}
              />
            </button>

            {/* Saved Toast Popup */}
            {savedToast && (
              <div className="absolute -top-9 right-0 px-2.5 py-1 rounded-xl bg-stone-900 text-white text-[11px] font-medium whitespace-nowrap shadow-xl border border-stone-700 flex items-center gap-1.5 z-30 animate-fadeIn pointer-events-none">
                <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{savedToast}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Likes Count */}
        <div className="text-xs font-bold text-stone-900">
          <span>{likesCount.toLocaleString()} likes</span>
          {liked && <span className="text-stone-500 font-normal ml-1">• Liked by you</span>}
        </div>

        {/* 5. Caption with Username */}
        {currentCaption && (
          <div className="text-xs sm:text-sm text-stone-800 leading-relaxed">
            <span className="font-bold text-stone-900 mr-1.5">
              {post.user?.name || 'Explorer'}
            </span>
            <span>{currentCaption}</span>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold text-heritage-700">
              <span>#IncredibleIndia</span>
              <span>#LivingHeritage</span>
              <span>#{placeName.replace(/[^a-zA-Z0-9]/g, '')}</span>
            </div>
          </div>
        )}

        {/* 6. Comments Preview & Open Drawer Trigger */}
        {comments.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsCommentDrawerOpen(true)}
              className="text-xs text-stone-500 font-medium hover:text-stone-800 transition-colors cursor-pointer text-left block"
            >
              {lang === 'hi'
                ? `सभी ${comments.length} टिप्पणियाँ देखें`
                : `View all ${comments.length} comments`}
            </button>

            {/* Show latest 1 comment in feed preview */}
            {comments.slice(-1).map((c) => (
              <div
                key={c.id}
                onClick={() => setIsCommentDrawerOpen(true)}
                className="flex items-start gap-1.5 text-xs text-stone-700 cursor-pointer group"
              >
                <span className="font-bold text-stone-900 group-hover:text-amber-800">{c.author}</span>
                <span className="text-stone-800 line-clamp-1">{c.text}</span>
                <span className="text-[10px] text-stone-400 ml-1 flex-shrink-0">{c.timeAgo}</span>
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCommentDrawerOpen(true)}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer pt-1 text-left block"
          >
            {lang === 'hi' ? 'पहली टिप्पणी लिखें...' : 'Add a comment...'}
          </button>
        )}

        {/* 7. Timestamp */}
        <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
          {postDate} • Verified Traveler Story
        </p>

        {/* 8. Add a Comment Input Field (Quick Inline or Opens Drawer) */}
        <form
          onSubmit={handleAddComment}
          className="pt-2 border-t border-stone-100 flex items-center gap-2.5"
        >
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'You')}`
            }
            alt="Your avatar"
            className="w-6 h-6 rounded-full object-cover border border-stone-200 flex-shrink-0"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => {
              if (window.innerWidth < 640) {
                setIsCommentDrawerOpen(true);
              }
            }}
            placeholder={lang === 'hi' ? 'अपनी राय या टिप्पणी लिखें...' : 'Add a cultural thought or comment...'}
            className="flex-1 bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          {newComment.trim() ? (
            <button
              type="submit"
              className="text-xs font-bold text-heritage-600 hover:text-heritage-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Post</span>
              <Send className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCommentDrawerOpen(true)}
              className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              title="Open full comments sheet"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* ========================================================================= */}
      {/* EDIT POST MODAL                                                           */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-heritage-600" />
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {lang === 'hi' ? 'समीक्षा संशोधित करें' : 'Edit Your Review'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'आपकी रेटिंग:' : 'Rating:'}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">
                    {editRating}.0 Stars
                  </span>
                </div>
              </div>

              {/* Caption Textarea */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'समीक्षा व अनुभव:' : 'Review & Experience:'}
                </label>
                <textarea
                  rows={4}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Share details of your visit, tips, and cultural memories..."
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-heritage-500 text-xs sm:text-sm text-stone-800"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-heritage-600 hover:bg-heritage-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSavingEdit
                    ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...')
                    : (lang === 'hi' ? 'सहेजें' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {lang === 'hi' ? 'क्या आप यह पोस्ट हटाना चाहते हैं?' : 'Delete This Post?'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'hi'
                  ? 'यह पोस्ट और आपकी समीक्षा स्थायी रूप से हटा दी जाएगी।'
                  : 'This photo and review will be permanently removed from the community feed.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {isDeleting
                  ? (lang === 'hi' ? 'हटा रहे हैं...' : 'Deleting...')
                  : (lang === 'hi' ? 'हाँ, हटाएं' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* INSTAGRAM-STYLE BOTTOM SHEET COMMENTS DRAWER POPUP                        */}
      {/* ========================================================================= */}
      {isCommentDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center animate-fadeIn overscroll-contain">
            {/* Dark blurred backdrop with touchmove prevention */}
            <div
              onClick={() => setIsCommentDrawerOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer touch-none overscroll-contain"
            />

            {/* Drawer Container (Slides up from bottom) */}
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[82vh] h-[80vh] animate-slide-up overflow-hidden z-20 border border-stone-200">
              {/* 1. Pull Bar & Top Header */}
              <div className="pt-3 pb-2.5 px-4 border-b border-stone-100 flex-shrink-0 relative bg-white">
                {/* Drag Handle Bar */}
                <div
                  onClick={() => setIsCommentDrawerOpen(false)}
                  className="w-10 h-1 bg-stone-300 hover:bg-stone-400 rounded-full mx-auto mb-2 cursor-pointer transition-colors"
                />

                <div className="flex items-center justify-between">
                  <div className="w-7" /> {/* spacer for centering title */}

                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                    <span>{lang === 'hi' ? 'टिप्पणियाँ' : 'Comments'}</span>
                    <span className="text-xs text-stone-400 font-semibold">({comments.length})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCommentDrawerOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                    aria-label="Close comments"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 2. Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain">
                {/* Original Post Author Caption Card (Pinned at top of comments) */}
                {currentCaption && (
                  <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                    <img
                      src={userAvatar}
                      alt={post.user?.name || 'Author'}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900">{post.user?.name || 'Explorer'}</span>
                        <span className="text-[10px] text-stone-400">• {postDate}</span>
                      </div>
                      <p className="text-stone-800 mt-0.5 leading-relaxed whitespace-pre-wrap">{currentCaption}</p>
                      <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-heritage-600 font-medium">
                        <span>#IncredibleIndia</span>
                        <span>#{placeName.replace(/[^a-zA-Z0-9]/g, '')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments Stream */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-xs text-stone-800">
                        {lang === 'hi' ? 'अभी कोई टिप्पणी नहीं है' : 'No comments yet'}
                      </div>
                      <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                        {lang === 'hi'
                          ? 'इस धरोहर स्थल के बारे में बातचीत शुरू करने वाले पहले व्यक्ति बनें!'
                          : 'Start the conversation! Share your visit thoughts or questions.'}
                      </p>
                    </div>
                  ) : (
                    comments.map((c) => {
                      const isLiked = Boolean(commentLikes[c.id]);
                      return (
                        <div key={c.id} className="flex items-start gap-3 text-xs group">
                          <img
                            src={c.avatar}
                            alt={c.author}
                            className="w-8 h-8 rounded-full object-cover border border-stone-200 flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div>
                              <span className="font-bold text-stone-900 mr-1.5">{c.author}</span>
                              <span className="text-stone-800 leading-relaxed">{c.text}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-stone-400 font-medium">
                              <span>{c.timeAgo || 'Just now'}</span>
                              <button
                                type="button"
                                onClick={() => setNewComment(`@${c.author} `)}
                                className="text-stone-500 font-bold hover:text-stone-900 cursor-pointer"
                              >
                                Reply
                              </button>
                              {isLiked && <span className="text-rose-600 font-bold">1 like</span>}
                            </div>
                          </div>

                          {/* Like button for comment */}
                          <button
                            type="button"
                            onClick={() => {
                              setCommentLikes((prev) => ({
                                ...prev,
                                [c.id]: !prev[c.id],
                              }));
                            }}
                            className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer mt-0.5"
                            title="Like comment"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-300 hover:text-stone-500'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3. Quick Emojis Bar (Instagram Style) */}
              <div className="px-4 py-1.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
                {['❤️', '🙌', '🔥', '👏', '✨', '😍', '🙏', '🇮🇳'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewComment((prev) => prev + emoji)}
                    className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer select-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* 4. Bottom Sticky Input Form (Highly visible with safe padding) */}
              <form
                onSubmit={(e) => {
                  handleAddComment(e);
                }}
                className="px-3.5 pt-3 pb-6 sm:pb-3.5 bg-white border-t border-stone-200 flex items-center gap-2.5 flex-shrink-0 relative z-30 shadow-lg"
              >
                <img
                  src={
                    user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'You')}`
                  }
                  alt="Your avatar"
                  className="w-9 h-9 rounded-full object-cover border border-amber-300 flex-shrink-0 shadow-2xs"
                />
                <input
                  type="text"
                  autoFocus
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? `${post.user?.name || 'यात्री'} के लिए एक टिप्पणी लिखें...`
                      : `Add a comment for ${post.user?.name || 'explorer'}...`
                  }
                  className="flex-1 bg-stone-100 hover:bg-stone-50 focus:bg-white px-4 py-2.5 rounded-full text-xs sm:text-sm text-stone-900 font-medium placeholder-stone-500 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                    newComment.trim()
                      ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md cursor-pointer hover:opacity-95 active:scale-95'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <span>{lang === 'hi' ? 'भेजें' : 'Post'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}
