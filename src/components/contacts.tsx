// src/components/contacts.ts
import { createSignal } from "solid-js";

export type Contact = { name: string; avatar: string };
import W3 from '../assets/W3.jpg';
import male2 from '../assets/male2.jpg';

// daftar kontak awal (yang sudah di‑follow)
const initial: Contact[] = [
  { name: "Budi Santoso", avatar: male2 },
  { name: "Siti Aminah", avatar: W3 },
];

export const [contacts, setContacts] = createSignal<Contact[]>(initial);
// inisialisasi followed = semua nama di initial
export const [followed, setFollowed] = createSignal<Set<string>>(
  new Set(initial.map((c) => c.name))
);
