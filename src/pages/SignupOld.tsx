import type { Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

const Signup: Component = () => {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

const handleSignup = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate fields
    if (!username() || !email() || !password()) {
      setError("Username, email, and password are required.");
      setLoading(false);
      return;
    }

    if (password().length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const signupData = {
        username: username().trim(),
        email: email().trim().toLowerCase(),
        password: password(),
        // Temporary default date_of_birth to satisfy UnifiedSignupRequest; legacy flow replaced by new unified form.
        date_of_birth: '2000-01-01',
      };

      const response = await ApiService.signup(signupData);
      
      if (response.status === 'success') {
        // Store signup data untuk personal detail step
        sessionStorage.setItem('signupData', JSON.stringify(signupData));
        
        // Redirect to personal detail page
        navigate("/signup/personal");
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="overflow-x-hidden">
    <div class="font-poppins h-screen  flex flex-col justify-center items-center bg-gradient-to-b from-[#004041] via-[#002929] to-black px-4 ">
    <h1 class="text-4xl text-white sm:text-6xl font-extrabold text-center mb-4 ">BarterUp</h1>
    <div class="relative z-10 max-w-sm mx-auto bg-gradient-to-b from-[#00635F]/80 to-[#002929]/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
      {/* Judul */}
      <h2 class="text-2xl font-bold text-white ">Create Account</h2>
      <p class="text-gray-200 mb-6 text-m">
        Create an account and start swapping skills.
      </p>
      {error() && (
        <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p class="text-red-300 text-sm">{error()}</p>
        </div>
      )}

      {/* Form */}
      <form class="flex flex-col gap-4" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username()}
          onInput={e => setUsername(e.currentTarget.value)}
          disabled={loading()}
          class="w-full px-4 py-2 rounded-lg bg-[#000000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50"
        />
        <input
          type="email"
          placeholder="Email"
          value={email()}
          onInput={e => setEmail(e.currentTarget.value)}
          disabled={loading()}
          class="w-full px-4 py-2 rounded-lg bg-[#000000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50"
        />
        <input
          type="password"
          placeholder="Password"
          value={password()}
          onInput={e => setPassword(e.currentTarget.value)}
          disabled={loading()}
          class="w-full px-4 py-2 rounded-lg bg-[#000000]/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50"
        />

        <button type="submit" disabled={loading()} class="w-full mt-4 py-2 rounded-lg bg-[#4CE0D2] text-black font-semibold hover:bg-[#36C9B9] transition">{loading() ? "Creating Account..." : "Create Account"}</button>
      </form>

      {/* Link ke login */}
      <p class="mt-4 text-center text-gray-200 text-sm">
        Already have an account?{" "}
        <A href="/login" class="text-[#4CE0D2] hover:underline">
          Log In
        </A>
      </p>
    </div>
  </div>
  </div>

  );
};

export default Signup;
