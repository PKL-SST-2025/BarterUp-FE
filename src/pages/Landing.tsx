// src/pages/Landing.tsx
import type { Component } from "solid-js";
import { A } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

const Landing: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [scrollY, setScrollY] = createSignal(0);
  
  onMount(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  return (
    <div class="font-inter overflow-x-hidden relative">
      
      {/* Background Elements */}
      <div class="fixed inset-0 bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]-z-10"></div>
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-glow"></div>
        <div class="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 1s"></div>
        <div class="absolute bottom-32 left-1/4 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-glow" style="animation-delay: 2s"></div>
      </div>

      {/* Modern Navigation */}
      <header class={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ${
        scrollY() > 50 ? 'glass-strong backdrop-blur-strong' : 'glass backdrop-blur-md'
      }`}>
        <nav class="container mx-auto flex items-center justify-between p-6">
          <A href="#top" class="logo">
            <div class="logo-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
            </div>
            <h1 class="logo-text">
              BarterUp
            </h1>
          </A>

          {/* Desktop Navigation */}
          <ul class="hidden md:flex items-center space-x-8">
            <li><A href="#benefits" class="nav-link text-gray-300 hover:text-primary transition-colors duration-300 font-medium">Benefits</A></li>
            <li><A href="#how-it-works" class="nav-link text-gray-300 hover:text-secondary transition-colors duration-300 font-medium">How it Works</A></li>
            <li><A href="#about-us" class="nav-link text-gray-300 hover:text-accent transition-colors duration-300 font-medium">About Us</A></li>
          </ul>

          <div class="hidden md:flex items-center space-x-4">
            <A href="/signup" class="btn btn-glass text-sm px-2 ">Sign Up</A>
            <A href="/login" class="btn btn-primary text-sm px-6">Log In</A>
          </div>

          {/* Mobile Menu Button */}
          <button
            class="md:hidden p-2 rounded-lg glass hover:bg-glass transition-colors duration-300"
            onClick={() => setIsOpen(!isOpen())}
          >
            <svg class={`w-6 h-6 text-white transition-transform duration-300 ${isOpen() ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Enhanced Mobile Menu */}
        <div class={`md:hidden transition-all duration-300 ease-in-out ${isOpen() ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div class="glass-strong border-t border-white/10">
            <div class="px-6 py-4 space-y-4">
              <A href="#benefits" class="block text-gray-300 hover:text-primary py-2 transition-colors" onClick={() => setIsOpen(false)}>Benefits</A>
              <A href="#how-it-works" class="block text-gray-300 hover:text-secondary py-2 transition-colors" onClick={() => setIsOpen(false)}>How it Works</A>
              <A href="#about-us" class="block text-gray-300 hover:text-accent py-2 transition-colors" onClick={() => setIsOpen(false)}>About Us</A>
              <div class="flex flex-col space-y-2 pt-4 border-t border-white/10">
                <A href="/signup" class="btn btn-glass text-sm" onClick={() => setIsOpen(false)}>Sign Up</A>
                <A href="/login" class="btn btn-primary text-sm" onClick={() => setIsOpen(false)}>Get Started</A>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main class="relative">
        
        {/* Enhanced Hero Section */}
        <section id="hero" class="min-h-screen flex items-center justify-center text-center px-4 pt-30">
          <div class="container mx-auto max-w-10xl">
            <div class="animate-fade-in-up">
              
              
              <h1 class="text-hero mb-6">
                Share What You Know
              </h1>
              <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-8">
                Learn What You Love
              </h2>
              
              <p class="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                A modern way to grow your skillset without spending a dime. Connect, exchange, and thrive through the power of skill sharing.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <A href="/signup" class="btn btn-primary text-lg px-8 py-4 group">
                  <span>Start Your Journey</span>
                  <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </A>
                <A href="#benefits" class="btn btn-glass text-lg px-8 py-4 group">
                  <span>Learn More</span>
                  <svg class="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </A>
              </div>
              
              {/* Stats */}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary mb-2">1000+</div>
                  <div class="text-sm text-gray-400">Active Members</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-secondary mb-2">500+</div>
                  <div class="text-sm text-gray-400">Skills Shared</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-accent mb-2">250+</div>
                  <div class="text-sm text-gray-400">Successful Trades</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary mb-2">100%</div>
                  <div class="text-sm text-gray-400">Free to Use</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Benefits Section */}
        <section id="benefits" class="py-20 px-4">
          <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16 animate-fade-in-up">
              <h2 class="text-4xl md:text-5xl font-bold text-gradient mb-4">Why Choose BarterUp?</h2>
              <p class="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover the power of skill sharing and transform the way you learn and teach
              </p>
            </div>
            
            <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              
              <div class="barter-card p-8 hover-lift animate-fade-in-up">
                <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-6 mx-auto animate-glow">
                  <div class="text-4xl">🎓</div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-4 text-center">
                  Learn & Teach
                  <span class="block text-primary">for Free</span>
                </h3>
                <p class="text-gray-300 text-center leading-relaxed">
                  Exchange your skills without spending a dime. Whether you're learning to play guitar or offering design tips, BarterUp helps you grow through mutual exchange.
                </p>
              </div>

              <div class="barter-card p-8 hover-lift animate-fade-in-up" style="animation-delay: 0.2s">
                <div class="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center mb-6 mx-auto animate-glow">
                  <div class="text-4xl">🤝</div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-4 text-center">
                  Build Real
                  <span class="block text-secondary">Connections</span>
                </h3>
                <p class="text-gray-300 text-center leading-relaxed">
                  More than just a platform, BarterUp connects you with real people nearby who share your learning goals and interests.
                </p>
              </div>

              <div class="barter-card p-8 hover-lift animate-fade-in-up md:col-span-2 lg:col-span-1" style="animation-delay: 0.4s">
                <div class="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center mb-6 mx-auto animate-glow">
                  <div class="text-4xl">🌐</div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-4 text-center">
                  Empower Your
                  <span class="block text-accent">Community</span>
                </h3>
                <p class="text-gray-300 text-center leading-relaxed">
                  Support local talents and unlock potential by sharing skills with people around you. Learning doesn't have to be expensive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced How It Works Section */}
        <section id="how-it-works" class="py-20 px-4">
          <div class="container mx-auto max-w-6xl">
            
            <div class="text-center mb-16 animate-fade-in-up">
              <h2 class="text-4xl md:text-5xl font-bold text-gradient mb-4">How it Works</h2>
              <p class="text-xl text-gray-300 max-w-2xl mx-auto">
                Get started in four simple steps and begin your skill-sharing journey today
              </p>
            </div>

            <div class="grid lg:grid-cols-3 gap-8 mb-12">
              
              <div class="barter-card p-8 animate-fade-in-up">
                <div class="flex items-center justify-center w-12 h-12 rounded-full mb-6 text-black font-bold text-xl" style="background: var(--gradient-primary);">1</div>
                <h3 class="text-2xl text-white font-bold mb-4">Create Your Profile</h3>
                <p class="text-gray-300 leading-relaxed">
                  Sign up and list your skills—what you can offer and what you want to learn. Add a short bio and location to help others find you.
                </p>
              </div>

              <div class="barter-card p-8 animate-fade-in-up" style="animation-delay: 0.2s">
                <div class="flex items-center justify-center w-12 h-12 rounded-full mb-6 text-black font-bold text-xl" style="background: var(--gradient-primary);">2</div>
                <h3 class="text-2xl text-white font-bold mb-4">Search the Skill Pool</h3>
                <p class="text-gray-300 leading-relaxed">
                  Browse the growing community of users. Filter by category or distance to find people with skills you're looking for.
                </p>
              </div>

              <div class="barter-card p-8 animate-fade-in-up" style="animation-delay: 0.4s">
                <div class="flex items-center justify-center w-12 h-12 rounded-full mb-6 text-black font-bold text-xl" style="background: var(--gradient-primary);">3</div>
                <h3 class="text-2xl text-white font-bold mb-4">Propose a Skill Swap</h3>
                <p class="text-gray-300 leading-relaxed">
                  Send a swap request to users you're interested in learning from. Offer one of your skills in return.
                </p>
              </div>
            </div>

            {/* Enhanced Chat Example */}
            <div class="barter-card p-8 animate-fade-in-up">
              <div class="flex flex-col lg:flex-row gap-8 items-center">
                <div class="flex-1">
                  <div class="flex items-center justify-center w-12 h-12 rounded-full mb-6 text-black font-bold text-xl" style="background: var(--gradient-primary);">4</div>
                  <h3 class="text-2xl text-white font-bold mb-4">Chat and Collaborate</h3>
                  <p class="text-gray-300 leading-relaxed">
                    Start a conversation to arrange time, place, or method of exchange. Share ideas, negotiate terms, and build connections—all in real-time.
                  </p>
                </div>

                <div class="flex-1 max-w-md">
                  <div class="glass-card p-4 space-y-3">
                    <div class="flex justify-end">
                      <div class="px-4 py-2 rounded-2xl rounded-br-sm max-w-xs text-black" style="background: var(--gradient-primary);">
                        I want to learn basic French
                      </div>
                    </div>
                    <div class="flex justify-start">
                      <div class="glass-strong text-white px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs">
                        I can teach you! I'm a native speaker
                      </div>
                    </div>
                    <div class="flex justify-start">
                      <div class="glass-strong text-white px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs">
                        Can you teach me web development in return?💻
                      </div>
                    </div>
                    <div class="flex justify-end">
                      <div class="px-4 py-2 rounded-2xl rounded-br-sm max-w-xs text-black" style="background: var(--gradient-primary);">
                        Perfect! Let's arrange a skill swap!⚡
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced About Section */}
        <section id="about-us" class="py-20 px-4">
          <div class="container mx-auto max-w-6xl">
            
            <div class="text-center mb-16 animate-fade-in-up">
              <h2 class="text-4xl md:text-5xl font-bold text-gradient mb-4">About BarterUp</h2>
              <p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                BarterUp is a skill-sharing platform designed to promote collaborative learning and empower communities through skill exchange. Our vision is to make learning more accessible, more social, and more local.
              </p>
            </div>

            <div class="barter-card p-10 text-center animate-fade-in-up">
              <h3 class="text-3xl font-bold text-gradient mb-8">Our Mission</h3>
              <div class="grid md:grid-cols-3 gap-8 mb-8">
                <div class="space-y-4">
                  <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style="background: var(--gradient-primary);">
                    <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-white">Democratize Learning</h4>
                  <p class="text-gray-300 text-sm">Remove financial barriers and make knowledge accessible to everyone</p>
                </div>
                <div class="space-y-4">
                  <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style="background: var(--gradient-primary);">
                    <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-white">Foster Connections</h4>
                  <p class="text-gray-300 text-sm">Build meaningful relationships through shared growth and learning</p>
                </div>
                <div class="space-y-4">
                  <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style="background: var(--gradient-primary);">
                    <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-white">Support Communities</h4>
                  <p class="text-gray-300 text-sm">Create a culture of giving and learning that strengthens local talents</p>
                </div>
              </div>
              <p class="text-gray-300 text-lg">
                Join us in reshaping the way people learn—<span class="text-gradient font-semibold">together, not alone.</span>
              </p>
            </div>
          </div>
        </section>
        
        {/* Enhanced Footer */}
        <footer class="py-20 px-4 border-t border-white/10">
          <div class="container mx-auto max-w-6xl">
            
            {/* CTA Section */}
            <div class="text-center mb-16 animate-fade-in-up">
              <h3 class="text-3xl font-bold text-gradient mb-4">Ready to Start Your Journey?</h3>
              <p class="text-gray-300 mb-8">Join thousands of learners and teachers building skills together</p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <A href="/signup" class="btn btn-primary text-lg px-8 py-4">Get Started Today</A>
                <A href="/login" class="btn btn-glass text-lg px-8 py-4">Sign In</A>
              </div>
            </div>
            
            {/* Footer Content */}
            <div class="grid md:grid-cols-2 gap-8 items-center py-8 border-t border-white/10">
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--gradient-primary);">
                    <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                  <span class="text-xl font-bold text-gradient">BarterUp</span>
                </div>
                <p class="text-gray-400 max-w-md">
                  Empowering communities through skill sharing. Made with ❤️ by the BarterUp Team.
                </p>
                <p class="text-gray-500 text-sm">
                  Contact us: hello@barterup.co.id
                </p>
              </div>
              
              <div class="flex flex-col md:items-end space-y-4">
                <div class="flex space-x-6">
                  <A href="#" class="text-gray-400 hover:text-primary transition-colors">Privacy Policy</A>
                  <A href="#" class="text-gray-400 hover:text-primary transition-colors">Terms of Service</A>
                </div>
                <p class="text-gray-500 text-sm">
                  BarterUp © 2025. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;