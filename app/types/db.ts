// types/db.ts
// Minimal typed interfaces matching your Postgres schema.
// Extend as you add fields; keep fields readonly where appropriate.

// types/db.ts
export type Role = 'recruiter' | 'admin';

export type DBUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  company_id?: string | null;
  created_at: string;
  updated_at?: string | null;
};


export interface Company {
  id: string;
  name: string;
  slug: string;
    owner_id?: string | null; // new

  tagline?: string | null;
  website?: string | null;
  published: boolean;
  primary_color?: string | null;
  accent_color?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  culture_video_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CompanySection {
  id: string;
  company_id: string;
  type: 'about' | 'life' | 'perks' | 'team' | 'cta' | 'custom';
  title?: string | null;
  content?: string | null;
  media_url?: string | null;
  order_index: number;
  visible: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  job_slug: string;
  location?: string | null;
  location_tag?: string | null;
  work_policy?: 'Remote' | 'Hybrid' | 'Onsite' | null;
  department?: string | null;
  employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | null;
  experience_level?: 'Junior' | 'Mid-level' | 'Senior' | null;
  job_type?: 'Temporary' | 'Permanent' | null;
  salary_range?: string | null;
  description?: string | null;
  responsibilities?: unknown[] | null;
  qualifications?: unknown[] | null;
  posted_at?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at?: string | null;
}
