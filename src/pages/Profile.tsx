// src/pages/Profile.tsx
import type { Component } from "solid-js";
import Navbar from '../components/Navbar';  
import { createSignal, onMount, Show } from "solid-js";
import SelectField from "../components/SelectField";
import { ApiService, type ApiResponse, type PersonalDataOut, API_BASE_URL, handleApiError} from "../services/api";
import { 
  PersonIcon, 
  SkillIcon, 
  PhotoIcon, 
  UploadIcon, 
  CheckIcon, 
  WarningIcon 
} from "../components/icons";

const Profile: Component = () => {
  // State signals
  const [email, setEmail] = createSignal("");
  const [username, setUsername] = createSignal("");
  const [dob, setDob] = createSignal("");
  const [primarySkill, setPrimarySkill] = createSignal("");
  const [skillToLearn, setSkillToLearn] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [avatarUrl, setAvatarUrl] = createSignal<string | undefined>(undefined);
  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [activeTab, setActiveTab] = createSignal("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  const skillOptions = [
    "Music","Art","Cooking","Photography","Design",
    "Programming","Writing","Fitness","Gardening",
    "Language Learning", "Data Science", "Marketing",
    "Business", "Teaching", "Crafting"
  ];

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    console.log("[Profile] loadProfile() start");

    try {
      // Prefill from accountMeta (signup/login) as earliest cheap source
      try {
        const metaRaw = sessionStorage.getItem('accountMeta');
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta.email && !email()) setEmail(meta.email);
          if (meta.username && !username()) setUsername(meta.username);
          if (!dob()) {
            let candidateDob = meta.dateOfBirth || meta.date_of_birth; // prefer ISO camelCase
            if (candidateDob) {
              // If candidate is DD/MM/YYYY convert to YYYY-MM-DD for <input type=date>
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(candidateDob)) {
                const [d,m,y] = candidateDob.split('/');
                candidateDob = `${y}-${m}-${d}`; 
              }
              console.log('[Profile] Prefill DOB from accountMeta (normalized):', candidateDob);
              setDob(candidateDob);
            }
          }
          // Backfill ISO version if only slash format stored earlier
          if (meta.date_of_birth && !meta.dateOfBirth && /^\d{2}\/\d{2}\/\d{4}$/.test(meta.date_of_birth)) {
            const [d,m,y] = meta.date_of_birth.split('/');
            meta.dateOfBirth = `${y}-${m}-${d}`;
            try { sessionStorage.setItem('accountMeta', JSON.stringify(meta)); } catch(_) {}
          }
        }
      } catch (e) {
        console.warn('[Profile] Failed to parse accountMeta', e);
      }

      // Small helper to normalize server-provided DOB formats (e.g. strip time component)
      const normalizeDate = (raw: string | null | undefined): string => {
        if (!raw) return "";
        const trimmed = String(raw).trim();
        // Accept first 10 chars if matches YYYY-MM-DD pattern
        const m = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : trimmed;
      };

      const userSessionRaw = sessionStorage.getItem("userSession");
      const hasSession = !!userSessionRaw;

      let apiResponse: ApiResponse<PersonalDataOut> | null = null;
      let sessionData = null;

      if (hasSession) {
        try {
          sessionData = JSON.parse(userSessionRaw);
          console.log("[Profile] Session data:", sessionData);
          
          console.log("[Profile] Found session -> calling ApiService.getCurrentProfile()");
          apiResponse = await ApiService.getCurrentProfile();
          console.log("[Profile] API response:", apiResponse);
        } catch (apiErr: any) {
          console.error("[Profile] ApiService.getCurrentProfile() failed:", apiErr);
          setError(apiErr?.message || "Failed to load profile from API");
          apiResponse = null;
        }
      } else {
        console.log("[Profile] No session found, skip API and use localStorage fallback");
      }

      const profile = apiResponse?.data ?? null;

  if (profile) {
        try {
          // Only overwrite DOB if server returned a non-empty, non-null value.
          const serverDobRaw = profile.date_of_birth ?? "";
          const normalizedDob = normalizeDate(serverDobRaw);
          if (normalizedDob && !/^(null|undefined)$/i.test(normalizedDob)) {
            // Overwrite if we don't already have one OR they differ (avoid wiping a prefilled value with empty)
            if (!dob() || dob() !== normalizedDob) {
              setDob(normalizedDob);
            }
          }
          setPrimarySkill(profile.primary_skill ?? "");
          setSkillToLearn(profile.skill_to_learn ?? "");
          setBio(profile.bio ?? "");

          const rawUrl = profile.profile_picture_url ?? "";
          const avatarFullUrl =
            rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
              ? rawUrl
              : rawUrl
              ? `${API_BASE_URL.replace(/\/$/, "")}${rawUrl}`
              : undefined;
          setAvatarUrl(avatarFullUrl);

          if (sessionData?.user) {
            const userObj = sessionData.user;
            const meta = userObj.user_metadata || {};
            setEmail(userObj.email || sessionData.profile?.email || "");
            setUsername(userObj.username || meta.username || sessionData.profile?.username || localStorage.getItem('savedUsername') || "");
          } else if (sessionData?.profile) {
            setEmail(sessionData.profile.email || "");
            setUsername(sessionData.profile.username || localStorage.getItem('savedUsername') || "");
          } else {
            // Final fallback: previously saved username
            const saved = localStorage.getItem('savedUsername');
            if (saved) setUsername(saved);
          }

          console.log("[Profile] populated from API profile, avatar:", avatarFullUrl);
        } catch (procErr) {
          console.error("[Profile] error while processing API profile:", procErr);
          setError("Failed to process profile data");
        }
      } else {
        console.log("[Profile] Using localStorage fallback");
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");

          setEmail(user.email || "");
          setUsername(user.username || "");
          setDob(userDetails.dateOfBirth || "");
          setPrimarySkill(userDetails.primarySkill || "");
          setSkillToLearn(userDetails.skillToLearn || "");
          setBio(userDetails.bio || "");
          setAvatarUrl(localStorage.getItem("profilePicture") ?? undefined);
        } catch (lsErr) {
          console.error("[Profile] Failed to read localStorage fallback:", lsErr);
          setError("Failed to load profile (local fallback)");
        }
      }
    } catch (err: any) {
      console.error("[Profile] Unexpected error in loadProfile:", err);
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
      console.log("[Profile] loadProfile() finished, loading=false");
    }
  };

  onMount(() => {
    loadProfile();
  });

  let fileInputRef: HTMLInputElement | undefined;
  
  async function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  async function resizeImageDataUrl(dataUrl: string, maxWidth = 1024, quality = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          w = maxWidth;
          h = Math.round(w / ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(resizedDataUrl);
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  }

  async function onAvatarChange(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const originalDataUrl = await readFileAsDataURL(file);
      setAvatarUrl(originalDataUrl);
      localStorage.setItem("profilePicture", originalDataUrl);

      const resizedDataUrl = await resizeImageDataUrl(originalDataUrl, 1024, 0.8);

      const payload = {
        image_data: resizedDataUrl,
        file_name: file.name,
        content_type: file.type || "image/jpeg",
      };

      try {
        const res = await ApiService.uploadProfilePicture(payload);
        console.log("Upload response:", res);

        const returnedUrl = res?.data?.profile_picture_url;
        if (returnedUrl) {
          const fullUrl = returnedUrl.startsWith("http")
            ? returnedUrl
            : `${API_BASE_URL.replace(/\/$/, "")}${returnedUrl}`;
          setAvatarUrl(fullUrl);
          localStorage.setItem("profilePicture", fullUrl);

          try {
            await loadProfile();
          } catch (e) {
            console.warn("Failed to refresh profile after upload:", e);
          }

          setSuccess("Profile picture uploaded successfully!");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          throw new Error("Upload succeeded but server did not return profile_picture_url");
        }
      } catch (uploadErr: any) {
        console.error("Upload failed:", uploadErr);
        setError("Failed to upload profile picture: " + handleApiError(uploadErr));
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      console.error("Failed to process image:", err);
      setError("Failed to read/prepare image: " + (err as any).message);
      setTimeout(() => setError(""), 5000);
    }
  }

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Optional fields now: primarySkill, skillToLearn, bio can be empty.

      const profileData = {
        date_of_birth: dob() || "", // backend tolerates empty
        primary_skill: primarySkill().trim() || undefined,
        skill_to_learn: skillToLearn().trim() || undefined,
        bio: bio().trim() || undefined,
      };

      console.log("[Profile] Saving profile data:", profileData);

      const userSession = sessionStorage.getItem('userSession');
      if (!userSession) {
        throw new Error("No authentication session found. Please log in again.");
      }

      const response = await ApiService.updateProfile(profileData);

      console.log("[Profile] Update response:", response);

      if (response.status === 'success') {
        const updatedDetails = {
          dateOfBirth: dob(),
          primarySkill: primarySkill(),
          skillToLearn: skillToLearn(),
          bio: bio(),
        };

        const updatedUser = { email: email(), username: username() };
        try { localStorage.setItem('savedUsername', username()); } catch(_) {}

        localStorage.setItem("userDetails", JSON.stringify(updatedDetails));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);

        try {
          await loadProfile();
        } catch (e) {
          console.warn("Failed to refresh profile after save:", e);
        }
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      
      let errorMessage = "Failed to save profile: ";
      
      if (err.message.includes('400')) {
        errorMessage += "Invalid data provided. Please check your inputs.";
      } else if (err.message.includes('401')) {
        errorMessage += "Authentication required. Please log in again.";
      } else if (err.message.includes('500')) {
        errorMessage += "Server error. Please try again later.";
      } else {
        errorMessage += handleApiError(err);
      }
      
      setError(errorMessage);
      setTimeout(() => setError(""), 8000);

      try {
        const updatedDetails = {
          dateOfBirth: dob(),
          primarySkill: primarySkill(),
          skillToLearn: skillToLearn(),
          bio: bio(),
        };
        localStorage.setItem("userDetails", JSON.stringify(updatedDetails));
        console.log("Saved to localStorage as fallback");
      } catch (localErr) {
        console.error("Even localStorage save failed:", localErr);
      }
    } finally {
      setSaving(false);
    }
  };

  interface FieldProps {
    label: string;
    value: string;
    onInput: (e: Event) => void;
    readOnly?: boolean;
    textarea?: boolean;
    placeholder?: string;
  }

  const Field: Component<FieldProps> = ({
    label,
    value,
    onInput,
    readOnly = false,
    textarea = false,
    placeholder,
  }) => {
    return (
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
        {textarea ? (
          <textarea
            class="input-modern min-h-[120px] resize-none"
            value={value}
            onInput={onInput}
            readOnly={readOnly}
            rows={4}
            placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={label.toLowerCase().includes('date') ? 'date' : 'text'}
            class="input-modern"
            value={value}
            onInput={onInput}
            readOnly={readOnly}
            placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  return (
    <div class="font-inter min-h-screen relative" style="background: var(--bg-primary);">
      {/* Background Elements */}
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-glow"></div>
        <div class="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 1s"></div>
        <div class="absolute bottom-32 left-1/4 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 2s"></div>
      </div>

      <Navbar />

      <Show
        when={loading()}
        fallback={
          <div class="pt-28 pb-16 px-4">
            <div class="max-w-7xl mx-auto">
              
              {/* Header Section */}
              <div class="text-center mb-12 animate-fade-in-up">
                <h1 class="text-4xl md:text-5xl font-bold text-gradient mb-4">
                  My Profile
                </h1>
                <p class="text-xl text-gray-300 max-w-2xl mx-auto">
                  Manage your profile and showcase your skills to the BarterUp community
                </p>
              </div>

              {/* Alerts */}
              <Show when={error()}>
                <div class="mb-8 animate-fade-in-up">
                  <div class="glass-card border-l-4 border-secondary bg-secondary/10 p-4 rounded-lg">
                    <div class="flex items-center">
                      <WarningIcon size="md" class="text-secondary mr-3" />
                      <span class="text-white font-medium">{error()}</span>
                    </div>
                  </div>
                </div>
              </Show>

              <Show when={success()}>
                <div class="mb-8 animate-fade-in-up">
                  <div class="glass-card border-l-4 border-primary bg-primary/10 p-4 rounded-lg">
                    <div class="flex items-center">
                      <CheckIcon size="md" class="text-primary mr-3" />
                      <span class="text-white font-medium">{success()}</span>
                    </div>
                  </div>
                </div>
              </Show>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Sidebar */}
                <div class="lg:col-span-3">
                  <div class="barter-card p-6">
                    
                    {/* Profile Summary */}
                   

                    {/* Navigation */}
                    <nav class="space-y-2">
                      <button
                        class={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab() === "profile"
                            ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary"
                            : "text-gray-300 hover:bg-white/5 hover:text-primary"
                        }`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <PersonIcon size="md" class="mr-3" />
                        Personal Info
                      </button>
                      
                      <button
                        class={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab() === "skills"
                            ? "bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 text-secondary"
                            : "text-gray-300 hover:bg-white/5 hover:text-secondary"
                        }`}
                        onClick={() => setActiveTab("skills")}
                      >
                        <SkillIcon size="md" class="mr-3" />
                        Skills & Bio
                      </button>

                      <button
                        class={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab() === "photo"
                            ? "bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-accent"
                            : "text-gray-300 hover:bg-white/5 hover:text-accent"
                        }`}
                        onClick={() => setActiveTab("photo")}
                      >
                        <PhotoIcon size="md" class="mr-3" />
                        Profile Photo
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Main Content */}
                <div class="lg:col-span-9">
                  <div class="barter-card p-6">
                    
                    {/* Personal Info Tab */}
                    <Show when={activeTab() === "profile"}>
                      <div class="animate-fade-in-up px-2">
                        <div class="flex items-center mb-8">
                          <div class="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-[#4CE0D2] text-[#0F2027] shadow-[0_4px_12px_-2px_rgba(76,224,210,0.4)] ring-1 ring-white/30">
                            <PersonIcon size="lg" class="text-[#0F2027]" />
                          </div>
                          <div>
                            <h2 class="text-2xl font-bold text-white mb-1">Personal Information</h2>
                            <p class="text-gray-400">Manage your basic profile details</p>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field 
                            label="Email Address" 
                            value={email()} 
                            onInput={() => {}} 
                            readOnly={true}
                            placeholder="your@email.com"
                          />
                          <Field 
                            label="Username" 
                            value={username()} 
                            onInput={(e) => setUsername((e.currentTarget as HTMLInputElement).value)} 
                            placeholder="Choose a unique username"
                          />
                          {/* Phone field removed */}
                          <Field 
                            label="Date of Birth" 
                            value={dob()} 
                            onInput={(e) => setDob((e.currentTarget as HTMLInputElement).value)} 
                          />
                        </div>
                      </div>
                    </Show>

                    {/* Skills Tab */}
                    <Show when={activeTab() === "skills"}>
                      <div class="animate-fade-in-up px-2">
                        <div class="flex items-center mb-8">
                          <div class="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-[#4CE0D2] text-[#0F2027] shadow-[0_4px_12px_-2px_rgba(76,224,210,0.4)] ring-1 ring-white/30">
                            <SkillIcon size="lg" class="text-[#0F2027]" />
                          </div>
                          <div>
                            <h2 class="text-2xl font-bold text-white mb-1">Skills & Biography</h2>
                            <p class="text-gray-400">Share what you know and what you want to learn</p>
                          </div>
                        </div>

                        <div class="space-y-8">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                              <label class="block text-sm font-medium text-gray-300 mb-2">
                                Primary Skill
                              </label>
                              <SelectField
                                label=""
                                value={primarySkill()}
                                onChange={(e) => setPrimarySkill(e.currentTarget.value)}
                                disabledOption="Choose your strongest skill"
                                options={skillOptions}
                              />
                              <p class="text-xs text-gray-500">What skill are you best at teaching others?</p>
                            </div>
                            
                            <div class="space-y-2">
                              <label class="block text-sm font-medium text-gray-300 mb-2">
                                Skill to Learn
                              </label>
                              <SelectField
                                label=""
                                value={skillToLearn()}
                                onChange={(e) => setSkillToLearn(e.currentTarget.value)}
                                disabledOption="Choose a skill to learn"
                                options={skillOptions}
                              />
                              <p class="text-xs text-gray-500">What would you like to learn from others?</p>
                            </div>
                          </div>
                          
                          <Field 
                            label="Bio (min 10 characters)" 
                            value={bio()} 
                            textarea 
                            onInput={(e) => setBio((e.currentTarget as HTMLTextAreaElement).value)} 
                            placeholder="Tell the community about yourself, your experience, and what makes you passionate about sharing skills..."
                          />
                          <p class="text-xs text-gray-500">A good bio helps others understand your background and learning goals</p>
                        </div>
                      </div>
                    </Show>

                    {/* Photo Tab */}
                    <Show when={activeTab() === "photo"}>
                      <div class="animate-fade-in-up px-2">
                        <div class="flex items-center mb-8">
                          <div class="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-[#4CE0D2] text-[#0F2027] shadow-[0_4px_12px_-2px_rgba(76,224,210,0.4)] ring-1 ring-white/30">
                            <PhotoIcon size="lg" class="text-[#0F2027]" />
                          </div>
                          <div>
                            <h2 class="text-2xl font-bold text-white mb-1">Profile Photo</h2>
                            <p class="text-gray-400">Upload a photo to help others recognize you</p>
                          </div>
                        </div>

                        <div class="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                          {/* Avatar Display */}
                          <div class="flex flex-col items-center">
                            <div class="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden border-4 border-primary/30 mb-6 shadow-2xl">
                              {avatarUrl()
                                ? <img src={avatarUrl()} alt="Profile" class="w-full h-full object-cover" />
                                : <div class="w-full h-full flex items-center justify-center text-gray-400">
                                    <PersonIcon size="3xl" fill="currentColor" />
                                  </div>
                              }
                            </div>
                            
                            <input
                              type="file"
                              accept="image/*"
                              class="hidden"
                              ref={(el) => (fileInputRef = el as HTMLInputElement)}
                              onInput={onAvatarChange}
                            />

                            <button
                              class="btn btn-primary text-lg px-8 py-4 group"
                              onClick={() => fileInputRef?.click()}
                            >
                              <UploadIcon size="md" class="mr-2 group-hover:scale-110 transition-transform duration-300" />
                              Choose Photo
                            </button>
                          </div>

                          {/* Upload Guidelines */}
                          <div class="flex-1 max-w-md">
                            <div class="glass-card p-6 space-y-4">
                              <h3 class="text-lg font-semibold text-white mb-4">Photo Guidelines</h3>
                              
                              <div class="space-y-3 text-sm text-gray-300">
                                <div class="flex items-center">
                                  <CheckIcon size="sm" class="text-primary mr-3 flex-shrink-0" />
                                  Use a clear, recent photo of yourself
                                </div>
                                <div class="flex items-center">
                                  <CheckIcon size="sm" class="text-primary mr-3 flex-shrink-0" />
                                  Square format works best (1:1 ratio)
                                </div>
                                <div class="flex items-center">
                                  <CheckIcon size="sm" class="text-primary mr-3 flex-shrink-0" />
                                  Maximum file size: 5MB
                                </div>
                                <div class="flex items-center">
                                  <CheckIcon size="sm" class="text-primary mr-3 flex-shrink-0" />
                                  Supported formats: JPG, PNG, WebP
                                </div>
                              </div>

                              <div class="pt-4 border-t border-white/10">
                                <p class="text-xs text-gray-400">
                                  A good profile photo helps build trust and makes your skill exchanges more personal.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Show>

                    {/* Save Button */}
                    <div class="flex flex-col gap-8 mt-8 pt-6 px-2 border-t border-white/10">
                      {/* Danger Zone */}
                      <div class="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                        <h3 class="text-red-400 font-semibold mb-2">Danger Zone</h3>
                        <p class="text-sm text-gray-400 mb-4">Deleting your account is permanent and cannot be undone. Your profile and authentication record will be removed. Posts may remain anonymized.</p>
                        <button
                          class="px-5 py-3 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={deleting()}
                        >
                          {deleting() ? 'Processing...' : 'Delete My Account'}
                        </button>
                      </div>

                      {/* Save Profile Button */}
                      <button
                        class="btn btn-primary text-lg px-12 py-4 disabled:opacity-60 disabled:cursor-not-allowed group"
                        onClick={saveProfile}
                        disabled={saving()}
                      >
                        {saving() ? (
                          <div class="flex items-center">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                            Saving Changes...
                          </div>
                        ) : (
                          <div class="flex items-center">
                            <span>Save Profile</span>
                            <CheckIcon size="md" class="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        )}
                      </button>
                      <Show when={showDeleteConfirm()}>
                        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting() && setShowDeleteConfirm(false)}></div>
                          <div class="relative z-10 w-full max-w-md barter-card p-6 space-y-4 border border-red-400/20">
                            <h2 class="text-xl font-bold text-white">Confirm Account Deletion</h2>
                            <p class="text-sm text-gray-300 leading-relaxed">This action will permanently delete your account. You will be logged out and cannot recover your data. Type <span class="font-semibold text-red-400">DELETE</span> to confirm.</p>
                            <input id="deleteConfirmInput" type="text" placeholder="Type DELETE to confirm" class="input-modern" />
                            <div class="flex justify-end gap-3 pt-2">
                              <button
                                class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-200"
                                disabled={deleting()}
                                onClick={() => setShowDeleteConfirm(false)}
                              >Cancel</button>
                              <button
                                class="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={deleting()}
                                onClick={async () => {
                                  const val = (document.getElementById('deleteConfirmInput') as HTMLInputElement)?.value.trim();
                                  if (val !== 'DELETE') { setError('You must type DELETE to confirm.'); setTimeout(()=>setError(''),4000); return; }
                                  setDeleting(true);
                                  try {
                                    await ApiService.deleteAccount();
                                    // Clear storage
                                    sessionStorage.clear();
                                    localStorage.clear();
                                    setSuccess('Account deleted. Redirecting...');
                                    setTimeout(()=> {
                                      window.location.href = '/';
                                    }, 1200);
                                  } catch(e:any) {
                                    setError('Failed to delete account: ' + (e?.message || 'unknown error'));
                                    setTimeout(()=>setError(''),5000);
                                  } finally {
                                    setDeleting(false);
                                  }
                                }}
                              >{deleting() ? 'Deleting...' : 'Yes, Delete'}</button>
                            </div>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {/* Enhanced Loading Spinner */}
        <div class="pt-28 min-h-screen flex items-center justify-center">
          <div class="text-center animate-fade-in-up">
            <div class="relative mb-8">
              <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary rounded-full animate-spin mx-auto" style="animation-direction: reverse; animation-duration: 1.5s"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Loading Your Profile</h3>
            <p class="text-gray-400">Preparing your skill-sharing dashboard...</p>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Profile;