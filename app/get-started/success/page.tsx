"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageLight: "#e4ede9",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
  apricot: "#c97a52",
} as const;

type Profile = {
  full_name: string;
  description: string;
  experience_categories: string[];
};

export default function GetStartedSuccessPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  co