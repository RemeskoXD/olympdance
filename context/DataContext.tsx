import React, { createContext, useContext, useState, useEffect } from 'react';
import { SCHOOLS as INITIAL_SCHOOLS, CAMPS as INITIAL_CAMPS, GALLERY_IMAGES as INITIAL_GALLERY_IMAGES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { School, Camp, GalleryImage, Product } from '../types';

interface DataContextType {
  schools: School[];
  camps: Camp[];
  galleryImages: GalleryImage[];
  products: Product[];
  isMerchEnabled: boolean;
  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (id: string, updatedSchool: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  addCamp: (camp: Omit<Camp, 'id'>) => void;
  updateCamp: (id: string, updatedCamp: Partial<Camp>) => void;
  deleteCamp: (id: string) => void;
  addGalleryImage: (imageUrl: string) => void;
  deleteGalleryImage: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  toggleMerch: (enabled: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or fall back to constants
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('olymp_schools');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [camps, setCamps] = useState<Camp[]>(() => {
    const saved = localStorage.getItem('olymp_camps');
    return saved ? JSON.parse(saved) : INITIAL_CAMPS;
  });

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem('olymp_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY_IMAGES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('olymp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [isMerchEnabled, setIsMerchEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('olymp_merch_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('olymp_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('olymp_camps', JSON.stringify(camps));
  }, [camps]);

  useEffect(() => {
    localStorage.setItem('olymp_gallery', JSON.stringify(galleryImages));
  }, [galleryImages]);

  useEffect(() => {
    localStorage.setItem('olymp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('olymp_merch_enabled', JSON.stringify(isMerchEnabled));
  }, [isMerchEnabled]);

  const addSchool = (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: Date.now().toString() };
    setSchools([...schools, newSchool]);
  };

  const updateSchool = (id: string, updatedSchool: Partial<School>) => {
    setSchools(schools.map(s => s.id === id ? { ...s, ...updatedSchool } : s));
  };

  const deleteSchool = (id: string) => {
    setSchools(schools.filter(s => s.id !== id));
  };

  const addCamp = (camp: Omit<Camp, 'id'>) => {
    const newCamp = { ...camp, id: Date.now().toString() };
    setCamps([...camps, newCamp]);
  };

  const updateCamp = (id: string, updatedCamp: Partial<Camp>) => {
    setCamps(camps.map(c => c.id === id ? { ...c, ...updatedCamp } : c));
  };

  const deleteCamp = (id: string) => {
    setCamps(camps.filter(c => c.id !== id));
  };

  const addGalleryImage = (imageUrl: string) => {
    const newImage: GalleryImage = {
        id: Date.now().toString(),
        url: imageUrl
    };
    setGalleryImages([newImage, ...galleryImages]);
  };

  const deleteGalleryImage = (id: string) => {
    setGalleryImages(galleryImages.filter(img => img.id !== id));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
      const newProduct = { ...product, id: Date.now().toString() };
      setProducts([...products, newProduct]);
  };

  const deleteProduct = (id: string) => {
      setProducts(products.filter(p => p.id !== id));
  };

  const toggleMerch = (enabled: boolean) => {
      setIsMerchEnabled(enabled);
  };

  return (
    <DataContext.Provider value={{ 
      schools, camps, galleryImages, products, isMerchEnabled,
      addSchool, updateSchool, deleteSchool, 
      addCamp, updateCamp, deleteCamp,
      addGalleryImage, deleteGalleryImage,
      addProduct, deleteProduct, toggleMerch
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};