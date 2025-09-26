import type { Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, createResource } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

const Signup: Component = () => {
  const navigate = useNavigate();
  const [step, setStep] = createSignal(1);
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  // New signals for step 4
  const [day, setDay] = createSignal("");
  const [month, setMonth] = createSignal("");
  const [year, setYear] = createSignal("");
  const [primarySkill, setPrimarySkill] = createSignal("");
  const [skillToLearn, setSkillToLearn] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [showOptional, setShowOptional] = createSignal(false);
  // Profile picture (optional)
  const [profileFile, setProfileFile] = createSignal<File | null>(null);
  const [profilePreview, setProfilePreview] = createSignal<string>("");
  const [skillsData] = createResource(() => step() === 4 ? ApiService.getSkills() : null);

  // Default skill options (fallback + base set) and merged resolver
  const defaultSkillOptions = [
    'Music','Art','Cooking','Photography','Design',
    'Programming','Writing','Fitness','Gardening',
    'Language Learning','Data Science','Marketing',
    'Business','Teaching','Crafting'
  ];
  const mergedSkills = () => {
    try {
      const apiSkills: string[] = skillsData()?.data?.skills || [];
      const combined = [...defaultSkillOptions, ...apiSkills].filter(Boolean);
      // Unique + stable alphabetical order
      return Array.from(new Set(combined)).sort((a,b) => a.localeCompare(b));
    } catch(_) {
      return defaultSkillOptions;
    }
  };

  // Form validation functions
  const validateStep1 = () => {
    if (!email()) {
      setError("Email address is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!username()) {
      setError("Username is required");
      return false;
    }
    if (username().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username())) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    if (!password()) {
      setError("Password is required");
      return false;
    }
    if (password().length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password())) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return false;
    }
    if (password() !== confirmPassword()) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep4 = () => {
    // Birthday required per flow definition
    if (!day() || !month() || !year()) {
      setError("Birthday is required");
      return false;
    }
    const d = parseInt(day());
    const m = parseInt(month());
    const y = parseInt(year());
    const currentYear = new Date().getFullYear();
    if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > currentYear) {
      setError("Invalid date");
      return false;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    let isValid = false;
    
    switch (step()) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
    }

    if (isValid && step() < 4) {
      setStep(step() + 1);
      setError("");
    } else if (isValid && step() === 4) {
      handleSignup();
    }
  };

  const prevStep = () => {
    if (step() > 1) {
      setStep(step() - 1);
      setError("");
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const dobDisplay = `${day().padStart(2,'0')}/${month().padStart(2,'0')}/${year()}`; // human friendly
      const dobIso = `${year()}-${month().padStart(2,'0')}-${day().padStart(2,'0')}`; // normalized for inputs

      const finalPayload = {
        username: username().trim(),
        email: email().trim().toLowerCase(),
        password: password(),
        date_of_birth: dobDisplay,
        primary_skill: primarySkill() || undefined,
        skill_to_learn: skillToLearn() || undefined,
        bio: bio().trim() || undefined,
      };

      const response = await ApiService.signup(finalPayload);
      if (response.status === 'success') {
        // Store session & token
        if (response.data?.session) {
          sessionStorage.setItem('userSession', JSON.stringify(response.data.session));
          sessionStorage.setItem('access_token', response.data.session.access_token);
        }
        // Store account meta so Profile page can prefill without extra request
        try {
          sessionStorage.setItem('accountMeta', JSON.stringify({
            email: finalPayload.email,
            username: finalPayload.username,
            date_of_birth: finalPayload.date_of_birth,
            dateOfBirth: dobIso, // add camelCase + ISO for profile date inputs
          }));
        } catch (e) {
          console.warn('Failed to persist accountMeta', e);
        }
        // If user selected a profile picture, upload it now (best-effort, non-blocking for navigation)
        if (profileFile()) {
          try {
            const file = profileFile()!;
            const base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            await ApiService.uploadProfilePicture({
              image_data: base64Data,
              file_name: file.name,
              content_type: file.type || 'image/jpeg'
            });
          } catch (e) {
            console.warn('[signup] profile picture upload failed (ignored):', e);
          }
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextStep();
    }
  };

  return (
    <div class="font-inter min-h-screen relative overflow-hidden" style="background: var(--bg-primary);">
      {/* Background Elements */}
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-glow"></div>
        <div class="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 1s"></div>
        <div class="absolute bottom-32 left-1/4 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 2s"></div>
      </div>

      <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        
        {/* Header */}
        <div class="text-center mb-12 animate-fade-in-up">
          <A href="/" class="inline-flex items-center space-x-3 mb-8 group">
            <div class="logo-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
            </div>
            <span class="text-3xl font-bold text-gradient">BarterUp</span>
          </A>
          
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the Community
          </h1>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Start your skill-sharing journey today and connect with learners and teachers around you
          </p>
        </div>

        {/* Progress Indicator */}
        <div class="w-full max-w-md mb-8 animate-fade-in-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              {[1, 2, 3, 4].map((i) => {
                const current = i === step();
                const completed = i < step();
                return (
                  <div class="flex items-center" >
                    <div
                      class={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                        ${completed ? 'bg-white text-black scale-95 shadow-sm shadow-primary/40' : ''}
                        ${current && !completed ? 'bg-gray-800 ring-2 ring-primary text-primary scale-110' : ''}
                        ${!current && !completed ? 'bg-gray-600 text-gray-400' : ''}
                      `}
                      aria-current={current ? 'step' : undefined}
                    >
                      <span class="text-[10px] font-semibold select-none">
                        {completed ? (
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        ) : i}
                      </span>
                    </div>
                    {i !== 4 && (
                      <div class={`w-6 h-[2px] mx-1 transition-colors duration-300 ${i < step() ? 'bg-primary' : 'bg-gray-600'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            <span class="text-sm text-gray-400 font-medium tracking-tight">Step {step()} of 4</span>
          </div>
          <div class="h-2 bg-gray-700/70 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-500 ease-out"
              style={`width: ${(step() / 4) * 100}%`}
            />
          </div>
        </div>

        {/* Main Form Card */}
        <div class="w-full max-w-md">
          <div class="barter-card p-8 animate-fade-in-up" style="animation-delay: 0.2s">
            
            {/* Step 1: Email */}
            {step() === 1 && (
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-2">What's your email?</h2>
                  <p class="text-gray-400">We'll use this to create your account and send important updates</p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading()}
                      class="input-modern input-with-icon-left py-3 sm:py-4 text-sm sm:text-lg"
                      autofocus
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Username */}
            {step() === 2 && (
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-2">Choose your username</h2>
                  <p class="text-gray-400">This will be how others see you in the community</p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="skillswapper123"
                      value={username()}
                      onInput={(e) => setUsername(e.currentTarget.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading()}
                      class="input-modern input-with-icon-left py-3 sm:py-4 text-sm sm:text-lg"
                      autofocus
                    />
                  </div>
                  <p class="text-xs text-gray-500">3+ characters, letters, numbers, and underscores only</p>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step() === 3 && (
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-2">Secure your account</h2>
                  <p class="text-gray-400">Create a strong password to protect your profile</p>
                </div>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter a strong password"
                        value={password()}
                        onInput={(e) => setPassword(e.currentTarget.value)}
                        disabled={loading()}
                        class="input-modern input-with-icon-left py-3 sm:py-4 text-sm sm:text-lg"
                        autofocus
                      />
                    </div>
                  </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </div>
                      <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword()}
                        onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading()}
                        class="input-modern input-with-icon-left py-3 sm:py-4 text-sm sm:text-lg"
                      />
                    </div>
                  </div>

                  <div class="text-xs text-gray-500 space-y-1">
                    <p>Password must contain:</p>
                    <div class="grid grid-cols-1 gap-1 ml-4">
                      <div class={`flex items-center ${password().length >= 8 ? 'text-primary' : 'text-gray-500'}`}>
                        <svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        At least 8 characters
                      </div>
                      <div class={`flex items-center ${/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password()) ? 'text-primary' : 'text-gray-500'}`}>
                        <svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Uppercase, lowercase, and number
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Birthday & optional profile */}
            {step() === 4 && (
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-2">Your birthday</h2>
                  <p class="text-gray-400">We use this to calculate eligibility. Not shown publicly.</p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                  <div class="flex gap-2">
                    <input type="text" placeholder="DD" value={day()} onInput={e=>setDay(e.currentTarget.value)} maxLength={2} class="input-modern text-center" />
                    <input type="text" placeholder="MM" value={month()} onInput={e=>setMonth(e.currentTarget.value)} maxLength={2} class="input-modern text-center" />
                    <input type="text" placeholder="YYYY" value={year()} onInput={e=>setYear(e.currentTarget.value)} maxLength={4} class="input-modern text-center" />
                  </div>
                </div>

                <div class="space-y-2">
                  <button
                    type="button"
                    class="group w-full flex items-center gap-2 text-left text-sm font-medium mb-1 text-primary hover:text-primary-light transition"
                    onClick={() => setShowOptional(!showOptional())}
                  >
                    <svg
                      class={`w-4 h-4 transition-transform duration-300 ${showOptional() ? 'rotate-90 text-primary' : 'text-gray-400 group-hover:text-primary-light'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{showOptional() ? 'Hide optional profile fields' : 'Add optional profile details'}</span>
                  </button>
                  <div class="h-px bg-white/10"></div>
                </div>

                {showOptional() && (
                  <div class="space-y-4 animate-fade-in-up">
                    {/* Optional Profile Picture */}
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1">Profile Picture (optional)</label>
                      <div class="flex items-center gap-4">
                        <label class="w-24 h-24 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:border-primary/60 transition relative overflow-hidden">
                          {profilePreview() ? (
                            <img src={profilePreview()} alt="preview" class="object-cover w-full h-full" />
                          ) : (
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h2l2-3h6l2 3h2a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a3 3 0 100 6 3 3 0 000-6z" />
                            </svg>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            onChange={(e) => {
                              const file = e.currentTarget.files?.[0];
                              if (!file) return;
                              if (file.size > 20 * 1024 * 1024) { // 20MB limit
                                setError('File too large (max 20MB)');
                                return;
                              }
                              setProfileFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => setProfilePreview(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <div class="flex-1 text-xs text-gray-400 space-y-1">
                          <p>PNG, JPG, GIF, WEBP up to 20MB</p>
                          {profileFile() && (
                            <div class="flex items-center gap-2">
                              <span class="truncate max-w-[120px]">{profileFile()!.name}</span>
                              <button type="button" class="text-red-400 hover:text-red-300" onClick={() => { setProfileFile(null); setProfilePreview(''); }}>Remove</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1">Primary Skill (optional)</label>
                      <select value={primarySkill()} onChange={e=>setPrimarySkill(e.currentTarget.value)} class="input-modern">
                        <option value="">Select skill</option>
                        {mergedSkills().map((s:string)=>(<option value={s}>{s}</option>))}
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1">Skill to Learn (optional)</label>
                      <select value={skillToLearn()} onChange={e=>setSkillToLearn(e.currentTarget.value)} class="input-modern">
                        <option value="">Select skill</option>
                        {mergedSkills().map((s:string)=>(<option value={s}>{s}</option>))}
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1">Bio (optional)</label>
                      <textarea value={bio()} onInput={e=>setBio(e.currentTarget.value)} maxLength={1000} placeholder="Tell something about you" class="input-modern h-20 resize-none" />
                      <p class="text-xs text-gray-500 mt-1">{bio().length}/1000</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error() && (
              <div class="mt-6 glass-card border-l-4 border-secondary bg-secondary/10 p-4 rounded-lg animate-fade-in-up">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-secondary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-white text-sm">{error()}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div class="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              <button
                onClick={prevStep}
                disabled={step() === 1 || loading()}
                class={`btn btn-glass px-4 py-2 sm:px-6 sm:py-3 ${
                  step() === 1 ? 'opacity-50 cursor-not-allowed' : 'hover-lift'
                }`}
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </button>

              <button
                onClick={nextStep}
                disabled={loading()}
                class="btn btn-primary px-6 py-2 sm:px-8 sm:py-3 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading() ? (
                  <div class="flex items-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                    Creating Account...
                  </div>
                ) : step() === 4 ? (
                  <div class="flex items-center">
                    <span>Create Account</span>
                    <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : (
                  <div class="flex items-center">
                    <span>Continue</span>
                    <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div class="text-center mt-8 animate-fade-in-up" style="animation-delay: 0.3s">
            <p class="text-gray-400">
              Already have an account?{" "}
              <A href="/login" class="text-primary hover:text-primary-light transition-colors duration-300 font-medium">
                Sign In
              </A>
            </p>
          </div>
        </div>

        {/* Features removed as per simplification request */}
      </div>
    </div>
  );
};

export default Signup;