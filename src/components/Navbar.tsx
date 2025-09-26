// src/components/Navbar.tsx
import type { Component } from "solid-js";
import { initFlowbite } from 'flowbite';
import { A } from "@solidjs/router";
import { onMount, createSignal } from 'solid-js';

const Navbar: Component = () => {
  const [isScrolled, setIsScrolled] = createSignal(false);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  
  onMount(() => {
    initFlowbite();
    
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  const [avatar, setAvatar] = createSignal<string | null>(null);

  const loadSessionData = () => {
    try {
      const raw = sessionStorage.getItem('userSession');
      if (raw) {
        const js = JSON.parse(raw);
  // (Optional) email / username available if needed:
  // const email = js?.user?.email || js?.profile?.email || '';
  // const uname = js?.user?.user_metadata?.username || js?.user?.username || js?.profile?.username || '';
        // Avatar priority: localStorage.profilePicture -> session.profile.profile_picture_url -> js.user.user_metadata.avatar_url
        const local = localStorage.getItem('profilePicture');
        const sessionAvatar = js?.profile?.profile_picture_url || js?.user?.user_metadata?.avatar_url;
        setAvatar(local || sessionAvatar || null);
      } else {
        const local = localStorage.getItem('profilePicture');
        setAvatar(local);
      }
    } catch (e) {
      console.warn('Failed to parse userSession for navbar', e);
    }
  };

  const signOut = () => {
    try {
      // Clear session & volatile per-user data
      sessionStorage.clear();
      localStorage.removeItem('profilePicture');
      localStorage.removeItem('savedUsername');
      localStorage.removeItem('user');
      localStorage.removeItem('userDetails');
      localStorage.removeItem('cachedPosts');
      localStorage.removeItem('followedUsers');
      localStorage.removeItem('likedPosts');
      setAvatar(null);
      window.dispatchEvent(new CustomEvent('session-changed'));
      // Redirect manual (no router import here, use location)
      window.location.href = '/login';
    } catch (e) {
      console.warn('Sign out cleanup failed', e);
      window.location.href = '/login';
    }
  };

  onMount(() => {
    loadSessionData();
    const handler = () => loadSessionData();
    window.addEventListener('session-changed', handler as any);
    return () => window.removeEventListener('session-changed', handler as any);
  });

  return (
    <div class="fixed w-full z-50 top-0 left-0 transition-all duration-300">
      <nav class={`transition-all duration-300 ${
        isScrolled() 
          ? 'glass-strong backdrop-blur-strong shadow-xl' 
          : 'glass backdrop-blur-md'
      }`}>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center h-16">
            
            {/* Left: Brand */}
            <div class="flex-shrink-0">
              <a href="/dashboard" class="flex items-center space-x-3 group">
                <div class="logo-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
            </div>
                <span class="text-xl font-bold text-gradient hidden sm:block">
                  BarterUp
                </span>
              </a>
            </div>

            {/* Center: Navigation Links (Desktop) */}
            <div class="flex-1 flex justify-center">
              <div class="hidden md:flex items-center space-x-1">
                <A 
                  href="/dashboard" 
                  class="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-300 hover:text-primary hover:bg-glass transition-all duration-300 group"
                >
                  <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <span class="font-medium">Home</span>
                </A>
                
                <A 
                  href="/messages" 
                  class="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-300 hover:text-secondary hover:bg-glass transition-all duration-300 group"
                >
                  <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <span class="font-medium">Messages</span>
                </A>
              </div>
            </div>

            {/* Right: Actions & Profile */}
            <div class="flex items-center space-x-2 sm:space-x-3">
              
              {/* Share Skill Button - Desktop */}
              <A 
                href="/post" 
                class="hidden md:flex btn btn-primary text-sm items-center space-x-2 group"
              >
                <svg class="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                <span>Share</span>
              </A>
              
              {/* Profile Dropdown */}
              <div class="relative">
                <button 
                  id="dropdownDefaultButton" 
                  data-dropdown-toggle="dropdown" 
                  type="button"
                  class="flex items-center p-1.5 rounded-lg hover:bg-glass transition-all duration-300 group"
                >
                  {avatar() ? (
                    <div class="relative">
                      <img
                        src={avatar()!}
                        alt="Profile"
                        class="w-8 h-8 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary transition-colors duration-300"
                      />
                      <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                    </div>
                    ) : (
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: var(--gradient-primary);">
                      <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                  )}
                </button>

                <div id="dropdown" class="z-10 hidden w-52 rounded-xl shadow-xl border border-white/10 backdrop-blur-md bg-[rgba(20,40,48,0.95)]">
                  <div class="p-3 border-b border-white/10">
                    <p class="text-sm font-medium text-white">Account</p>
                    <p class="text-xs text-gray-400 mt-0.5">Manage your profile</p>
                  </div>
                  <ul class="py-2 text-sm text-gray-200">
                    <li>
                      <a href="/profile" class="flex items-center space-x-3 px-3 py-2.5 hover:bg-white/10 transition-colors duration-150">
                        <svg class="w-4 h-4 text-primary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Edit Profile</span>
                      </a>
                    </li>
                    <li class="border-t border-white/10 mt-1 pt-1">
                      <button type="button" onClick={signOut} class="w-full text-left flex items-center space-x-3 px-3 py-2.5 text-red-300/90 hover:text-red-200 hover:bg-red-500/20 transition-colors duration-150">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <button
                type="button"
                class="inline-flex items-center p-2 w-8 h-8 sm:w-10 sm:h-10 justify-center text-gray-400 rounded-lg md:hidden hover:bg-glass focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen())}
              >
                <span class="sr-only">Open main menu</span>
                <svg class={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isMenuOpen() ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div class={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen() ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div class="glass-strong border-t border-white/10 backdrop-blur-md">
            <div class="px-2 pt-2 pb-3 space-y-1">
              <A
                href="/dashboard"
                class="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-primary hover:bg-glass transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span>Home</span>
              </A>
              
              <A
                href="/messages"
                class="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-secondary hover:bg-glass transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>Messages</span>
              </A>
              
              <A
                href="/post"
                class="flex items-center space-x-3 px-3 py-3 rounded-lg text-primary hover:bg-primary/20 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                <span>Share Skill</span>
              </A>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
