import React, { createContext, useContext, useState, useEffect } from 'react';
import { SCHOOLS as INITIAL_SCHOOLS, CAMPS as INITIAL_CAMPS, GALLERY_IMAGES as INITIAL_GALLERY_IMAGES, PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { School, Camp, GalleryImage, Product, Registration, SchoolRegistration, User, Excuse, Attendance, MerchOrder } from '../types';

declare global {
  interface Window {
    __OLYMP_SETTINGS__?: {
      isMerchEnabled?: boolean;
      isTanecniExpresEnabled?: boolean;
      isCampsEnabled?: boolean;
      isGalleryEnabled?: boolean;
      isAboutEnabled?: boolean;
      [key: string]: any;
    };
  }
}

interface DataContextType {
  schools: School[];
  camps: Camp[];
  galleryImages: GalleryImage[];
  products: Product[];
  registrations: Registration[];
  schoolRegistrations: SchoolRegistration[];
  merchOrders: MerchOrder[];
  users: User[];
  excuses: Excuse[];
  attendance: Attendance[];
  isMerchEnabled: boolean;
  isTanecniExpresEnabled: boolean;
  isCampsEnabled: boolean;
  isGalleryEnabled: boolean;
  isAboutEnabled: boolean;
  campGeneralInfo: string;
  siteContent: any;
  updateSiteContent: (newContent: any) => void;
  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (id: string, updatedSchool: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  addCamp: (camp: Omit<Camp, 'id'>) => void;
  updateCamp: (id: string, updatedCamp: Partial<Camp>) => void;
  deleteCamp: (id: string) => void;
  addGalleryImage: (imageUrl: string) => void;
  deleteGalleryImage: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addRegistration: (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => Promise<Registration>;
  updateRegistration: (id: string, updatedRegistration: Partial<Registration>) => void;
  deleteRegistration: (id: string) => Promise<void>;
  addSchoolRegistration: (registration: Omit<SchoolRegistration, 'id' | 'createdAt' | 'status'>) => Promise<SchoolRegistration>;
  updateSchoolRegistration: (id: string, updatedRegistration: Partial<SchoolRegistration>) => void;
  deleteSchoolRegistration: (id: string) => Promise<void>;
  addMerchOrder: (order: Omit<MerchOrder, 'id' | 'createdAt' | 'status' | 'variableSymbol'>) => Promise<MerchOrder>;
  updateMerchOrder: (id: string, updates: Partial<MerchOrder>) => Promise<void>;
  deleteMerchOrder: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addExcuse: (excuse: Omit<Excuse, 'id' | 'createdAt'>) => Promise<void>;
  deleteExcuse: (id: string) => Promise<void>;
  updateAttendance: (schoolId: string, date: string, records: Record<string, boolean>) => Promise<void>;
  toggleMerch: (enabled: boolean) => Promise<void>;
  toggleTanecniExpres: (enabled: boolean) => Promise<void>;
  toggleCamps: (enabled: boolean) => Promise<void>;
  toggleGallery: (enabled: boolean) => Promise<void>;
  toggleAbout: (enabled: boolean) => Promise<void>;
  updateCampGeneralInfo: (info: string) => void;
  uploadFile: (file: File) => Promise<string>;
  refreshData: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load cached or default data immediately so UI is NEVER empty
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_schools');
      return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
    } catch {
      return INITIAL_SCHOOLS;
    }
  });

  const [camps, setCamps] = useState<Camp[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_camps');
      return saved ? JSON.parse(saved) : INITIAL_CAMPS;
    } catch {
      return INITIAL_CAMPS;
    }
  });

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_gallery');
      return saved ? JSON.parse(saved) : INITIAL_GALLERY_IMAGES;
    } catch {
      return INITIAL_GALLERY_IMAGES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_registrations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [schoolRegistrations, setSchoolRegistrations] = useState<SchoolRegistration[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_school_registrations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [merchOrders, setMerchOrders] = useState<MerchOrder[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_merch_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [excuses, setExcuses] = useState<Excuse[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_excuses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    try {
      const saved = localStorage.getItem('olymp_attendance');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const getInitialSetting = (key: 'isMerchEnabled' | 'isTanecniExpresEnabled' | 'isCampsEnabled' | 'isGalleryEnabled' | 'isAboutEnabled', fallback: boolean = true) => {
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__ && window.__OLYMP_SETTINGS__[key] !== undefined) {
      return Boolean(window.__OLYMP_SETTINGS__[key]);
    }
    try {
      const saved = localStorage.getItem(`olymp_settings_${key}`);
      return saved !== null ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isMerchEnabled, setIsMerchEnabled] = useState<boolean>(() => getInitialSetting('isMerchEnabled', true));
  const [isTanecniExpresEnabled, setIsTanecniExpresEnabled] = useState<boolean>(() => getInitialSetting('isTanecniExpresEnabled', true));
  const [isCampsEnabled, setIsCampsEnabled] = useState<boolean>(() => getInitialSetting('isCampsEnabled', true));
  const [isGalleryEnabled, setIsGalleryEnabled] = useState<boolean>(() => getInitialSetting('isGalleryEnabled', true));
  const [isAboutEnabled, setIsAboutEnabled] = useState<boolean>(() => getInitialSetting('isAboutEnabled', true));

  const [campGeneralInfo, setCampGeneralInfo] = useState<string>('');
  const [siteContent, setSiteContent] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('olymp_site_content');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      heroTitle: 'Objevte pravou radost z pohybu a tance',
      heroSubtitle: 'Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!',
      aboutText: '<strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat <span class="text-brand-red font-bold">lásku k pohybu</span>, která jim vydrží celý život.\n\nZaměřujeme se na moderní taneční styly, disko tance a street dance. Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.'
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from API with safe JSON verification
  const refreshData = async () => {
    try {
      const response = await fetch('/api/data');
      const contentType = response.headers.get('content-type') || '';
      
      // Ensure response is actually JSON and not an HTML SPA fallback (<!DOCTYPE html>...)
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          if (Array.isArray(data.schools) && data.schools.length > 0) {
            setSchools(data.schools);
            localStorage.setItem('olymp_schools', JSON.stringify(data.schools));
          }
          if (Array.isArray(data.camps) && data.camps.length > 0) {
            setCamps(data.camps);
            localStorage.setItem('olymp_camps', JSON.stringify(data.camps));
          }
          if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            setGalleryImages(data.galleryImages);
            localStorage.setItem('olymp_gallery', JSON.stringify(data.galleryImages));
          }
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            localStorage.setItem('olymp_products', JSON.stringify(data.products));
          }
          if (Array.isArray(data.registrations)) {
            setRegistrations(data.registrations);
            localStorage.setItem('olymp_registrations', JSON.stringify(data.registrations));
          }
          if (Array.isArray(data.schoolRegistrations)) {
            setSchoolRegistrations(data.schoolRegistrations);
            localStorage.setItem('olymp_school_registrations', JSON.stringify(data.schoolRegistrations));
          }
          if (Array.isArray(data.merchOrders)) {
            setMerchOrders(data.merchOrders);
            localStorage.setItem('olymp_merch_orders', JSON.stringify(data.merchOrders));
          }
          if (Array.isArray(data.users)) {
            setUsers(data.users);
            localStorage.setItem('olymp_users', JSON.stringify(data.users));
          }
          if (Array.isArray(data.excuses)) {
            setExcuses(data.excuses);
            localStorage.setItem('olymp_excuses', JSON.stringify(data.excuses));
          }
          if (Array.isArray(data.attendance)) {
            setAttendance(data.attendance);
            localStorage.setItem('olymp_attendance', JSON.stringify(data.attendance));
          }
          if (data.isMerchEnabled !== undefined) {
            setIsMerchEnabled(Boolean(data.isMerchEnabled));
            localStorage.setItem('olymp_settings_isMerchEnabled', JSON.stringify(data.isMerchEnabled));
          }
          if (data.isTanecniExpresEnabled !== undefined) {
            setIsTanecniExpresEnabled(Boolean(data.isTanecniExpresEnabled));
            localStorage.setItem('olymp_settings_isTanecniExpresEnabled', JSON.stringify(data.isTanecniExpresEnabled));
          }
          if (data.isCampsEnabled !== undefined) {
            setIsCampsEnabled(Boolean(data.isCampsEnabled));
            localStorage.setItem('olymp_settings_isCampsEnabled', JSON.stringify(data.isCampsEnabled));
          }
          if (data.isGalleryEnabled !== undefined) {
            setIsGalleryEnabled(Boolean(data.isGalleryEnabled));
            localStorage.setItem('olymp_settings_isGalleryEnabled', JSON.stringify(data.isGalleryEnabled));
          }
          if (data.isAboutEnabled !== undefined) {
            setIsAboutEnabled(Boolean(data.isAboutEnabled));
            localStorage.setItem('olymp_settings_isAboutEnabled', JSON.stringify(data.isAboutEnabled));
          }
          if (data.campGeneralInfo !== undefined) {
            setCampGeneralInfo(data.campGeneralInfo);
          }
          if (data.siteContent && Object.keys(data.siteContent).length > 0) {
            setSiteContent(data.siteContent);
            localStorage.setItem('olymp_site_content', JSON.stringify(data.siteContent));
          }
        }
      } else {
        console.warn('Backend API returned non-JSON response or is offline. Operating with static/cached data.');
      }
    } catch (error) {
      console.warn('API fetch did not return JSON, using local data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.isMerchEnabled !== undefined) {
          setIsMerchEnabled(Boolean(data.isMerchEnabled));
          localStorage.setItem('olymp_settings_isMerchEnabled', JSON.stringify(data.isMerchEnabled));
        }
        if (data.isTanecniExpresEnabled !== undefined) {
          setIsTanecniExpresEnabled(Boolean(data.isTanecniExpresEnabled));
          localStorage.setItem('olymp_settings_isTanecniExpresEnabled', JSON.stringify(data.isTanecniExpresEnabled));
        }
        if (data.isCampsEnabled !== undefined) {
          setIsCampsEnabled(Boolean(data.isCampsEnabled));
          localStorage.setItem('olymp_settings_isCampsEnabled', JSON.stringify(data.isCampsEnabled));
        }
        if (data.isGalleryEnabled !== undefined) {
          setIsGalleryEnabled(Boolean(data.isGalleryEnabled));
          localStorage.setItem('olymp_settings_isGalleryEnabled', JSON.stringify(data.isGalleryEnabled));
        }
        if (data.isAboutEnabled !== undefined) {
          setIsAboutEnabled(Boolean(data.isAboutEnabled));
          localStorage.setItem('olymp_settings_isAboutEnabled', JSON.stringify(data.isAboutEnabled));
        }
        if (data.campGeneralInfo !== undefined) {
          setCampGeneralInfo(data.campGeneralInfo);
        }
      }
    } catch (e) {
      // offline fallback
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshData();
    // Auto-sync with remote database every 15 seconds and when browser tab regains focus
    const interval = setInterval(() => {
      refreshSettings();
      refreshData();
    }, 15000);
    const onFocus = () => {
      refreshSettings();
      refreshData();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Save to localStorage whenever critical states change
  useEffect(() => {
    try {
      localStorage.setItem('olymp_schools', JSON.stringify(schools));
    } catch {}
  }, [schools]);

  useEffect(() => {
    try {
      localStorage.setItem('olymp_camps', JSON.stringify(camps));
    } catch {}
  }, [camps]);

  useEffect(() => {
    try {
      localStorage.setItem('olymp_registrations', JSON.stringify(registrations));
    } catch {}
  }, [registrations]);

  useEffect(() => {
    try {
      localStorage.setItem('olymp_school_registrations', JSON.stringify(schoolRegistrations));
    } catch {}
  }, [schoolRegistrations]);

  useEffect(() => {
    try {
      localStorage.setItem('olymp_excuses', JSON.stringify(excuses));
    } catch {}
  }, [excuses]);

  useEffect(() => {
    try {
      localStorage.setItem('olymp_attendance', JSON.stringify(attendance));
    } catch {}
  }, [attendance]);

  // API Helpers with graceful offline support
  const apiCall = async (endpoint: string, method: string, body?: any) => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true, localOnly: true };
    } catch (error) {
      console.warn(`API call ${method} ${endpoint} failed, continuing locally:`, error);
      return { success: true, localOnly: true };
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

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    await apiCall(`/api/products/${id}`, 'PUT', updatedProduct);
  };

  const deleteProduct = async (id: string) => {
      setProducts(products.filter(p => p.id !== id));
      await apiCall(`/api/products/${id}`, 'DELETE');
  };

  const addRegistration = async (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => {
    const vs = (registration.variableSymbol || `262${Date.now().toString().slice(-6)}`).replace(/\D/g, '').slice(0, 10);
    const newRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      variableSymbol: vs,
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

  const deleteRegistration = async (id: string) => {
    setRegistrations(registrations.filter(r => r.id !== id));
    await apiCall(`/api/registrations/${id}`, 'DELETE');
  };

  const addSchoolRegistration = async (registration: Omit<SchoolRegistration, 'id' | 'createdAt' | 'status'>): Promise<SchoolRegistration> => {
    const cleanRc = (registration.childRodneCislo || '').replace(/\D/g, '').slice(0, 10);
    const vs = (registration.variableSymbol || (cleanRc && cleanRc.length >= 6 ? cleanRc : `261${Date.now().toString().slice(-6)}`)).replace(/\D/g, '').slice(0, 10);
    const newRegistration: SchoolRegistration = {
      ...registration,
      id: `sr${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      variableSymbol: vs,
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

  const deleteSchoolRegistration = async (id: string) => {
    setSchoolRegistrations(schoolRegistrations.filter(r => r.id !== id));
    await apiCall(`/api/school-registrations/${id}`, 'DELETE');
  };

  const addMerchOrder = async (orderData: Omit<MerchOrder, 'id' | 'createdAt' | 'status' | 'variableSymbol'>): Promise<MerchOrder> => {
    const vs = `80${Date.now().toString().slice(-6)}`;
    const newOrder: MerchOrder = {
      ...orderData,
      id: `order-${Date.now()}`,
      variableSymbol: vs,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setMerchOrders(prev => [newOrder, ...prev]);
    const res = await apiCall('/api/merch-orders', 'POST', newOrder);
    return res || newOrder;
  };

  const updateMerchOrder = async (id: string, updates: Partial<MerchOrder>) => {
    setMerchOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    await apiCall(`/api/merch-orders/${id}`, 'PUT', updates);
  };

  const deleteMerchOrder = async (id: string) => {
    setMerchOrders(prev => prev.filter(o => o.id !== id));
    await apiCall(`/api/merch-orders/${id}`, 'DELETE');
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

  const deleteExcuse = async (id: string) => {
    setExcuses(excuses.filter(e => e.id !== id));
    await apiCall(`/api/excuses/${id}`, 'DELETE');
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
    localStorage.setItem('olymp_settings_isMerchEnabled', JSON.stringify(enabled));
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isMerchEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isMerchEnabled: enabled });
  };

  const toggleTanecniExpres = async (enabled: boolean) => {
    setIsTanecniExpresEnabled(enabled);
    localStorage.setItem('olymp_settings_isTanecniExpresEnabled', JSON.stringify(enabled));
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isTanecniExpresEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isTanecniExpresEnabled: enabled });
  };

  const toggleCamps = async (enabled: boolean) => {
    setIsCampsEnabled(enabled);
    localStorage.setItem('olymp_settings_isCampsEnabled', JSON.stringify(enabled));
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isCampsEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isCampsEnabled: enabled });
  };

  const toggleGallery = async (enabled: boolean) => {
    setIsGalleryEnabled(enabled);
    localStorage.setItem('olymp_settings_isGalleryEnabled', JSON.stringify(enabled));
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isGalleryEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isGalleryEnabled: enabled });
  };

  const toggleAbout = async (enabled: boolean) => {
    setIsAboutEnabled(enabled);
    localStorage.setItem('olymp_settings_isAboutEnabled', JSON.stringify(enabled));
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isAboutEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isAboutEnabled: enabled });
  };

  const updateCampGeneralInfo = async (info: string) => {
    setCampGeneralInfo(info);
    await apiCall('/api/settings', 'POST', { campGeneralInfo: info });
  };

  const updateSiteContent = async (newContent: any) => {
    setSiteContent(newContent);
    await apiCall('/api/settings', 'POST', { siteContent: newContent });
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        return data.url;
      }
    } catch (e) {
      console.warn('Upload API failed, falling back to FileReader base64:', e);
    }
    
    // Fallback: convert to base64 Data URL so user can still see and use the file locally
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Načítám data...</div>;
  }

  return (
    <DataContext.Provider value={{ 
      schools, camps, galleryImages, products, registrations, schoolRegistrations, merchOrders, users, excuses, attendance, 
      isMerchEnabled, isTanecniExpresEnabled, isCampsEnabled, isGalleryEnabled, isAboutEnabled, campGeneralInfo, siteContent, updateSiteContent,
      addSchool, updateSchool, deleteSchool, 
      addCamp, updateCamp, deleteCamp,
      addGalleryImage, deleteGalleryImage,
      addProduct, updateProduct, deleteProduct, 
      addRegistration, updateRegistration, deleteRegistration,
      addSchoolRegistration, updateSchoolRegistration, deleteSchoolRegistration,
      addMerchOrder, updateMerchOrder, deleteMerchOrder,
      addUser, updateUser, deleteUser,
      addExcuse, deleteExcuse, updateAttendance,
      toggleMerch, toggleTanecniExpres, toggleCamps, toggleGallery, toggleAbout, updateCampGeneralInfo,
      uploadFile, refreshData, refreshSettings
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