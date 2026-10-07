export type TemplateId =
  | "modern"
  | "beauty"
  | "restaurant"
  | "school"
  | "construction"
  | "realestate"
  | "portfolio"
  | "professional"
  | "shop"
  | "event";

export type Device = "desktop" | "tablet" | "mobile";
export type Goal =
  | "Get customers"
  | "Show services"
  | "Sell products"
  | "Build a portfolio"
  | "Share information"
  | "Collect enquiries";

export type SectionType =
  | "hero" | "text" | "services" | "products" | "gallery" | "testimonials"
  | "faq" | "contact" | "map" | "cta" | "footer";

export interface BusinessInfo {
  name: string;
  type: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  services: string;
  hours: string;
  goal: Goal;
  category: string;
  logo?: string;
  photos: string[];
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  text?: string;
  items?: Array<{ title: string; text: string; price?: string; image?: string }>;
  image?: string;
  buttonText?: string;
  buttonHref?: string;
  visible: boolean;
}

export interface SitePage {
  id: string;
  name: string;
  sections: Section[];
  seo: { title: string; description: string; keywords: string; socialImage: string; robots: string };
}

export interface WebsiteProject {
  id: string;
  name: string;
  template: TemplateId;
  business: BusinessInfo;
  pages: SitePage[];
  createdAt: string;
  updatedAt: string;
  status: "Draft" | "Published";
  brand: { primary: string; secondary: string; accent: string; font: string };
  freeBranding: boolean;
}