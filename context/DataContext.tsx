import React, { createContext, useContext, useState, useEffect } from 'react';
import { SCHOOLS as INITIAL_SCHOOLS, CAMPS as INITIAL_CAMPS, GALLERY_IMAGES as INITIAL_GALLERY_IMAGES } from '../constants';
import { School, Camp, GalleryImage } from '../types';

interface DataContextType {
  schools: School[];
  camps: Camp[];
  galleryImages: GalleryImage[];
  addSchool: (school: Omit<School, 'id'>) => void;
  deleteSchool: (id: string) => void;
  addCamp: (camp: Omit<Camp, 'id'>) => void;
  deleteCamp: (id: string) => void;
  addGalleryImage: (imageUrl: string) => void;
  deleteGalleryImage: (id: string) => void;
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

  const addSchool = (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: Date.now().toString() };
    setSchools([...schools, newSchool]);
  };

  const deleteSchool = (id: string) => {
    setSchools(schools.filter(s => s.id !== id));
  };

  const addCamp = (camp: Omit<Camp, 'id'>) => {
    const newCamp = { ...camp, id: Date.now().toString() };
    setCamps([...camps, newCamp]);
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

  return (
    <DataContext.Provider value={{ 
      schools, camps, galleryImages, 
      addSchool, deleteSchool, 
      addCamp, deleteCamp,
      addGalleryImage, deleteGalleryImage 
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