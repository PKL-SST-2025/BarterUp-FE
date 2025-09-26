// src/pages/UploadProfile.tsx - Fixed version
import type { Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { ApiService, handleApiError, type ApiResponse } from "../services/api";

const UploadProfile: Component = () => {
  const navigate = useNavigate();
  
  const [file, setFile] = createSignal<File | null>(null);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [preview, setPreview] = createSignal<string>("");

  // Check if user is authenticated
  onMount(() => {
    const userSession = sessionStorage.getItem('userSession');
    if (!userSession) {
      navigate('/login'); // Redirect if not authenticated
    }
  });

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const selectedFile = target.files[0];
      
      // Validate file type - tambahkan webp
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WEBP).");
        return;
      }

      // Naikkan batas ukuran file menjadi 20MB (sesuai backend)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (selectedFile.size > maxSize) {
        setError("File size too large. Maximum 20MB allowed.");
        return;
      }

      setFile(selectedFile);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!file()) {
      setError("Please upload a profile picture.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedFile = file()!;
      
      console.log('Starting upload process...'); // Debug log
      console.log('File details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      
      // Convert file to base64 using Promise-based approach
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      
      console.log('Base64 conversion complete'); // Debug log
      
      const uploadData = {
        image_data: base64Data,
        file_name: selectedFile.name,
        content_type: selectedFile.type,
      };

      console.log('Sending upload request...'); // Debug log
      const response: ApiResponse<any> = await ApiService.uploadProfilePicture(uploadData);
      console.log('Upload response:', response); // Debug log
      
      if (response.status === 'success') {
        console.log('Upload successful:', response.data);
        // Redirect to dashboard after successful upload
        navigate('/dashboard');
      } else {
        console.error('Upload failed:', response.message);
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log('Skipping profile picture...'); // Debug log
      const response: ApiResponse<any> = await ApiService.skipProfilePicture();
      console.log('Skip response:', response); // Debug log
      
      if (response.status === 'success') {
        console.log('Skip successful:', response.data);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Skip failed');
      }
    } catch (err: any) {
      console.error('Skip error:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="font-inter overflow-x-hidden">
      <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-16" style="background: var(--bg-primary);">
        <div class="w-full max-w-md glass-card p-6 sm:p-8">
          <h2 class="text-2xl font-bold text-white mb-1">Upload your Profile Picture</h2>
          <p class="text-gray-200 text-sm mb-6">
            Personalize your account with a profile picture upload (Optional)
          </p>

          {error() && (
            <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p class="text-red-300 text-sm">{error()}</p>
            </div>
          )}

          <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Upload Box */}
            <div class="flex items-center text-center justify-center">
              <label 
                for="dropzone-file"
                class="flex flex-col items-center justify-center w-full min-w-[200px] max-w-xs aspect-square p-6 m-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition rounded-2xl relative overflow-hidden"
                classList={{
                  "opacity-50 cursor-not-allowed": loading(),
                }}
              >
                {preview() ? (
                  <img 
                    src={preview()} 
                    alt="Preview" 
                    class="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <svg class="w-8 h-8 text-gray-800" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5
                               5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0
                              0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p class="text-sm text-gray-800">
                      <span class="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-gray-600">PNG, JPG, GIF, WEBP (Max 20MB)</p>
                  </div>
                )}
                
                <input 
                  id="dropzone-file" 
                  type="file" 
                  class="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={loading()}
                />
              </label>
            </div>

            {/* Navigation Buttons */}
            <div class="flex justify-between mt-4">
              <A 
                href="/signup/personal" 
                class="btn btn-glass"
              >
                Back
              </A>
              
              <div class="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleSkip}
                  disabled={loading()}
                  class="btn btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading() ? "Processing..." : "Skip"}
                </button>
                
                <button 
                  type="submit" 
                  disabled={loading() || !file()}
                  class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading() ? "Uploading..." : "Upload & Continue"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadProfile;