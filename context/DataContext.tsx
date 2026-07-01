import React, { createContext, useContext, useState, useEffect } from 'react';
import { SCHOOLS as INITIAL_SCHOOLS, CAMPS as INITIAL_CAMPS, GALLERY_IMAGES as INITIAL_GALLERY_IMAGES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { School, Camp, GalleryImage, Product, Registration, SchoolRegistration, User, Excuse, Attendance } from '../types';

interface DataContextType {
  schools: School[];
  camps: Camp[];
  galleryImages: GalleryImage[];
  products: Product[];
  registrations: Registration[];
  schoolRegistrations: SchoolRegistration[];
  users: User[];
  excuses: Excuse[];
  attendance: Attendance[];
  isMerchEnabled: boolean;
  campGeneralInfo: string;
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
  addRegistration: (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => Promise<Registration>;
  updateRegistration: (id: string, updatedRegistration: Partial<Registration>) => void;
  addSchoolRegistration: (registration: Omit<SchoolRegistration, 'id' | 'createdAt' | 'status'>) => Promise<SchoolRegistration>;
  updateSchoolRegistration: (id: string, updatedRegistration: Partial<SchoolRegistration>) => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addExcuse: (excuse: Omit<Excuse, 'id' | 'createdAt'>) => Promise<void>;
  updateAttendance: (schoolId: string, date: string, records: Record<string, boolean>) => Promise<void>;
  toggleMerch: (enabled: boolean) => void;
  updateCampGeneralInfo: (info: string) => void;
  uploadFile: (file: File) => Promise<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [schoolRegistrations, setSchoolRegistrations] = useState<SchoolRegistration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isMerchEnabled, setIsMerchEnabled] = useState<boolean>(true);
  const [campGeneralInfo, setCampGeneralInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          setSchools(data.schools || INITIAL_SCHOOLS);
          setCamps(data.camps || INITIAL_CAMPS);
          setGalleryImages(data.galleryImages || INITIAL_GALLERY_IMAGES);
          setProducts(data.products || INITIAL_PRODUCTS);
          setRegistrations(data.registrations || []);
          setSchoolRegistrations(data.schoolRegistrations || []);
          setUsers(data.users || []);
          setExcuses(data.excuses || []);
          setAttendance(data.attendance || []);
          setIsMerchEnabled(data.isMerchEnabled ?? true);
          setCampGeneralInfo(data.campGeneralInfo || '');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // API Helpers
  const apiCall = async (endpoint: string, method: string, body?: any) => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('API call failed');
      return await response.json();
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      throw error;
    }
  };

  const addSchool = async (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: Date.now().toString() };
    setSchools([...schools, newSchool]);
    await apiCall('/api/schools', 'POST', newSchool);
  };

  const updateSchool = async (id: string, updatedSchool: Partial<School>) => {
    setSchools(schools.map(s => s.id === id ? { ...s, ...updatedSchool } : s));
    await apiCall(`/api/schools/${id}`, 'PUT', updatedSchool);
  };

  const deleteSchool = async (id: string) => {
    setSchools(schools.filter(s => s.id !== id));
    await apiCall(`/api/schools/${id}`, 'DELETE');
  };

  const addCamp = async (camp: Omit<Camp, 'id'>) => {
    const newCamp = { ...camp, id: Date.now().toString() };
    setCamps([...camps, newCamp]);
    await apiCall('/api/camps', 'POST', newCamp);
  };

  const updateCamp = async (id: string, updatedCamp: Partial<Camp>) => {
    setCamps(camps.map(c => c.id === id ? { ...c, ...updatedCamp } : c));
    await apiCall(`/api/camps/${id}`, 'PUT', updatedCamp);
  };

  const deleteCamp = async (id: string) => {
    setCamps(camps.filter(c => c.id !== id));
    await apiCall(`/api/camps/${id}`, 'DELETE');
  };

  const addGalleryImage = async (imageUrl: string) => {
    const newImage: GalleryImage = {
        id: Date.now().toString(),
        url: imageUrl
    };
    setGalleryImages([newImage, ...galleryImages]);
    await apiCall('/api/gallery', 'POST', newImage);
  };

  const deleteGalleryImage = async (id: string) => {
    setGalleryImages(galleryImages.filter(img => img.id !== id));
    await apiCall(`/api/gallery/${id}`, 'DELETE');
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
      const newProduct = { ...product, id: Date.now().toString() };
      setProducts([...products, newProduct]);
      await apiCall('/api/products', 'POST', newProduct);
  };

  const deleteProduct = async (id: string) => {
      setProducts(products.filter(p => p.id !== id));
      await apiCall(`/api/products/${id}`, 'DELETE');
  };

  const addRegistration = async (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => {
    const newRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending_payment',
      password: Math.random().toString(36).slice(-8)
    };
    
    setRegistrations([...registrations, newRegistration]);
    await apiCall('/api/registrations', 'POST', newRegistration);
    
    return newRegistration;
  };

  const updateRegistration = async (id: string, updatedRegistration: Partial<Registration>) => {
    setRegistrations(registrations.map(r => r.id === id ? { ...r, ...updatedRegistration } : r));
    await apiCall(`/api/registrations/${id}`, 'PUT', updatedRegistration);
  };

  const addSchoolRegistration = async (registration: Omit<SchoolRegistration, 'id' | 'createdAt' | 'status'>): Promise<SchoolRegistration> => {
    const newRegistration: SchoolRegistration = {
      ...registration,
      id: `sr${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      password: registration.password || Math.random().toString(36).slice(-8)
    };
    
    setSchoolRegistrations([...schoolRegistrations, newRegistration]);
    await apiCall('/api/school-registrations', 'POST', newRegistration);
    
    return newRegistration;
  };

  const updateSchoolRegistration = async (id: string, updatedRegistration: Partial<SchoolRegistration>) => {
    setSchoolRegistrations(schoolRegistrations.map(r => r.id === id ? { ...r, ...updatedRegistration } : r));
    await apiCall(`/api/school-registrations/${id}`, 'PUT', updatedRegistration);
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `usr${Date.now()}` };
    setUsers([...users, newUser]);
    await apiCall('/api/users', 'POST', newUser);
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
    await apiCall(`/api/users/${id}`, 'PUT', updatedUser);
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    await apiCall(`/api/users/${id}`, 'DELETE');
  };

  const addExcuse = async (excuse: Omit<Excuse, 'id' | 'createdAt'>) => {
    const newExcuse: Excuse = {
      ...excuse,
      id: `exc${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExcuses([...excuses, newExcuse]);
    await apiCall('/api/excuses', 'POST', newExcuse);
  };

  const updateAttendance = async (schoolId: string, date: string, records: Record<string, boolean>) => {
    const existingIndex = attendance.findIndex(a => a.schoolId === schoolId && a.date === date);
    if (existingIndex >= 0) {
      const existing = attendance[existingIndex];
      const updated = { ...existing, records };
      setAttendance(attendance.map((a, i) => i === existingIndex ? updated : a));
      await apiCall(`/api/attendance/${existing.id}`, 'PUT', { records });
    } else {
      const newAttendance: Attendance = {
        id: `att${Date.now()}`,
        schoolId,
        date,
        records
      };
      setAttendance([...attendance, newAttendance]);
      await apiCall('/api/attendance', 'POST', newAttendance);
    }
  };

  const toggleMerch = async (enabled: boolean) => {
      setIsMerchEnabled(enabled);
      await apiCall('/api/settings', 'POST', { isMerchEnabled: enabled });
  };

  const updateCampGeneralInfo = async (info: string) => {
      setCampGeneralInfo(info);
      await apiCall('/api/settings', 'POST', { campGeneralInfo: info });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.url;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Načítám data...</div>;
  }

  return (
    <DataContext.Provider value={{ 
      schools, camps, galleryImages, products, registrations, schoolRegistrations, users, excuses, attendance, isMerchEnabled, campGeneralInfo,
      addSchool, updateSchool, deleteSchool, 
      addCamp, updateCamp, deleteCamp,
      addGalleryImage, deleteGalleryImage,
      addProduct, deleteProduct, 
      addRegistration, updateRegistration,
      addSchoolRegistration, updateSchoolRegistration,
      addUser, updateUser, deleteUser,
      addExcuse, updateAttendance,
      toggleMerch, updateCampGeneralInfo,
      uploadFile
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