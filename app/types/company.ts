// types/company.ts
export type Company = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline?: string;
  logo_url?: string | null;
  banner_url?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  culture_video_url?: string | null;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CompanySection = {
  id: string;
  company_id: string;
  type: string;
  title?: string;
  content?: string;
  media_url?: string | null;
  order_index?: number;
  visible?: boolean;
  created_at?: string;
  updated_at?: string;
};
