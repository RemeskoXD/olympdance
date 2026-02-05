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