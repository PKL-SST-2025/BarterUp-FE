// src/components/UIComponents.tsx
import type { Component, JSX } from "solid-js";
import { createSignal, Show } from "solid-js";

// Modern Button Component
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: JSX.Element;
  class?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: Component<ButtonProps> = (props) => {
  const baseClasses = "btn inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent";
  
  const variantClasses = {
    primary: "btn-primary focus:ring-primary/50",
    secondary: "btn-secondary focus:ring-secondary/50", 
    glass: "btn-glass focus:ring-white/50",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/50"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button
      type={props.type || 'button'}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
      class={`
        ${baseClasses}
        ${variantClasses[props.variant || 'primary']}
        ${sizeClasses[props.size || 'md']}
        ${props.fullWidth ? 'w-full' : ''}
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${props.class || ''}
      `}
    >
      <Show when={props.loading}>
        <div class="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </Show>
      {props.children}
    </button>
  );
};

// Modern Input Component  
export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onInput?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  class?: string;
  icon?: JSX.Element;
}

export const Input: Component<InputProps> = (props) => {
  return (
    <div class="space-y-1">
      <Show when={props.label}>
        <label class="block text-sm font-medium text-gray-300">
          {props.label}
          {props.required && <span class="text-red-400 ml-1">*</span>}
        </label>
      </Show>
      <div class="relative">
        <Show when={props.icon}>
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {props.icon}
          </div>
        </Show>
        <input
          type={props.type || 'text'}
          placeholder={props.placeholder}
          value={props.value}
          onInput={e => props.onInput?.(e.currentTarget.value)}
          disabled={props.disabled}
          class={`
            input-modern
            ${props.icon ? 'pl-12' : ''}
            ${props.error ? 'border-red-500 focus:border-red-500' : ''}
            ${props.class || ''}
          `}
        />
      </div>
      <Show when={props.error}>
        <p class="text-red-400 text-sm flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{props.error}</span>
        </p>
      </Show>
    </div>
  );
};

// Skill Badge Component
export interface SkillBadgeProps {
  skill: string;
  category?: 'tech' | 'creative' | 'business' | 'language' | 'craft';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export const SkillBadge: Component<SkillBadgeProps> = (props) => {
  const baseClasses = "skill-badge inline-flex items-center font-semibold text-center rounded-full transition-all duration-300";
  
  const categoryClasses = {
    tech: "skill-tech",
    creative: "skill-creative", 
    business: "skill-business",
    language: "skill-language",
    craft: "skill-craft"
  };
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };
  
  return (
    <span
      class={`
        ${baseClasses}
        ${categoryClasses[props.category || 'tech']}
        ${sizeClasses[props.size || 'md']}
        ${props.interactive ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={props.onClick}
    >
      {props.skill}
    </span>
  );
};

// Glass Card Component
export interface CardProps {
  variant?: 'default' | 'post' | 'barter';
  children: JSX.Element;
  class?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: Component<CardProps> = (props) => {
  const baseClasses = "transition-all duration-300";
  
  const variantClasses = {
    default: "card-modern",
    post: "card-post",
    barter: "barter-card p-6"
  };
  
  return (
    <div
      class={`
        ${baseClasses}
        ${variantClasses[props.variant || 'default']}
        ${props.hover ? 'hover-lift cursor-pointer' : ''}
        ${props.class || ''}
      `}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};

// Avatar Component
export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
  fallback?: string;
  class?: string;
}

export const Avatar: Component<AvatarProps> = (props) => {
  const [imageError, setImageError] = createSignal(false);
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };
  
  const statusClasses = {
    online: "status-online",
    busy: "status-busy",
    offline: "status-offline"
  };
  
  return (
    <div class={`
      relative flex-shrink-0 
      ${sizeClasses[props.size || 'md']}
      ${props.status ? statusClasses[props.status] : ''}
      ${props.class || ''}
    `}>
      <Show 
        when={props.src && !imageError()} 
        fallback={
          <div class="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-semibold">
            {props.fallback || props.alt?.charAt(0).toUpperCase() || 'U'}
          </div>
        }
      >
        <img
          src={props.src}
          alt={props.alt}
          class="w-full h-full rounded-full object-cover border-2 border-primary/20"
          onError={() => setImageError(true)}
        />
      </Show>
    </div>
  );
};

// Loading Spinner Component
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'white';
}

export const Spinner: Component<SpinnerProps> = (props) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  const variantClasses = {
    primary: "border-primary border-t-transparent",
    white: "border-white border-t-transparent"
  };
  
  return (
    <div class={`
      ${sizeClasses[props.size || 'md']}
      ${variantClasses[props.variant || 'primary']}
      border-2 rounded-full animate-spin
    `}></div>
  );
};

// Toast/Alert Component
export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert: Component<AlertProps> = (props) => {
  const typeStyles = {
    success: {
      bg: "bg-green-500/20 border-green-500/50",
      icon: "text-green-400",
      text: "text-green-200"
    },
    error: {
      bg: "bg-red-500/20 border-red-500/50", 
      icon: "text-red-400",
      text: "text-red-200"
    },
    warning: {
      bg: "bg-yellow-500/20 border-yellow-500/50",
      icon: "text-yellow-400", 
      text: "text-yellow-200"
    },
    info: {
      bg: "bg-blue-500/20 border-blue-500/50",
      icon: "text-blue-400",
      text: "text-blue-200"
    }
  };
  
  const style = typeStyles[props.type || 'info'];
  
  const icons = {
    success: <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>,
    error: <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>,
    warning: <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>,
    info: <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  };
  
  return (
    <div class={`p-4 rounded-lg border ${style.bg} animate-fade-in-up`}>
      <div class="flex items-start space-x-3">
        <svg class={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[props.type || 'info']}
        </svg>
        <div class="flex-1">
          <Show when={props.title}>
            <h4 class={`font-semibold ${style.text} mb-1`}>{props.title}</h4>
          </Show>
          <p class={`text-sm ${style.text}`}>{props.message}</p>
        </div>
        <Show when={props.dismissible}>
          <button
            onClick={props.onDismiss}
            class={`${style.icon} hover:opacity-75 transition-opacity`}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </Show>
      </div>
    </div>
  );
};

// Trade Indicator Component (BarterUp Specific)
export interface TradeIndicatorProps {
  fromSkill: string;
  toSkill: string;
  status?: 'pending' | 'active' | 'completed';
}

export const TradeIndicator: Component<TradeIndicatorProps> = (props) => {
  const statusColors = {
    pending: "border-yellow-500/50 text-yellow-300",
    active: "border-primary/50 text-primary",
    completed: "border-green-500/50 text-green-300"
  };
  
  return (
    <div class={`trade-indicator ${statusColors[props.status || 'pending']}`}>
      <span class="font-medium">{props.fromSkill}</span>
      <svg class="w-4 h-4 barter-exchange-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
      </svg>
      <span class="font-medium">{props.toSkill}</span>
    </div>
  );
};