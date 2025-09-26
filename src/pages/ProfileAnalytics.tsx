// src/pages/Dashboard.tsx
import type { Component } from "solid-js";
import Navbar from '../components/Navbar';
import { createSignal, onMount } from "solid-js";
import SelectField from "../components/SelectField";

const ProfileAnalytics: Component = () => {
  // Retrieve user data from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");

  // Simplified analytics signals (only own posts & follow count)
  const [followCount, setFollowCount] = createSignal<number>(0);
  const [likeCount, setLikeCount] = createSignal<number>(0);
  const [loadingAnalytics, setLoadingAnalytics] = createSignal<boolean>(true);

  onMount(() => {
    // Attempt to load posts from a cached place (if dashboard stored them) – fallback placeholder
    try {
  const likedRaw = sessionStorage.getItem('likedPosts');
      if (likedRaw) {
        const arr = JSON.parse(likedRaw);
        if (Array.isArray(arr)) setLikeCount(arr.length);
      }
      const followedRaw = sessionStorage.getItem('followedUsers');
      if (followedRaw) {
        const arr = JSON.parse(followedRaw);
        setFollowCount(Array.isArray(arr) ? arr.length : 0);
      }
    } catch (_) { } finally { setLoadingAnalytics(false); }
  });
  
  const [email, setEmail] = createSignal(user.email || "");
  const [phone, setPhone] = createSignal(user.phone || "");
  const [dob, setDob] = createSignal(userDetails.dateOfBirth || "");
  const [primarySkill, setPrimarySkill] = createSignal(userDetails.primarySkill || "");
  const [skillToLearn, setSkillToLearn] = createSignal(userDetails.skillToLearn || "");
  const [bio, setBio] = createSignal(userDetails.bio || "");
  const [avatarUrl, setAvatarUrl] = createSignal<string | undefined>(
    localStorage.getItem("profilePicture") ?? undefined
  );

  const skillOptions = [
  "Music","Art","Cooking","Photography","Design",
  "Programming","Writing","Fitness","Gardening",
  ];

  let fileInputRef: HTMLInputElement | undefined;
  function onAvatarChange(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem("profilePicture", dataUrl);
    };
    reader.readAsDataURL(file);
  }

                      

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
    "w-full px-4 pr-24 py-2 bg-[#000]/30 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div>
      <label class="block text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          class={baseInput}
          value={value}
          onInput={onInput}
          readOnly={readOnly}
          rows={3}
        />
      ) : (
        <input
          type="text"
          class={baseInput}
          value={value}
          onInput={onInput}
          readOnly={readOnly}
        />
      )}
    </div>
    );
  };


  return (
    <div class="overflow-x-hidden"><Navbar />
      <div class="pt-20 h-screen flex flex-col">
          <div class="lg:max-w-6xl mx-auto">
            

            <div class="p-4 md:flex ">
                <ul class=" flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0">
                    <li>
                        <a href="/profile" class="inline-flex items-center px-4 py-3 rounded-lg hover:text-gray-900 w-full bg-[#004041]  hover:bg-[#015f5f] dark:hover:text-white " aria-current="page">
                            <svg class="w-4 h-4 me-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                            </svg>
                            Profile
                        </a>
                    </li>
                    <li>
                        <a href="/analytics" class="inline-flex items-center px-4 py-3 text-white bg-[#4CE0D2] rounded-lg active w-full">
                            <svg class="w-4 h-4 me-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/></svg>
                            Analytics
                        </a>
                    </li>
                    
                </ul>
                <div class="p-6 bg-[#004041] rounded-lg w-full ">
                {/* Simplified Analytics Summary (Follow & Likes) */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div class="p-4 rounded-lg bg-[#015757] border border-white/10 flex flex-col">
                    <span class="text-xs uppercase tracking-wide text-gray-300 mb-1">You Follow</span>
                    <span class="text-3xl font-semibold text-white">{loadingAnalytics() ? '…' : followCount()}</span>
                  </div>
                  <div class="p-4 rounded-lg bg-[#015757] border border-white/10 flex flex-col">
                    <span class="text-xs uppercase tracking-wide text-gray-300 mb-1">Posts You Liked</span>
                    <span class="text-3xl font-semibold text-white">{loadingAnalytics() ? '…' : likeCount()}</span>
                  </div>
                </div>
                {/* Section Header */}
                <h2 class="text-l font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Edit personal information
                </h2>

                <div class="flex flex-col md:flex-row md:items-start md:space-x-8 ">
                  {/* Avatar + Buttons */}
                  <div class="flex-shrink-0 flex flex-col items-center mb-8 md:mb-0">
                    {/* Avatar */}
                    <div class="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
                      {avatarUrl()
                        ? <img src={avatarUrl()} alt="Profile" class="w-full h-full object-cover" />
                        : <div class="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      }
                    </div>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      ref={fileInputRef!}
                      onInput={onAvatarChange}
                    />

                    {/* Change Avatar Button */}
                    <button
                      class="px-4 py-2 bg-[#000]/30 hover:bg-[#015f5f] rounded-md text-white"
                      onClick={() => fileInputRef?.click()}
                    >
                      Change Avatar
                    </button>
                  </div>

                  {/* Info Fields */}
                  <div class="flex-1 space-y-4">
                    {/** Field Template */}
                    <Field label="Username" value={user.username} onInput={() => {}} readOnly />
                    <Field label="Email" value={email()} onInput={(e) => setEmail((e.currentTarget! as HTMLInputElement).value)} />
                    <Field label="Phone" value={phone()} onInput={(e) => setPhone((e.currentTarget! as HTMLInputElement).value)} />
                    <Field label="Date of Birth" value={dob()} onInput={(e) => setDob((e.currentTarget! as HTMLInputElement).value)} />
                    {/* Dropdowns */}
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
                    <Field label="Bio" value={bio()} textarea onInput={(e) => setBio((e.currentTarget! as HTMLInputElement).value)} />
                    {/* Save Button */}
                    <div class="pt-4">
                      <button
                        class="w-full md:w-auto px-6 py-2 bg-[#4CE0D2] text-white rounded-md hover:bg-[#5ba49d] transition"
                        onClick={() => {
                          const updatedDetails = {
                            dateOfBirth: dob(),
                            primarySkill: primarySkill(),
                            skillToLearn: skillToLearn(),
                            bio: bio(),
                          };

                          const updatedUser = {
                            ...user,
                            email: email(),
                            phone: phone(),
                          };

                          localStorage.setItem("userDetails", JSON.stringify(updatedDetails));
                          localStorage.setItem("user", JSON.stringify(updatedUser));

                          alert("Profile updated successfully!");
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileAnalytics;
