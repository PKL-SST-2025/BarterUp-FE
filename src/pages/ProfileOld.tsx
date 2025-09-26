// src/pages/Profile.tsx
import type { Component } from "solid-js";
import Navbar from '../components/Navbar';  
import { createSignal, onMount, Show } from "solid-js";
import SelectField from "../components/SelectField";
import { ApiService, type ApiResponse, type PersonalDataOut, API_BASE_URL, handleApiError} from "../services/api";

const Profile: Component = () => {
  // State signals
  const [email, setEmail] = createSignal("");
  const [phone, setPhone] = createSignal("");
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

  const skillOptions = [
    "Music","Art","Cooking","Photography","Design",
    "Programming","Writing","Fitness","Gardening"
  ];

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    console.log("[Profile] loadProfile() start");

    try {
      // Check if we have a valid session
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
          // Set profile data from API
          setDob(profile.date_of_birth ?? "");
          setPrimarySkill(profile.primary_skill ?? "");
          setSkillToLearn(profile.skill_to_learn ?? "");
          setBio(profile.bio ?? "");

          // Handle profile picture URL
          const rawUrl = profile.profile_picture_url ?? "";
          const avatarFullUrl =
            rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
              ? rawUrl
              : rawUrl
              ? `${API_BASE_URL.replace(/\/$/, "")}${rawUrl}`
              : undefined;
          setAvatarUrl(avatarFullUrl);

          // Get user basic info from session - this should match the DB
          if (sessionData?.user) {
            setEmail(sessionData.user.email || "");
            setUsername(sessionData.user.username || sessionData.user.user_metadata?.username || "");
            setPhone(sessionData.user.phone || sessionData.user.user_metadata?.phone || "");
          } else if (sessionData?.profile) {
            // Alternative: try from profile data if available
            setEmail(sessionData.profile.email || "");
            setUsername(sessionData.profile.username || "");
          }

          console.log("[Profile] populated from API profile, avatar:", avatarFullUrl);
        } catch (procErr) {
          console.error("[Profile] error while processing API profile:", procErr);
          setError("Failed to process profile data");
        }
      } else {
        // Fallback to localStorage for demo purposes
        console.log("[Profile] Using localStorage fallback");
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");

          setEmail(user.email || "");
          setPhone(user.phone || "");
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

  // Load data on component mount
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
      // Show preview immediately
      const originalDataUrl = await readFileAsDataURL(file);
      setAvatarUrl(originalDataUrl);
      localStorage.setItem("profilePicture", originalDataUrl);

      // Resize/compress
      const resizedDataUrl = await resizeImageDataUrl(originalDataUrl, 1024, 0.8);

      // Prepare payload for backend
      const payload = {
        image_data: resizedDataUrl,
        file_name: file.name,
        content_type: file.type || "image/jpeg",
      };

      // Upload to backend
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

          // Refresh profile from API
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

  // Save profile function - NOW CALLS THE API
  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!primarySkill().trim()) {
        throw new Error("Primary skill is required");
      }
      if (!skillToLearn().trim()) {
        throw new Error("Skill to learn is required");
      }

      const profileData = {
        date_of_birth: dob(),
        primary_skill: primarySkill(),
        skill_to_learn: skillToLearn(),
        bio: bio(),
      };

      console.log("[Profile] Saving profile data:", profileData);

      // Check if we have authentication
      const userSession = sessionStorage.getItem('userSession');
      if (!userSession) {
        throw new Error("No authentication session found. Please log in again.");
      }

      // Call the API to update profile
      const response = await ApiService.updateProfile(profileData);

      console.log("[Profile] Update response:", response);

      if (response.status === 'success') {
        // Also update localStorage as fallback
        const updatedDetails = {
          dateOfBirth: dob(),
          primarySkill: primarySkill(),
          skillToLearn: skillToLearn(),
          bio: bio(),
        };

        const updatedUser = {
          email: email(),
          phone: phone(),
          username: username(),
        };

        localStorage.setItem("userDetails", JSON.stringify(updatedDetails));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);

        // Refresh the profile data from API to ensure consistency
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
      
      // Show more detailed error information
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

      // Fallback: save to localStorage only
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
  }

  const Field: Component<FieldProps> = ({
    label,
    value,
    onInput,
    readOnly = false,
    textarea = false,
  }) => {
    const baseInput =
      "w-full px-4 py-2 bg-[#000]/30 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CE0D2] border border-gray-600";

    return (
      <div>
        <label class="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          {label}
        </label>
        {textarea ? (
          <textarea
            class={baseInput}
            value={value}
            onInput={onInput}
            readOnly={readOnly}
            rows={3}
            placeholder={readOnly ? "Not set" : `Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={label.toLowerCase().includes('date') ? 'date' : 'text'}
            class={baseInput}
            value={value}
            onInput={onInput}
            readOnly={readOnly}
            placeholder={readOnly ? "Not set" : `Enter your ${label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  return (
    <div class="overflow-x-hidden min-h-screen bg-gradient-to-b from-[#042a29] to-black">
      <Navbar />

      <Show
        when={loading()}
        fallback={
          <div class="pt-20 h-screen flex flex-col">
            <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              {/* Show error if exists */}
              <Show when={error()}>
                <div class="mb-6 p-4 bg-red-900/20 border border-red-400 text-red-300 rounded-lg">
                  {error()}
                </div>
              </Show>

              {/* Show success if exists */}
              <Show when={success()}>
                <div class="mb-6 p-4 bg-green-900/20 border border-green-400 text-green-300 rounded-lg">
                  {success()}
                </div>
              </Show>

              <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div class="lg:col-span-1">
                  <div class="bg-[#004041] rounded-lg p-6">
                    <ul class="space-y-3">
                      <li>
                        <a
                          href="/profile"
                          class="flex items-center px-4 py-3 rounded-lg bg-[#4CE0D2] text-black font-medium transition-colors hover:bg-[#5ba5a5]"
                          aria-current="page"
                        >
                          <svg class="w-5 h-5 me-3 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                          </svg>
                          Profile
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Main Content */}
                <div class="lg:col-span-3">
                  <div class="bg-[#004041] rounded-lg p-6 lg:p-8">
                    <h2 class="text-2xl font-medium text-gray-100 mb-8">
                      Edit Personal Information
                    </h2>

                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* Avatar Section */}
                      <div class="xl:col-span-1 flex flex-col items-center">
                        <div class="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gray-700 overflow-hidden mb-6 border-4 border-gray-600 shadow-lg">
                          {avatarUrl()
                            ? <img src={avatarUrl()} alt="Profile" class="w-full h-full object-cover" />
                            : <div class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-16 h-16 lg:w-20 lg:h-20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
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
                          class="px-6 py-3 bg-[#4CE0D2] hover:bg-[#5ba5a5] rounded-lg text-black font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          onClick={() => fileInputRef?.click()}
                        >
                          Change Avatar
                        </button>
                      </div>

                      {/* Form Fields */}
                      <div class="xl:col-span-2 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field 
                            label="Date of Birth" 
                            value={dob()} 
                            onInput={(e) => setDob((e.currentTarget as HTMLInputElement).value)} 
                          />
                          
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <SelectField
                            label="Primary Skill"
                            value={primarySkill()}
                            onChange={(e) => setPrimarySkill(e.currentTarget.value)}
                            disabledOption="Choose your top skill"
                            options={skillOptions}
                          />
                          <SelectField
                            label="Skill to Learn"
                            value={skillToLearn()}
                            onChange={(e) => setSkillToLearn(e.currentTarget.value)}
                            disabledOption="Choose a skill to learn"
                            options={skillOptions}
                          />
                          
                          {/* Empty div untuk balance grid di md */}
                          <div class="hidden md:block"></div>
                        </div>
                        
                        <Field 
                          label="Bio" 
                          value={bio()} 
                          textarea 
                          onInput={(e) => setBio((e.currentTarget as HTMLTextAreaElement).value)} 
                        />
                        
                        <div class="pt-6 flex justify-end">
                          <button
                            class="px-8 py-3 bg-[#4CE0D2] text-black font-medium rounded-lg hover:bg-[#5ba49d] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            onClick={saveProfile}
                            disabled={saving()}
                          >
                            {saving() ? (
                              <div class="flex items-center">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                Saving...
                              </div>
                            ) : (
                              "Save Profile"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {/* Loading Spinner */}
        <div class="pt-20 h-screen flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-[#4CE0D2] mx-auto mb-6"></div>
            <p class="text-gray-300 text-lg">Loading profile...</p>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Profile;