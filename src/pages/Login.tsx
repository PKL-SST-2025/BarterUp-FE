import type { Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

const Login: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate fields
    if (!email() || !password()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const loginData = {
        email: email().trim().toLowerCase(),
        password: password(),
      };

      const response = await ApiService.login(loginData);
      
      if (response.status === 'success') {
        try {
          // Clear stale per-user items
          const preserveKeys = new Set(['signupData']);
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && !preserveKeys.has(k)) {
              // Mark to remove after iteration (can't remove while iterating forward reliably)
            }
          }
          // Simpler: just clear everything then restore signupData if necessary
          const signupBackup = sessionStorage.getItem('signupData');
          sessionStorage.clear();
          if (signupBackup) sessionStorage.setItem('signupData', signupBackup);

          // Clear per-user localStorage items that should not leak between accounts
          // Remove all user-specific cached artifacts so akun lama tidak bocor ke akun baru
          localStorage.removeItem('profilePicture');
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('user');
          localStorage.removeItem('userDetails');
          localStorage.removeItem('cachedPosts');
          localStorage.removeItem('followedUsers');
          localStorage.removeItem('likedPosts');
          // Keep savedUsername separate (will be overwritten later if new one saved)

          // Build unified session object (store whole response.data for flexibility)
          sessionStorage.setItem('userSession', JSON.stringify(response.data));
          const accessToken = response.data?.session?.access_token || response.data?.session?.accessToken;
          if (accessToken) sessionStorage.setItem('access_token', accessToken);

          // Broadcast event so Navbar/Profile can refresh
          window.dispatchEvent(new CustomEvent('session-changed'));
        } catch (e) {
          console.warn('Failed to store session cleanly', e);
        }

        // Navigation decision
        if (response.data.next_step === 'complete_profile') {
          sessionStorage.setItem('signupData', JSON.stringify(loginData));
          navigate('/signup/personal');
        } else if (response.data.next_step === 'dashboard') {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="font-inter min-h-screen overflow-x-hidden relative" style="background: var(--bg-primary);">
      
      {/* Background Elements */}
      <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-glow"></div>
      <div class="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 1s"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 2s"></div>

      <div class="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        
        {/* Logo Section */}
        <div class="text-center m-12 animate-fade-in-up">          
          <h1 class="text-hero mb-2">BarterUp</h1>
          <p class="text-xl text-gray-300">Exchange skills, build connections</p>
        </div>

        {/* Login Form */}
        <div class="w-full max-w-md animate-slide-in">
          <div class="card-modern p-8">
            
            {/* Form Header */}
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gradient mb-2">Welcome Back</h2>
              <p class="text-gray-300">
                Sign in to reconnect and keep swapping skills
              </p>
            </div>

            {/* Error Message */}
            {error() && (
              <div class="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 animate-fade-in-up">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-red-300 text-sm">{error()}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form class="space-y-4 sm:space-y-6" onSubmit={handleLogin}>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email()}
                    onInput={e => setEmail(e.currentTarget.value)}
                    disabled={loading()}
                    class="input-modern pl-10 sm:pl-12 py-3 sm:py-4 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password()}
                    onInput={e => setPassword(e.currentTarget.value)}
                    disabled={loading()}
                    class="input-modern pl-10 sm:pl-12 py-3 sm:py-4 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded border-gray-600 bg-white/10 text-primary focus:ring-primary/50" />
                  <span class="text-gray-300">Remember me</span>
                </label>
                <a href="#" class="text-primary hover:text-primary-light transition-colors duration-200">
                  Forgot password?
                </a>
              </div>

              <button 
                type="submit" 
                disabled={loading()}
                class="w-full btn btn-primary py-3 sm:py-4 text-base sm:text-lg font-semibold relative overflow-hidden"
              >
                {loading() ? (
                  <div class="flex items-center justify-center space-x-2">
                    <div class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div class="flex items-center justify-center space-x-2">
                    <span>Sign In to BarterUp</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div class="my-8 flex items-center">
              <div class="flex-1 border-t border-white/20"></div>
              <div class="px-4 text-gray-400 text-sm">or</div>
              <div class="flex-1 border-t border-white/20"></div>
            </div>

            

            {/* Sign Up Link */}
            <div class="mt-8 text-center">
              <p class="text-gray-300">
                Don't have an account?{" "}
                <A href="/signup" class="text-primary hover:text-primary-light font-semibold transition-colors duration-200">
                  Create Account
                </A>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 BarterUp. Built for skill sharing community.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
