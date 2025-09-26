// src/pages/Post.tsx
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

interface Props {
  onPostCreated?: (post: any) => void;
}

const PostModal: Component<Props> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [content, setContent] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const openModal = () => {
    setError(null);
    setSuccess(null);
    setContent("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setLoading(false);
    setError(null);
    setSuccess(null);
  };

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
      const created = await ApiService.createPost({ content: text });
      setSuccess("Post berhasil dibuat.");
      // Beri tahu parent
      props.onPostCreated?.(created.data ?? created);
      setContent("");
      setTimeout(() => closeModal(), 600);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Enhanced Floating New Post Button */}
      <button
        class="fixed bottom-8 right-8 z-50 btn btn-primary w-14 h-14 rounded-full shadow-xl flex items-center justify-center group hover:scale-105 transition-all duration-300"
        aria-label="Create post"
        onClick={openModal}
        title="Share a new skill or learning opportunity"
      >
        <svg class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
        </svg>
      </button>

      {/* Enhanced Modal */}
      <Show when={open()}>
        <div class="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal Content */}
          <form
            class="relative z-50 w-full max-w-2xl glass-card shadow-2xl animate-modal-in"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div class="p-8">
              {/* Header */}
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--gradient-primary)">
                    <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gradient">Share Your Skills</h3>
                    <p class="text-sm text-gray-400">Connect with your community</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  class="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={closeModal}
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Content Input */}
              <div class="space-y-4">
                <div class="relative">
                  <textarea
                    value={content()}
                    onInput={(e) => setContent(e.currentTarget.value)}
                    placeholder="What skills do you want to share or learn? Be specific about what you can teach or what you're looking for..."
                    maxlength={2000}
                    class="input-modern w-full min-h-[160px] resize-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    style="padding-top: 1rem; padding-bottom: 2.5rem;"
                  />
                  
                  {/* Character Counter */}
                  <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    <span class={content().length > 1800 ? "text-yellow-400" : content().length > 1900 ? "text-orange-400" : ""}>
                      {content().length}
                    </span>
                    <span class="text-gray-500">/2000</span>
                  </div>
                </div>

                {/* Messages */}
                <Show when={error() || success()}>
                  <div class="space-y-2">
                    <Show when={error()}>
                      <div class="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center space-x-2">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{error()}</span>
                      </div>
                    </Show>
                    <Show when={success()}>
                      <div class="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm flex items-center space-x-2">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{success()}</span>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>

              {/* Action Buttons */}
              <div class="flex items-center justify-between pt-6">
                <button
                  type="button"
                  class="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2"
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

                <div class="flex items-center space-x-3">
                  <button
                    type="button"
                    class="px-6 py-3 rounded-lg glass hover:glass-strong text-gray-300 hover:text-white transition-all duration-300"
                    onClick={closeModal}
                    disabled={loading()}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    class="btn btn-primary px-8 py-3 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </form>
        </div>
      </Show>
    </>
  );
};

export default PostModal;
