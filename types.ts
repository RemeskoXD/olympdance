export interface School {
  id: string;
  name: string;
  city: string;
  day: string;
  time: string;
  price: string;
  isKindergarten?: boolean;
  trainingDates?: string[];
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
  location?: string;
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
  isAction?: boolean;
  originalPrice?: string;
  actionBadge?: string;
  sizes?: string[];
}

export interface SchoolRegistration {
  id: string;
  variableSymbol?: string;
  schoolId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  childName: string;
  childSurname?: string;
  childBirthDate?: string;
  childRodneCislo?: string;
  childClass?: string;
  childPhone?: string;
  afterSchoolClub?: boolean;
  status: RegistrationStatus;
  adminNote?: string;
  createdAt: string;
  password?: string;
  paidUntil?: string;
  history?: { date: string; message: string }[];
}

export type RegistrationStatus = 'pending_payment' | 'pending_approval' | 'approved' | 'action_required' | 'rejected' | 'cancelled';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'trainer';
  schoolId?: string; // For trainers (single / backward compatibility)
  schoolIds?: string[]; // Multiple assigned schools for trainers
  name: string;
}

export interface Excuse {
  id: string;
  registrationId: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  records: Record<string, boolean>; // registrationId -> isPresent
}

export interface Registration {
  id: string;
  variableSymbol?: string;
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

export interface MerchOrder {
  id: string;
  productId: string;
  productName: string;
  productPrice: string;
  size: string;
  quantity: number;
  totalPrice: number;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  deliveryNote?: string;
  variableSymbol: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
}
