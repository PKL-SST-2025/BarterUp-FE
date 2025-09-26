// barterup-fe/src/pages/PersonalDetail.tsx
import type { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, createResource } from "solid-js";
import { ApiService, handleApiError } from "../services/api";

const PersonalDetail: Component = () => {
  const navigate = useNavigate();
  
  // Form signals
  const [day, setDay] = createSignal("");
  const [month, setMonth] = createSignal("");
  const [year, setYear] = createSignal("");
  const [primarySkill, setPrimarySkill] = createSignal("");
  const [skillToLearn, setSkillToLearn] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  // Load skills from backend
  const [skillsData] = createResource(() => ApiService.getSkills());

  // Check if user has signup data
  onMount(() => {
    const token = sessionStorage.getItem('userSession') || sessionStorage.getItem('access_token');
    const legacySignupData = sessionStorage.getItem('signupData');
    if (!legacySignupData && token) {
      // This route is obsolete in unified flow: redirect user directly
      navigate('/dashboard', { replace: true });
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // New logic: All fields optional. We'll only send provided values.
    let date_of_birth = '';
    if (day() && month() && year()) {
      date_of_birth = `${day().padStart(2,'0')}/${month().padStart(2,'0')}/${year()}`;
    }

    try {
      const signupData = sessionStorage.getItem('signupData') ? JSON.parse(sessionStorage.getItem('signupData')||'{}') : {};
      const payload: any = {
        // If user somehow still finishing legacy step, fallback to completing unified signup now
        email: signupData.email,
        password: signupData.password,
        username: signupData.username,
        date_of_birth: date_of_birth || signupData.date_of_birth || '2000-01-01', // fallback to a safe default if missing
        primary_skill: primarySkill() || undefined,
        skill_to_learn: skillToLearn() || undefined,
        bio: bio().trim() || undefined,
      };

      // If we still have signupData, attempt unified signup call to finalize (rare edge)
      if (signupData.email && signupData.password && !sessionStorage.getItem('userSession')) {
        const resp = await ApiService.signup(payload);
        if (resp.status === 'success') {
          sessionStorage.removeItem('signupData');
          sessionStorage.setItem('userSession', JSON.stringify(resp.data.session));
          navigate('/dashboard');
          return;
        }
      } else {
        // Otherwise treat this page as optional profile update
        await ApiService.updateProfile({
          date_of_birth: date_of_birth || undefined,
          primary_skill: primarySkill() || undefined,
          skill_to_learn: skillToLearn() || undefined,
          bio: bio().trim() || undefined,
        });
        navigate('/dashboard');
        return;
      }
    } catch (err:any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="font-inter overflow-x-hidden">
      <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-16" style="background: var(--bg-primary);">
        <div class="w-full max-w-md glass-card p-6 sm:p-8">
          <div class="flex items-center justify-center mb-6">
            <div class="w-14 h-14 bg-primary/90 rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
              <svg class="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-1">Profile (Optional)</h2>
          <p class="text-gray-200 text-sm mb-6">
            This step is no longer required. You can skip and update later in settings.
          </p>

          {error() && (
            <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p class="text-red-300 text-sm">{error()}</p>
            </div>
          )}

          <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Date of Birth */}
            <label class="text-gray-200 text-sm">Date of birth</label>
            <div class="flex gap-2">
              <input
                type="text"
                placeholder="DD"
                value={day()}
                onInput={e => setDay(e.currentTarget.value)}
                disabled={loading()}
                maxLength={2}
                class="flex-1 min-w-0 input-modern"
              />
              <input
                type="text"
                placeholder="MM"
                value={month()}
                onInput={e => setMonth(e.currentTarget.value)}
                disabled={loading()}
                maxLength={2}
                class="flex-1 min-w-0 input-modern"
              />
              <input
                type="text"
                placeholder="YYYY"
                value={year()}
                onInput={e => setYear(e.currentTarget.value)}
                disabled={loading()}
                maxLength={4}
                class="flex-1 min-w-0 input-modern"
              />
            </div>

            {/* Primary Skill */}
            <label class="text-gray-200 text-sm">Primary Skill</label>
            <select
              value={primarySkill()}
              onChange={e => setPrimarySkill(e.currentTarget.value)}
              disabled={loading()}
              class="input-modern"
            >
              <option value="" disabled>
                Choose your top skill
              </option>
              {skillsData()?.data?.skills?.map((skill: string) => (
                <option value={skill}>{skill}</option>
              ))}
            </select>

            {/* Skill to Learn */}
            <label class="text-gray-200 text-sm">Skill you want to Learn</label>
            <select
              value={skillToLearn()}
              onChange={e => setSkillToLearn(e.currentTarget.value)}
              disabled={loading()}
              class="input-modern"
            >
              <option value="" disabled>
                Choose a skill you'd like to learn
              </option>
              {skillsData()?.data?.skills?.map((skill: string) => (
                <option value={skill}>{skill}</option>
              ))}
            </select>

            {/* Bio */}
            <label class="text-gray-200 text-sm">
              Bio <span class="text-xs">({bio().length}/1000)</span>
            </label>
            <textarea
              placeholder="Write a brief intro (eg., your background, interests, and goals)"
              value={bio()}
              onInput={e => setBio(e.currentTarget.value)}
              disabled={loading()}
              maxLength={1000}
              class="input-modern h-24 resize-none"
            />

            {/* Navigation Buttons */}
            <div class="flex justify-between mt-4">
              <button
                type="button"
                class="btn btn-glass"
                onClick={() => navigate('/dashboard')}
                disabled={loading()}
              >
                Skip
              </button>
              <button 
                type="submit" 
                disabled={loading()}
                class="btn btn-primary"
              >
                {loading() ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetail;