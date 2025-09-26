// src/components/icons.tsx
import type { Component } from "solid-js";
import { iconSizes } from "./designSystem";

// Common props for all icons
export interface IconProps {
  size?: keyof typeof iconSizes | "custom";
  customSize?: string;
  class?: string;
  stroke?: string;
  fill?: string;
}

// Base Icon component to ensure consistency
const BaseIcon: Component<IconProps & { children: any }> = (props) => {
  const sizeClass = props.size && props.size !== "custom" ? iconSizes[props.size] : props.customSize || iconSizes.md;
  
  return (
    <svg 
      class={`${sizeClass} ${props.class || ""}`}
      fill={props.fill || "none"}
      stroke={props.stroke || "currentColor"}
      viewBox="0 0 24 24"
    >
      {props.children}
    </svg>
  );
};

// User/Person Icon
export const PersonIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </BaseIcon>
);

// Edit/Pencil Icon
export const PencilIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </BaseIcon>
);

// Home Icon
export const HomeIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </BaseIcon>
);

// Message/Chat Icon
export const MessageIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </BaseIcon>
);

// Skills/Light Bulb Icon
export const SkillIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </BaseIcon>
);

// Photo/Image Icon
export const PhotoIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </BaseIcon>
);

// Upload Icon
export const UploadIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </BaseIcon>
);

// Checkmark Icon
export const CheckIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M5 13l4 4L19 7"
    />
  </BaseIcon>
);

// Warning Icon
export const WarningIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </BaseIcon>
);

// Settings Icon
export const SettingsIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </BaseIcon>
);

// Logout Icon
export const LogoutIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </BaseIcon>
);

// Chevron Down Icon
export const ChevronDownIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M19 9l-7 7-7-7"
    />
  </BaseIcon>
);

// Exchange/Barter Icon
export const BarterIcon: Component<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </BaseIcon>
);
