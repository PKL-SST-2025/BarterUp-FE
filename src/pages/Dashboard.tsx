// src/pages/Dashboard.tsx
import type { Component } from "solid-js";
import Navbar from '../components/Navbar';
import { createSignal, For, onMount, Show } from "solid-js";
import { contacts, setContacts, followed, setFollowed } from "../components/contacts";
import { ApiService, type EnhancedPostResponse } from "../services/api";
import { API_BASE_URL } from "../services/api";

// import image assets
import W1 from '../assets/W1.jpg';
import W2 from '../assets/W2.jpg';
import Male1 from "../assets/male1.jpg";

const Dashboard: Component = () => {
  const [query, setQuery] = createSignal("");
  const [loadingPosts, setLoadingPosts] = createSignal(false);
  const [postsError, setPostsError] = createSignal<string | null>(null);
  const [, setCurrentUser] = createSignal<any>(null);
  
  // Enhanced post structure with better typing
  const [posts, setPosts] = createSignal<EnhancedPostResponse[]>([]);

  // Seed posts for demo - Fixed avatar handling
  const seedPosts: EnhancedPostResponse[] = [
    {
      id: "seed-1",
      user_id: "demo-user-1",
      content: `Senang sekali memperkenalkan BarterUp ke komunitas lokal! 🎉
        Kami percaya setiap orang memiliki keahlian unik yang bisa dibagikan.
        Di BarterUp kamu dapat menukar skill memasak, berbahasa asing, hingga coding.
        Baik kamu ingin belajar memasak resep tradisional maupun menguasai teknik debugging,
        semuanya bisa bertukar secara langsung dengan tetangga atau teman baru.
        Yuk, mulai perjalanan belajarmu dengan cara yang lebih dekat, terjangkau, dan sosial!`,
      author_name: "Rina Suryani",
      author_avatar: W1, // This is already the imported image
      author_role: "Digital Art",
      author_primary_skill: "Digital Art",
      is_own_post: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "seed-2", 
      user_id: "demo-user-2",
      content: `Halo teman BarterUp! Aku sedang mendalami bahasa Spanyol 🇪🇸 dan ingin bantu kalian desain konten visual.
        Ayo bergabung untuk sesi tukar skill: aku ajarkan dasar-dasar tipografi dan layout,
        kamu bisa ajari aku percakapan sehari-hari dalam bahasa Spanyol.
        Kita bisa atur jadwal mingguan secara offline atau virtual sesuai kenyamanan.
        Tingkatkan kreativitas dan kemampuan bahasa secara bersamaan! 📚✨`,
      author_name: "Agus Yuni",
      author_avatar: Male1, // This is already the imported image
      author_role: "Graphic Design",
      author_primary_skill: "Graphic Design",
      is_own_post: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "seed-3",
      user_id: "demo-user-3", 
      content: `Apakah kamu tertarik belajar dasar JavaScript untuk membangun website interaktif? 🚀
        Gabung sesi coding virtual gratis setiap Sabtu jam 10:00 WIB.
        Kita akan mulai dari dasar: variabel, fungsi, hingga manipulasi DOM sederhana.
        Sempurna untuk pemula yang baru kenal programming atau yang ingin refresh kembali konsep.
        Jangan lewatkan kesempatan ini untuk mengasah skill coding-mu dengan komunitas lokal BarterUp!`,
      author_name: "Dewi Kusuma",
      author_avatar: W2, // This is already the imported image
      author_role: "Web Development",
      author_primary_skill: "Web Development",
      is_own_post: false,
      created_at: new Date().toISOString(),
    },
  ];

  const [openComments, setOpenComments] = createSignal<Record<string, boolean>>({});
  const [newComment, setNewComment] = createSignal<Record<string, string>>({});
  const initComments = (): Record<string, { id: string; text: string; author: string; avatar: string; ts: number }[]> => {
    try { const raw = localStorage.getItem('localComments'); if (raw) return JSON.parse(raw); } catch(_) {}
    return {};
  };
  const [comments, setComments] = createSignal<Record<string, { id: string; text: string; author: string; avatar: string; ts: number }[]>>(initComments());

  const persistComments = (data: Record<string, any>) => {
    try { localStorage.setItem('localComments', JSON.stringify(data)); } catch(_) {}
  };
  // Local like storage
  const initialLiked: Set<string> = (() => {
    try { const raw = sessionStorage.getItem('likedPosts'); if (raw) return new Set(JSON.parse(raw)); } catch(_) {}
    return new Set();
  })();
  const [likedPosts, setLikedPosts] = createSignal<Set<string>>(initialLiked);
  // Derived analytics (inline)
  const likedCount = () => likedPosts().size;
  const ownPostCount = () => posts().filter(p => p.is_own_post).length;

  // Get current user session
  const getCurrentUser = () => {
    try {
      const userSession = sessionStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        return session;
      }
    } catch (error) {
      console.error('Error getting user session:', error);
    }
    return null;
  };

  const getAuthToken = (): string | null => {
    // Try multiple known storage keys
    const direct = sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken') || sessionStorage.getItem('token');
    if (direct) return direct;
    // Fallback: token inside userSession structure
    try {
      const us = sessionStorage.getItem('userSession');
      if (us) {
        const parsed = JSON.parse(us);
        // Common Supabase session shape: { session: { access_token }, access_token, user, profile }
        if (parsed.access_token) return parsed.access_token;
        if (parsed.session && parsed.session.access_token) return parsed.session.access_token;
        if (parsed.session && parsed.session.accessToken) return parsed.session.accessToken;
      }
    } catch(_) {}
    return null;
  };

  const handleFollow = (postData: EnhancedPostResponse) => {
    // Don't allow following yourself
    if (postData.is_own_post) {
      console.log("Can't follow yourself");
      return;
    }

    const f = new Set(followed());
    const authorName = postData.author_name;
    const authorAvatar = postData.author_avatar || W1; // fallback avatar
    
    if (f.has(authorName)) {
      f.delete(authorName);
      setContacts(contacts().filter(c => c.name !== authorName));
    } else {
      f.add(authorName);
      // Avoid duplicate entries in contacts list
      if (!contacts().some(c => c.name === authorName)) {
        setContacts([{ name: authorName, avatar: authorAvatar }, ...contacts()]);
      }
    }
    setFollowed(f);
    // Persist followed list for analytics simplification
    try {
      sessionStorage.setItem('followedUsers', JSON.stringify(Array.from(f)));
    } catch (_) {}
  };

  const toggleLike = (postId: string) => {
    const setCopy = new Set(likedPosts());
    if (setCopy.has(postId)) setCopy.delete(postId); else setCopy.add(postId);
    setLikedPosts(setCopy);
    try { sessionStorage.setItem('likedPosts', JSON.stringify(Array.from(setCopy))); } catch(_) {}
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Hapus post ini?')) return;
    try {
      // Always send Authorization header if any token exists
  let token = getAuthToken();
      if (!token) {
        alert('Kamu harus login dulu untuk hapus post.');
        return;
      }
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const updated = posts().filter(p => p.id !== postId);
        setPosts(updated);
        try { sessionStorage.setItem('cachedPosts', JSON.stringify(updated)); } catch(_) {}
      } else {
        const body = await res.text();
        if (res.status === 401) {
          alert('Gagal hapus: kamu belum login atau token salah.');
        } else {
          alert('Gagal hapus post: ' + body);
        }
      }
    } catch (e) {
      console.error('Delete post error', e);
      alert('Terjadi error saat hapus post');
    }
  };

  // Community count should reflect unique connected users (contacts already represents them)
  const communityCount = () => {
    const unique = new Set(contacts().map(c => c.name));
    return unique.size;
  };

  const toggleComments = (postId: string) => {
    setOpenComments({
      ...openComments(),
      [postId]: !openComments()[postId],
    });
  };
  const isCommentsOpen = (postId: string) => !!openComments()[postId];
  const commentCount = (postId: string) => (comments()[postId] || []).length;

  // Guarantee a usable avatar string; replace empty / nullish / placeholder values
  const ensureAvatar = (val: any): string => {
    if (!val || typeof val !== 'string') return W1; // fallback import
    const t = val.trim();
    if (!t || t === 'null' || t === 'undefined') return W1;
    return t;
  };

  // Check if user really has an uploaded avatar (stored locally or from session)
  const userHasAvatar = (): boolean => {
    try {
      const local = localStorage.getItem('profilePicture');
      if (local && local.trim() && local !== 'null' && local !== 'undefined') return true;
    } catch(_) {}
    try {
      const sessionRaw = sessionStorage.getItem('userSession');
      if (sessionRaw) {
        const s = JSON.parse(sessionRaw);
        const url = s?.profile?.profile_picture_url || s?.user?.profile_picture_url;
        if (url && typeof url === 'string' && url.trim() && url !== 'null' && url !== 'undefined') return true;
      }
    } catch(_) {}
    return false;
  };

  const getCurrentUsername = (): string | null => {
    try {
      const sessionRaw = sessionStorage.getItem('userSession');
      if (sessionRaw) {
        const s = JSON.parse(sessionRaw);
        // Common shapes: session.user.user_metadata.username, user.username, profile.username
        const metaU = s?.user?.user_metadata?.username;
        const directU = s?.user?.username;
        const profileU = s?.profile?.username;
        if (metaU) return metaU;
        if (directU) return directU;
        if (profileU) return profileU;
      }
    } catch(_) {}
    // Check explicit savedUsername
    try { const stored = localStorage.getItem('savedUsername'); if (stored) return stored; } catch(_) {}
    // Check accountMeta (created during signup) for username
    try {
      const metaRaw = sessionStorage.getItem('accountMeta');
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        if (meta?.username) return meta.username;
      }
    } catch(_) {}
    // Check userDetails (might be persisted after profile edits)
    try {
      const detailsRaw = localStorage.getItem('userDetails');
      if (detailsRaw) {
        const details = JSON.parse(detailsRaw);
        if (details?.username) return details.username;
        if (details?.profile?.username) return details.profile.username;
      }
    } catch(_) {}
    return null;
  };

  const getCurrentUserAvatar = (): string => {
    // Priority: session profile -> localStorage profilePicture -> fallback image
    try {
      const sessionRaw = sessionStorage.getItem('userSession');
      if (sessionRaw) {
        const s = JSON.parse(sessionRaw);
        // Try multiple known shapes
        const url =
          s?.profile?.profile_picture_url ||
          s?.user?.profile_picture_url ||
          s?.user?.user_metadata?.profile_picture_url ||
          s?.user?.user_metadata?.avatar_url ||
          s?.profile?.avatar_url;
        if (url && typeof url === 'string') {
          const u = url.trim();
          if (u && u !== 'null' && u !== 'undefined') {
            if (u.startsWith('http://') || u.startsWith('https://')) return u;
            if (u.startsWith('/')) return `${API_BASE_URL.replace(/\/$/, '')}${u}`;
            if (u.startsWith('data:')) return u;
          }
        }
      }
    } catch (_) {}
    try {
      const local = localStorage.getItem('profilePicture');
      if (local) {
        const l = local.trim();
        if (l && l !== 'null' && l !== 'undefined') return l;
      }
    } catch (_) {}
    // No actual user avatar stored anywhere -> return generated initial avatar
    // Return empty string so caller can decide to render placeholder component (icon)
    return '';
  };

  const handleAddComment = (postId: string) => {
    const commentText = newComment()[postId]?.trim();
    if (!commentText) return;

    // Always prefer actual username; never store literal 'You' as author
    const authorName = getCurrentUsername() || 'Guest';
    // If user does not have an uploaded avatar, keep it empty string so UI can show placeholder icon
    const rawAvatar = getCurrentUserAvatar();
    const avatar = userHasAvatar() ? ensureAvatar(rawAvatar) : '';

    const existing = comments()[postId] || [];
    const newEntry = { id: `${postId}-${Date.now()}`, text: commentText, author: authorName, avatar, ts: Date.now() };
    const updated = { ...comments(), [postId]: [...existing, newEntry] };
    setComments(updated);
    persistComments(updated);
    setNewComment({ ...newComment(), [postId]: '' });
    if (!openComments()[postId]) toggleComments(postId);
  };

  const filteredPosts = () =>
    posts().filter(
      (p) =>
        p.author_name.toLowerCase().includes(query().toLowerCase()) ||
        (p.content && p.content.toLowerCase().includes(query().toLowerCase())) ||
        (p.author_primary_skill && p.author_primary_skill.toLowerCase().includes(query().toLowerCase()))
    );

  // Also update the loadPosts function to ensure proper avatar handling
  const loadPosts = async () => {
    setLoadingPosts(true);
    setPostsError(null);
    
    try {
      console.log("=== LOADING POSTS FROM API ===");
      const resp = await ApiService.getPosts();
      console.log("API Response:", resp);
      
      const data = resp.data ?? [];
      console.log("Posts data:", data);
      
      // Get current user info for comparison
      const currentUserInfo = getCurrentUser();
      
      // Process backend posts with proper avatar handling
      const backendPosts = (Array.isArray(data) ? data : []).map((p: EnhancedPostResponse) => {
        console.log("Processing backend post:", p);
        
        // Handle avatar URL conversion for backend posts only
        let processedAvatar = p.author_avatar;
        if (processedAvatar && typeof processedAvatar === 'string' && !processedAvatar.startsWith('http')) {
          processedAvatar = processedAvatar.startsWith('/') 
            ? `${API_BASE_URL.replace(/\/$/, "")}${processedAvatar}`
            : processedAvatar;
        }
        
        // Determine ownership if backend did not set it
        const sessionUserId = currentUserInfo?.profile?.id || currentUserInfo?.profile?.user_id || currentUserInfo?.user_id || currentUserInfo?.user?.id;
        const derivedOwn = !!sessionUserId && p.user_id === sessionUserId;

        const isOwn = typeof p.is_own_post === 'boolean' ? p.is_own_post : derivedOwn;

        const finalAvatar = ensureAvatar(
          processedAvatar || (isOwn && currentUserInfo?.profile?.profile_picture_url ? currentUserInfo.profile.profile_picture_url : '')
        );
        return {
          ...p,
          is_own_post: isOwn,
          author_name: p.author_name || (isOwn ? (getCurrentUsername() || 'You') : 'Anonymous User'),
          author_avatar: finalAvatar,
          author_role: p.author_primary_skill || 'User',
          content: p.content || 'No content',
        };
      });

      console.log("Processed backend posts:", backendPosts);
      
      // Combine backend posts with seed posts (backend posts first)
      const combined = [...backendPosts, ...seedPosts];
      setPosts(combined);
      try {
        sessionStorage.setItem('cachedPosts', JSON.stringify(combined));
      } catch (e) {
        console.warn('Failed to cache posts', e);
      }
      
    } catch (err: any) {
      console.error('Load posts failed:', err);
      setPostsError('Gagal memuat posts dari server. Menggunakan data demo.');
      // Use seed posts as fallback
  setPosts(seedPosts);
  try { sessionStorage.setItem('cachedPosts', JSON.stringify(seedPosts)); } catch(_) {}
    } finally {
      setLoadingPosts(false);
    }
  };

  const getDisplayAvatar = (post: EnhancedPostResponse) => {
    // For own posts, try to get avatar from multiple sources with proper URL handling
    if (post.is_own_post) {
      const user = getCurrentUser();
      
      // Priority 1: User session profile picture (convert relative to absolute if needed)
      if (user?.profile?.profile_picture_url) {
        const avatarUrl = user.profile.profile_picture_url;
        if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
          return avatarUrl;
        } else {
          // Convert relative URL to absolute (same logic as Profile component)
          return `${API_BASE_URL.replace(/\/$/, "")}${avatarUrl}`;
        }
      }
      
      // Priority 2: localStorage profile picture (fallback from Profile component)
      const localAvatar = localStorage.getItem("profilePicture");
      if (localAvatar) {
        // Check if it's a relative URL that needs to be converted to absolute
        if (localAvatar.startsWith('/') && !localAvatar.startsWith('http')) {
          return `${API_BASE_URL.replace(/\/$/, "")}${localAvatar}`;
        }
        return localAvatar;
      }
    }
    
    // For other users' posts, check if avatar is already an imported image (like seed posts)
    if (post.author_avatar) {
      // If it's already a processed image (from import), return as is
      if (typeof post.author_avatar === 'string') {
        // Check if it's a blob URL (from imported images) or data URL
        if (post.author_avatar.startsWith('blob:') || 
            post.author_avatar.startsWith('data:') ||
            post.author_avatar.startsWith('/_astro/') || // Vite/Astro processed images
            post.author_avatar.startsWith('/src/') ||    // Direct imports
            post.author_avatar.startsWith('/assets/')) { // Asset imports
          return post.author_avatar;
        }
        
        // Handle HTTP/HTTPS URLs
        if (post.author_avatar.startsWith('http://') || post.author_avatar.startsWith('https://')) {
          return post.author_avatar;
        } 
        
        // Handle relative URLs from backend
        if (post.author_avatar.startsWith('/')) {
          return `${API_BASE_URL.replace(/\/$/, "")}${post.author_avatar}`;
        }
      }
      
      // If it's not a string (could be imported image object), return as is
      return post.author_avatar;
    }
    
    // Default avatars based on primary skill
    if (post.author_primary_skill?.toLowerCase().includes('art')) return W1;
    if (post.author_primary_skill?.toLowerCase().includes('design')) return Male1;  
    if (post.author_primary_skill?.toLowerCase().includes('programming') || 
        post.author_primary_skill?.toLowerCase().includes('web development')) return W2;
    return W1; // default fallback
  };

  const getDisplayRole = (post: EnhancedPostResponse) => {
    return post.author_primary_skill || 'User';
  };

  onMount(() => {
    // Get current user info
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log("Current user:", user);

    // Migrate existing local comments: replace 'You' or 'Guest' with actual username; clear fallback avatar if user lacks PFP; fill blank if now uploaded
    try {
      const uname = getCurrentUsername();
      const hasAvatar = userHasAvatar();
      const currentAvatar = hasAvatar ? getCurrentUserAvatar() : '';
      if (uname) {
        const raw = localStorage.getItem('localComments');
        if (raw) {
          const parsed = JSON.parse(raw);
          let changed = false;
          Object.keys(parsed).forEach(pid => {
            parsed[pid] = (parsed[pid] || []).map((cm: any) => {
              if (!cm) return cm;
              let updated = { ...cm };
              if (updated.author === 'You' || updated.author === 'Guest') { updated.author = uname; changed = true; }
              if (!hasAvatar && updated.avatar && updated.avatar === W1) { updated.avatar = ''; changed = true; }
              if (hasAvatar && (!updated.avatar || updated.avatar === '')) { updated.avatar = currentAvatar; changed = true; }
              return updated;
            });
          });
          if (changed) {
            localStorage.setItem('localComments', JSON.stringify(parsed));
            setComments(parsed);
          }
        }
      }
    } catch(e) { console.warn('Comment migration failed', e); }
    
    // Load posts
    loadPosts();
  });

  return (
    <div class="min-h-screen overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <div class="pt-20 pb-8 px-4 m-10">
        <div class="max-w-7xl mx-auto">
          <div class="text-center animate-fade-in-up">
            <h1 class="text-hero mb-6">Welcome to BarterUp</h1>
            <p class="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover amazing skills, share your talents, and build meaningful connections through the power of bartering.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="px-4 pb-8">
        <div class="max-w-7xl mx-auto">
          
          {/* Search Bar */}
          <div class="mb-8 animate-slide-in">
            <div class="max-w-2xl mx-auto relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                class="input-modern input-with-icon-left py-4 text-lg"
                placeholder="Search for skills, talents, or posts..."
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
              />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Feed Section */}
            <div class="lg:col-span-3 space-y-6">
              
              {/* Quick Stats Cards */}
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              
                <div class="card-modern hover-scale">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-base sm:text-lg font-semibold text-gradient">Liked Posts</h3>
                      <p class="text-2xl sm:text-3xl font-bold mt-2">{likedCount()}</p>
                    </div>
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style="background: var(--gradient-primary);">
                      <svg class="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                  </div>
                </div>
                <div class="card-modern hover-scale">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-base sm:text-lg font-semibold text-gradient">Following</h3>
                      <p class="text-2xl sm:text-3xl font-bold mt-2">{communityCount()}</p>
                    </div>
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style="background: var(--gradient-primary);">
                      <svg class="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                  </div>
                </div>
                <div class="card-modern hover-scale">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-base sm:text-lg font-semibold text-gradient">Your Posts</h3>
                      <p class="text-2xl sm:text-3xl font-bold mt-2">{ownPostCount()}</p>
                    </div>
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style="background: var(--gradient-primary);">
                      <svg class="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              <Show when={loadingPosts()}>
                <div class="space-y-6">
                  {Array.from({length: 3}).map(() => (
                    <div class="card-post loading">
                      <div class="animate-pulse">
                        <div class="flex items-center space-x-3 mb-4">
                          <div class="w-12 h-12 bg-gray-700 rounded-full"></div>
                          <div class="space-y-2">
                            <div class="h-4 bg-gray-700 rounded w-24"></div>
                            <div class="h-3 bg-gray-700 rounded w-32"></div>
                          </div>
                        </div>
                        <div class="space-y-2">
                          <div class="h-4 bg-gray-700 rounded"></div>
                          <div class="h-4 bg-gray-700 rounded w-5/6"></div>
                          <div class="h-4 bg-gray-700 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Show>

              {/* Error State */}
              <Show when={postsError()}>
                <div class="card-modern border-red-500/20 bg-red-500/10">
                  <div class="flex items-center space-x-3">
                    <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-red-300">{postsError()}</p>
                  </div>
                </div>
              </Show>

              {/* Empty State */}
              <Show when={!loadingPosts() && filteredPosts().length === 0}>
                <div class="card-modern text-center py-12">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style="background: var(--gradient-primary);">
                    <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">No posts yet</h3>
                  <p class="text-gray-400 mb-4">Be the first to share your skills with the community!</p>
                  <a href="/post" class="btn btn-primary">Create Your First Post</a>
                </div>
              </Show>

              {/* Posts Feed */}
              <For each={filteredPosts()}>
                {(post, index) => (
                  <div class="card-post animate-fade-in-up" style={`animation-delay: ${index() * 0.1}s`}>
                    
                    {/* Post Header */}
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div class="flex items-center space-x-3 sm:space-x-4">
                        <div class="relative flex-shrink-0">
                          {post.is_own_post && !userHasAvatar() ? (
                            <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 border-primary/20" style="background: var(--gradient-primary);">
                              <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          ) : (
                            <img
                              class="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-primary/20"
                              src={getDisplayAvatar(post)}
                              alt={post.author_name}
                              onError={(e) => { e.currentTarget.src = W1; }}
                            />
                          )}
                          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-5 sm:h-5 bg-green-400 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center space-x-2 mb-1">
                            <h3 class="font-semibold text-base sm:text-lg truncate" style={post.is_own_post ? "color: var(--primary)" : ""}>
                              {post.is_own_post ? (getCurrentUsername() || post.author_name || 'You') : post.author_name}
                            </h3>
                          </div>
                          <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span class="skill-badge secondary text-xs">
                              {getDisplayRole(post)}
                            </span>
                            <span class="text-gray-400 text-xs sm:text-sm">
                              {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-end sm:justify-start gap-1 sm:gap-2">
                        <Show when={!post.is_own_post}>
                          <button
                            class={`btn ${followed().has(post.author_name) ? 'btn-glass' : 'btn-primary'} text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-4`}
                            onClick={() => handleFollow(post)}
                          >
                            <svg class="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d={followed().has(post.author_name) 
                                  ? "M6 18L18 6M6 6l12 12"
                                  : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                                }
                              ></path>
                            </svg>
                            <span class="hidden sm:inline">{followed().has(post.author_name) ? 'Unfollow' : 'Follow'}</span>
                          </button>
                        </Show>
                          <Show when={post.is_own_post}>
                            <button
                              class="btn btn-glass text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3 hover:text-red-400"
                              onClick={() => deletePost(post.id)}
                              title="Delete this post"
                            >
                              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h2l1-1h2l1 1h2a1 1 0 011 1v1m-7 0h8" />
                              </svg>
                            </button>
                          </Show>
                        
                        <button
                          class={`relative flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg border transition-colors duration-200
                            ${isCommentsOpen(post.id)
                              ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                              : 'btn-glass border-white/10 hover:border-primary/40'}
                          `}
                          onClick={() => toggleComments(post.id)}
                          title={isCommentsOpen(post.id) ? 'Hide comments' : 'Show comments'}
                        >
                          <svg class={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${isCommentsOpen(post.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span class="hidden sm:inline">{isCommentsOpen(post.id) ? 'Hide' : 'Comments'}</span>
                          <span class={`ml-0.5 inline-flex items-center justify-center text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-medium transition-colors duration-200
                            ${isCommentsOpen(post.id) ? 'bg-primary/40 text-primary-foreground' : 'bg-white/10 text-gray-300'}`}
                          >{commentCount(post.id)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div class="mb-4">
                      <p class="text-gray-200 leading-relaxed whitespace-pre-line text-sm sm:text-lg">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Actions */}
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-white/10">
                      <div class="flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
                        <button
                          class={`flex items-center space-x-1 sm:space-x-2 transition-colors ${likedPosts().has(post.id) ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                          onClick={() => toggleLike(post.id)}
                        >
                          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill={likedPosts().has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span class="text-xs sm:text-sm">{likedPosts().has(post.id) ? 'Liked' : 'Like'}</span>
                        </button>
                        
                        {/* Share & Save buttons removed per request */}
                      </div>
                      
                      <div class="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                        {post.created_at ? new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div
                      class={`overflow-hidden transition-all duration-300 ease-out ${isCommentsOpen(post.id) ? 'max-h-[900px] opacity-100 mt-3 pt-3 border-t border-white/10' : 'max-h-0 opacity-0'} `}
                      aria-hidden={!isCommentsOpen(post.id)}
                    >
                    {isCommentsOpen(post.id) && (
                      <div class="">
                        <div class="mt-2 flex space-x-2 sm:space-x-3 items-start">
                          {userHasAvatar() ? (
                            <img class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0 border border-primary/30" src={getCurrentUserAvatar()} alt="You" />
                          ) : (
                            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-primary/30" style="background: var(--gradient-primary);">
                              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div class="flex-1 flex items-stretch gap-2 sm:gap-3">
                            <div class="flex-1">
                              <input
                                type="text"
                                class="input-modern w-full h-8 sm:h-9 px-3 text-xs sm:text-sm placeholder:text-gray-500"
                                value={newComment()[post.id] || ''}
                                placeholder="Share your thoughts..."
                                onInput={e => setNewComment({ 
                                  ...newComment(), 
                                  [post.id]: e.currentTarget.value 
                                })}
                                onKeyDown={e => { if ((e as KeyboardEvent).key === 'Enter') { e.preventDefault(); handleAddComment(post.id); }} }
                              />
                            </div>
                            <button
                              class="btn btn-primary h-8 sm:h-9 px-4 flex items-center justify-center  shadow-sm hover:shadow-md transition-shadow"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment()[post.id]?.trim()}
                              title="Send"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <Show when={(comments()[post.id] || []).length > 0}>
                          <div class="mt-6 space-y-4">
                            <For each={comments()[post.id] || []}>
                              {(c) => (
                                <div class="flex items-start space-x-2.5 group">
                                  {c.avatar ? (
                                    <img src={c.avatar} alt={c.author} class="w-8 h-8 rounded-full object-cover border border-primary/30" />
                                  ) : (
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center border border-primary/30" style="background: var(--gradient-primary);">
                                      <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  )}
                                  <div class="flex-1">
                                    <div class="flex items-center space-x-1.5">
                                      <span class="text-[11px] font-semibold text-primary">{c.author || getCurrentUsername() || 'Guest'}</span>
                                      <span class="text-[10px] text-gray-500">{new Date(c.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p class="text-[11px] sm:text-xs text-gray-200 whitespace-pre-wrap leading-snug">{c.text}</p>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                    )}
                    </div>
                  </div>
                )}
              </For>
            </div>

            {/* Enhanced Sidebar */}
            <div class="lg:col-span-1 space-y-6">
            
              
              {/* Community */}
              <div class="card-modern">
                <div class="mb-4">
                  <span class="skill-badge text-xs">{communityCount()} Connected</span>
                </div>
                
                <Show when={contacts().length === 0 && followed().size === 0}>
                  <div class="text-center py-6">
                    <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style="background: var(--glass-bg);">
                      <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <p class="text-gray-400 text-sm mb-3">Start connecting!</p>
                    <p class="text-xs text-gray-500">Follow skilled members to build your network</p>
                  </div>
                </Show>
                
                <For each={contacts()}>
                  {(contact) => (
                    <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                      <img class="w-10 h-10 rounded-full object-cover border border-primary/20" src={contact.avatar} alt={contact.name} />
                      <div class="flex-1">
                        <p class="font-medium text-sm">{contact.name}</p>
                        <p class="text-xs text-gray-400">Connected</p>
                      </div>
                      <a href="/messages" class="btn btn-glass text-xs py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        Message
                      </a>
                    </div>
                  )}
                </For>
              </div>

              {/* Trending Skills */}
              <div class="card-modern">
                <h3 class="text-lg font-semibold text-gradient mb-4">Trending Skills</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm">JavaScript</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div class="w-4/5 h-full" style="background: var(--gradient-primary);"></div>
                      </div>
                      <span class="text-xs text-gray-400">80%</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm">Digital Art</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div class="w-3/5 h-full" style="background: var(--gradient-primary);"></div>
                      </div>
                      <span class="text-xs text-gray-400">60%</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm">Photography</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div class="w-2/5 h-full" style="background: var(--gradient-primary);"></div>
                      </div>
                      <span class="text-xs text-gray-400">40%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div class="card-modern">
                <h3 class="text-lg font-semibold text-gradient mb-4">Quick Actions</h3>
                <div class="space-y-2">
                  <a href="/post" class="w-full btn btn-primary text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Share Skill
                  </a>
                  <a href="/messages" class="w-full btn btn-glass text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    View Messages
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;