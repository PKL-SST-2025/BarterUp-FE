// src/pages/Landing.tsx
import type { Component } from "solid-js";
import { A } from "@solidjs/router";
import { createSignal } from "solid-js";

const Landing: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  
  return (
    <div class="font-poppins overflow-x-hidden relative">
      <div id="top">
      {/* Sidebar for small screens */}
      <button
        type="button"
        class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        onClick={() => setSidebarOpen(!sidebarOpen())}
      >
        <span class="sr-only">Open sidebar</span>
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
        </svg>
      </button>

      <aside
        class={`fixed top-0 left-0 z-40 w-64 h-screen overflow-y-auto bg-black/50 backdrop-blur-md text-white transition-transform md:hidden ${
          sidebarOpen() ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >

        <div class="h-full px-3 py-4">
          <ul class="space-y-2 font-medium">
            <li>
              <A href="#benefits" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">Benefits</A>
            </li>
            <li>
              <A href="#how-it-works" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">How it Works</A>
            </li>
            <li>
              <A href="#about-us" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">About Us</A>
            </li>
            <li>
              <A href="/signup" class="flex items-center p-2 text-[#4CE0D2] rounded-lg hover:bg-gray-100">Sign Up</A>
            </li>
            <li>
              <A href="/login" class="flex items-center p-2 bg-[#4CE0D2] text-black rounded-lg hover:bg-[#36C9B9]">Log In</A>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div class="flex-1">
        {/* Navbar for medium+ */}
        <header class="bg-black/50 backdrop-blur-md fixed w-full z-50 top-0 left-0">
          <nav class="container mx-auto flex items-center justify-between p-6 sm:px-6 lg:px-32">
            <A href="#top" class="block">
              <h1 class="text-3xl sm:text-4xl font-bold text-white">BarterUp</h1>
            </A>
              <ul class="hidden md:flex space-x-8">
                <li><A href="#benefits" class="text-white hover:text-[#4CE0D2]">Benefits</A></li>
                <li><A href="#how-it-works" class="text-white hover:text-[#4CE0D2]">How it Works</A></li>
                <li><A href="#about-us" class="text-white hover:text-[#4CE0D2]">About Us</A></li>
              </ul>
            <div class="hidden md:flex space-x-4">
              <A href="/signup" class="inline-flex items-center justify-center w-24 h-10 text-[#4CE0D2] border-2 border-[#4CE0D2] rounded-[8px] font-semibold text-[14px] hover:bg-[#4CE0D2]/10 focus:outline-none focus:ring-4 focus:ring-[#4CE0D2]/30 transition">Sign Up</A>
              <A href="/login"class="inline-flex items-center justify-center w-24 h-10 bg-[#4CE0D2] text-black rounded-[8px] font-semibold text-[14px] hover:bg-[#4CE0D2]/90 focus:outline-none focus:ring-4 focus:ring-[#4CE0D2]/30 transition"
              >Log In</A>
            </div>
            <button
              class="md:hidden inline-flex items-center p-2 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-md"
              onClick={() => setIsOpen(!isOpen())}
            >
              <span class="sr-only">Open main menu</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>

          {/* Mobile Dropdown links */}
          {isOpen() && (
            <div class="md:hidden">
              <div class="px-4 pt-4 pb-2 space-y-1">
                <A href="#benefits" class="block text-white py-2 hover:text-gray-400 " onClick={() => setIsOpen(false)}>Benefits</A>
                <A href="#how-it-works" class="block text-white py-2 hover:text-gray-400" onClick={() => setIsOpen(false)}>How it Works</A>
                <A href="#about-us" class="block text-white py-2 hover:text-gray-400" onClick={() => setIsOpen(false)}>About Us</A>
                <A href="/signup" class="block text-[#4CE0D2] py-2 hover:text-[#508897]" onClick={() => setIsOpen(false)}>Sign Up</A>
                <A href="/login" class="block text-[#4CE0D2] py-2 hover:text-[#508897]" onClick={() => setIsOpen(false)}>Log In</A>
              </div>
            </div>
          )}
        </header>
        </div>
      </div>
      
    <main class="overflow-x-hidden">
      
      <section id="hero" class="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-b from-[#004041] via-[#002929] to-black px-4">
        <div class="container mx-auto px-6 sm:px-12 lg:px-32 text-center flex flex-col justify-center items-center h-full">
          <h1 class="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Share What You Know</h1>
          <h2 class="mt-2 text-[#4CE0D2] font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Learn What You Love</h2>
          <p class="mt-4 text-gray-300 max-w-xl text-sm sm:text-base">
            A modern way to grow your skillset without spending a dime.
          </p>
          <div class="flex gap-x-4 mt-6">
            <A
              href="/signup"
              class="inline-flex items-center justify-center w-28 h-10 text-[#4CE0D2] border-2 border-[#4CE0D2] rounded-[8px] font-semibold text-[14px] hover:bg-[#4CE0D2]/10 focus:outline-none focus:ring-4 focus:ring-[#4CE0D2]/30 transition"
            >
              Sign Up
            </A>
            <A
              href="/login"
              class="inline-flex items-center justify-center w-28 h-10 bg-[#4CE0D2] text-black rounded-[8px] font-semibold text-[14px] hover:bg-[#4CE0D2]/90 focus:outline-none focus:ring-4 focus:ring-[#4CE0D2]/30 transition"
            >
              Log In
            </A>
          </div>
        </div>        
      </section>

      <section id="benefits" class="bg-[#22AAA1] py-20">
        <div class="container mx-auto px-6 sm:px-6 lg:px-32">
          <div class="grid gap-8 lg:grid-cols-3">
            
            <div class="bg-white rounded-xl shadow-lg p-10  w-full min-h-120 flex flex-col">
              <div class="mb-4">
                <div class="w-18 h-18 flex items-center justify-center bg-[#22AAA1] rounded-md">
                  <div class="text-6xl">🎓</div>
                </div>
              </div>
              <h3 class="text-4xl font-bold text-black">
                Learn & Teach<br/>
                <span class="text-[#22AAA1]">for Free</span>
              </h3>
              <p class=" text-gray-700 mt-4">
                Exchange your skills without spending a dime. Whether you’re learning to play guitar or offering design tips, BarterUp helps you grow through mutual exchange.
              </p>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-10  w-full min-h-120 flex flex-col">
              <div class="mb-4">
                <div class="w-18 h-18 flex items-center justify-center bg-[#22AAA1] rounded-md">
                  <div class="text-6xl">🤝</div>
                </div>
              </div>
              <h3 class="text-4xl font-bold text-black">
                Build Real<br/>
                <span class="text-[#22AAA1]">Connection</span>
              </h3>
              <p class=" text-gray-700 mt-4">
                More than just a platform, BarterUp connects you with real people nearby who share your learning goals and interests.
              </p>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-10  w-full min-h-120 flex flex-col">
              <div class="mb-4">
                <div class="w-18 h-18 flex items-center justify-center bg-[#22AAA1] rounded-md">
                  <div class="text-6xl">🌐</div>
                </div>
              </div>
              <h3 class="text-4xl font-bold text-black">
                Empower Your<br/>
                <span class="text-[#22AAA1]">Community</span>
              </h3>
              <p class=" text-gray-700 mt-4">
              Support local talents and unlock potential by sharing skills with people around you. Learning doesn’t have to be expensive.              
              </p>
            </div>
            
          </div>
        </div>
      </section>

      <section id="how-it-works" class="bg-black py-20">
        <div class="container mx-auto px-6 sm:px-12 lg:px-32">

          <h2 class="text-4xl text-white sm:text-6xl font-bold text-center mb-20 ">How it works</h2>

          <div class="grid lg:grid-cols-3 gap-8 mb-8">
            
            <div class="bg-gradient-to-b from-[#136F63] to-[#2B2B2B] rounded-xl shadow-lg p-10 w-full min-h-72 flex flex-col">
              <h3 class="text-4xl text-white font-bold mb-2">Create Your Profile</h3>
              <p class="text-gray-300 text-base">
                Sign up and list your skills—what you can offer and what you want to learn. Add a short bio and location to help others find you.
              </p>
            </div>

            
            <div class="bg-gradient-to-b from-[#136F63] to-[#2B2B2B] rounded-xl shadow-lg p-10 w-full min-h-72 flex flex-col">
              <h3 class="text-4xl text-white font-bold mb-2">Search the Skill Pool</h3>
              <p class="text-gray-300 text-base">
                Browse the growing community of users. Filter by category or distance to find people with skills you're looking for.
              </p>
            </div>

            
            <div class="bg-gradient-to-b from-[#136F63] to-[#2B2B2B] rounded-xl shadow-lg p-10 w-full min-h-72 flex flex-col">
              <h3 class="text-4xl text-white font-bold mb-2">Propose a Skill Swap</h3>
              <p class="text-gray-300 text-base">
                Send a swap request to users you’re interested in learning from. Offer one of your skills in return.
              </p>
            </div>
          </div>

          <div class="bg-gradient-to-l from-[#136F63] to-[#2B2B2B] rounded-xl shadow-lg p-10 flex flex-col lg:flex-row gap-6 items-start">
            
            <div class="flex-1">
              <h3 class="text-4xl text-white font-bold mb-4">Chat and Collaborate</h3>
              <p class="text-gray-300 text-base max-w-xl">
                Start a conversation to arrange time, place, or method of exchange. Share ideas, negotiate terms, and build connections—all in real-time. The left side shows chat interface, and the right side showcases a preview image of two people exchanging knowledge.
              </p>
            </div>

            <div class="flex-1 flex flex-col gap-2 justify-end">
              <div class="self-end bg-gray-800 text-white px-4 py-2 rounded-xl rounded-br-none text-sm max-w-xs">
                I want to learn basic French
              </div>
              <div class="self-start bg-gray-800 text-white px-4 py-2 rounded-xl rounded-bl-none text-sm max-w-xs">
                I can teach you!
              </div>
              <div class="self-start bg-gray-800 text-white px-4 py-2 rounded-xl rounded-bl-none text-sm max-w-xs">
                Can you teach me how to make a website?
              </div>
            </div>

          </div>

        </div>
      </section>

      <section id="about-us" class="bg-white py-20 flex flex-col items-center">
        <div class="container mx-auto px-6 sm:px-12 lg:px-32">
          <h2 class="text-4xl text-[#22AAA1] sm:text-6xl font-bold text-center mb-8">About BarterUp</h2>
          <p class="text-black text-2xl text-center lg:px-32">
            BarterUp is a skill-sharing platform designed to promote collaborative learning and empower communities through skill exchange. Our vision is to make learning more accessible, more social, and more local.
          </p>
        </div>

        <div class="mt-10 flex justify-center px-6 sm:px-12">
          <div class="bg-white rounded-4xl p-10  w-full flex flex-col border border-cyan-200 shadow-[0_0_20px_rgba(76,224,210,0.5)]">
            <h2 class="mb-4 text-5xl font-bold text-black text-center">Our Mission</h2>
            <p class="font-normal text-xl text-gray-700 text-center mb-4">
              1. Democratize access to learning by removing financial barriers.<br />
              2. Foster meaningful human connections through shared growth.<br />
              3. Support local talents and create a culture of giving and learning.
            </p>
            <p class="font-normal text-xl text-gray-700 text-center">
              Join us in reshaping the way people learn—together, not alone.
            </p>
          </div>
        </div>
        
      </section>
        
      <section id="how-it-works" class="bg-black py-20">
        <div class="container mx-auto px-6 sm:px-12 lg:px-32">
          <p class="text-white mb-14">
            Come say hi at hello@barterup.co.id <br />
            Made with ❤️ by the BarterUp Team
          </p>
          <p class="text-white">
            BarterUp © 2025. All rights reserved.
          </p>               
          <hr class="h-px my-14 bg-gray-200 border-0 dark:bg-gray-700"/>
          <div class="flex flex-row gap-30">
            <a href="#" class="text-white">
            Privacy Policy
            </a>
            <a href="#" class="text-white">
            Terms of Service
            </a>
          </div>
        </div>
      </section>
      
      </main>
    </div>
    
  );
};

export default Landing;
