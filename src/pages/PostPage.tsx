// src/pages/PostPage.tsx
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import Navbar from "../components/Navbar";
import { ApiService, handleApiError } from "../services/api";
import { useNavigate } from "@solidjs/router";

const PostPage: Component = () => {
  const [content, setContent] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const nav = useNavigate();

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    
    const text = content().trim();
    if (!text) {
      setError("Isi postingan tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      // Actually call the API to create the post
      console.log("Creating post with content:", text);
      
      const response = await ApiService.createPost({
        content: text,
        image_url: null // Add image support later if needed
      });
      
      console.log("Post created successfully:", response);
      setSuccess("Post berhasil dibuat!");
      setContent("");
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => nav("/dashboard"), 1500);
      
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="font-inter min-h-screen overflow-x-hidden">
      <Navbar />
      
      <main class="pt-16 sm:pt-20 px-4 max-w-4xl mx-auto">
        {/* Header Section */}
        <div class="text-center mb-6 sm:mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4" style="background: var(--gradient-primary)">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gradient mb-2">Share Your Skills</h1>
          <p class="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Connect with others by sharing what you know or what you need to learn. Build meaningful exchanges in your community.
          </p>
        </div>

        {/* Enhanced Post Form */}
        <div class="glass-card max-w-2xl mx-auto">
          <div class="p-8">
            <form onSubmit={(e) => handleSubmit(e)} class="space-y-6">
              
              {/* Content Input */}
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-200">
                  What would you like to share?
                </label>
                <div class="relative">
                  <textarea
                    value={content()}
                    onInput={(e) => setContent(e.currentTarget.value)}
                    placeholder="Share your skills, experiences, or ask for help with something you'd like to learn..."
                    maxlength={2000}
                    class="input-modern w-full min-h-[180px] resize-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    style="padding-top: 1rem; padding-bottom: 3rem;"
                  />
                  
                  {/* Character Counter */}
                  <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    <span class={content().length > 1800 ? "text-yellow-400" : content().length > 1900 ? "text-orange-400" : ""}>
                      {content().length}
                    </span>
                    <span class="text-gray-500">/2000</span>
                  </div>
                </div>
              </div>

              {/* Message Display */}
              <Show when={error() || success()}>
                <div class="space-y-2">
                  <Show when={error()}>
                    <div class="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center space-x-2">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{error()}</span>
                    </div>
                  </Show>
                  <Show when={success()}>
                    <div class="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm flex items-center space-x-2">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{success()}</span>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Action Buttons */}
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
                <button
                  type="button"
                  class="px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-white/20 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                  onClick={() => { 
                    setContent(""); 
                    setError(null); 
                    setSuccess(null);
                  }}
                  disabled={loading()}
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <span>Reset</span>
                </button>

                <div class="flex items-center space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    class="px-4 py-2 sm:px-6 sm:py-3 rounded-lg glass hover:glass-strong text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                    onClick={() => nav("/dashboard")}
                    disabled={loading()}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    class="btn btn-primary px-6 py-2 sm:px-8 sm:py-3 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                    disabled={loading() || !content().trim()}
                  >
                    <Show when={loading()}>
                      <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    </Show>
                    <Show when={!loading()}>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                    </Show>
                    <span>{loading() ? "Publishing..." : "Share Post"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tips Section */}
        <div class="mt-12 max-w-2xl mx-auto">
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gradient mb-3 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <span>Tips for Great Posts</span>
            </h3>
            <ul class="space-y-2 text-sm text-gray-300">
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Be specific about what skills you can teach or want to learn</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Mention your experience level and what you're looking for in return</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Include examples of your work or learning goals to attract the right connections</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-primary mt-1">•</span>
                <span>Keep it friendly and professional to encourage meaningful exchanges</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostPage;