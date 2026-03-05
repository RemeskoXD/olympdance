export interface School {
  id: string;
  name: string;
  city: string;
  day: string;
  time: string;
  price: string;
  isKindergarten?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Camp {
  id: string;
  title: string;
  date: string;
  price: string;
  description: string;
  image: string;
  externalUrl?: string;
  details?: string;
  variableSymbol?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

export type RegistrationStatus = 'pending_payment' | 'pending_approval' | 'approved' | 'action_required' | 'rejected';

export interface Registration {
  id: string;
  campId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childBirthDate: string;
  status: RegistrationStatus;
  adminNote?: string;
  documents: string[]; // Mocked document URLs or names
  createdAt: string;
  password?: string; // Mocked password for client portal
}