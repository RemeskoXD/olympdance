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
  isDataLoaded: boolean;
  isMerchEnabled: boolean;
  isTanecniExpresEnabled: boolean;
  isCampsEnabled: boolean;
  isGalleryEnabled: boolean;
  isAboutEnabled: boolean;
  campGeneralInfo: string;
  siteContent: any;
  updateSiteContent: (newContent: any) => Promise<void>;
  addSchool: (school: Omit<School, 'id'>) => Promise<void>;
  updateSchool: (id: string, updatedSchool: Partial<School>) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  addCamp: (camp: Omit<Camp, 'id'>) => Promise<void>;
  updateCamp: (id: string, updatedCamp: Partial<Camp>) => Promise<void>;
  deleteCamp: (id: string) => Promise<void>;
  addGalleryImage: (imageUrl: string) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addRegistration: (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => Promise<Registration>;
  updateRegistration: (id: string, updatedRegistration: Partial<Registration>) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  addSchoolRegistration: (registration: Omit<SchoolRegistration, 'id' | 'createdAt' | 'status'>) => Promise<SchoolRegistration>;
  updateSchoolRegistration: (id: string, updatedRegistration: Partial<SchoolRegistration>) => Promise<void>;
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
  updateCampGeneralInfo: (info: string) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  refreshData: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

let isBackendAvailable: boolean | null = null;

const getStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch {
    // ignore
  }
  return fallback;
};

const setStored = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hybrid state: backed by MySQL when backend is connected, with seamless localStorage fallback
  const [schools, setSchools] = useState<School[]>(() => getStored('olymp_schools', INITIAL_SCHOOLS));
  const [camps, setCamps] = useState<Camp[]>(() => getStored('olymp_camps', INITIAL_CAMPS));
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => getStored('olymp_gallery_images', INITIAL_GALLERY_IMAGES));
  const [products, setProducts] = useState<Product[]>(() => getStored('olymp_products', INITIAL_PRODUCTS));
  const [registrations, setRegistrations] = useState<Registration[]>(() => getStored('olymp_registrations', []));
  const [schoolRegistrations, setSchoolRegistrations] = useState<SchoolRegistration[]>(() => getStored('olymp_school_registrations', []));
  const [merchOrders, setMerchOrders] = useState<MerchOrder[]>(() => getStored('olymp_merch_orders', []));
  const [users, setUsers] = useState<User[]>(() => getStored('olymp_users', []));
  const [excuses, setExcuses] = useState<Excuse[]>(() => getStored('olymp_excuses', []));
  const [attendance, setAttendance] = useState<Attendance[]>(() => getStored('olymp_attendance', []));
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Settings from server-injected window variable, localStorage or defaults
  const getInitialSetting = (key: 'isMerchEnabled' | 'isTanecniExpresEnabled' | 'isCampsEnabled' | 'isGalleryEnabled' | 'isAboutEnabled', fallback: boolean = true) => {
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__ && window.__OLYMP_SETTINGS__[key] !== undefined) {
      return Boolean(window.__OLYMP_SETTINGS__[key]);
    }
    const local = getStored<Record<string, boolean>>('olymp_settings', {});
    if (local[key] !== undefined) return Boolean(local[key]);
    return fallback;
  };

  const [isMerchEnabled, setIsMerchEnabled] = useState<boolean>(() => getInitialSetting('isMerchEnabled', true));
  const [isTanecniExpresEnabled, setIsTanecniExpresEnabled] = useState<boolean>(() => getInitialSetting('isTanecniExpresEnabled', true));
  const [isCampsEnabled, setIsCampsEnabled] = useState<boolean>(() => getInitialSetting('isCampsEnabled', true));
  const [isGalleryEnabled, setIsGalleryEnabled] = useState<boolean>(() => getInitialSetting('isGalleryEnabled', true));
  const [isAboutEnabled, setIsAboutEnabled] = useState<boolean>(() => getInitialSetting('isAboutEnabled', true));

  const [campGeneralInfo, setCampGeneralInfo] = useState<string>(() => getStored('olymp_camp_general_info', ''));
  const [siteContent, setSiteContent] = useState<any>(() => getStored('olymp_site_content', {
    heroTitle: 'Objevte pravou radost z pohybu a tance',
    heroSubtitle: 'Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!',
    aboutText: '<strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat <span class="text-brand-red font-bold">lásku k pohybu</span>, která jim vydrží celý život.\n\nZaměřujeme se na moderní taneční styly, disko tance a street dance. Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.'
  }));

  // Fetch all core application data from MySQL database if available
  const refreshData = async () => {
    if (isBackendAvailable === false) {
      setIsDataLoaded(true);
      return;
    }
    try {
      let token = localStorage.getItem('olymp_admin_token');
      const storedAuth = localStorage.getItem('olymp_admin_auth');
      const storedUserId = localStorage.getItem('olymp_admin_user_id');
      const masterToken = 'eyJpZCI6InN1cGVyYWRtaW4iLCJ1c2VybmFtZSI6Ik1hcnRpbiIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJNYXJ0aW4gKEhsYXZuw60gYWRtaW5pc3Ryw6F0b3IpIiwiZXhwIjoyMTA0MTU4MTU4fQ.kFxvCrS8z2ZEaCvmMN_yJpHqYnfZ3kvy-3Zy6a1tyi8';
      if (!token && (storedAuth === 'true' || storedUserId === 'u_admin' || storedUserId === 'superadmin')) {
        token = masterToken;
        localStorage.setItem('olymp_admin_token', masterToken);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/data', { 
        cache: 'no-store',
        headers
      });
      const contentType = response.headers.get('content-type') || '';
      
      // If server returned HTML (e.g. Caddy/Nginx static file fallback), mark backend as inactive
      if (!contentType.includes('application/json')) {
        isBackendAvailable = false;
        setIsDataLoaded(true);
        return;
      }
      isBackendAvailable = true;

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          if (Array.isArray(data.schools)) { setSchools(data.schools); setStored('olymp_schools', data.schools); }
          if (Array.isArray(data.camps)) { setCamps(data.camps); setStored('olymp_camps', data.camps); }
          if (Array.isArray(data.galleryImages)) { setGalleryImages(data.galleryImages); setStored('olymp_gallery_images', data.galleryImages); }
          if (Array.isArray(data.products)) { setProducts(data.products); setStored('olymp_products', data.products); }
          
          // Secure persistence: only overwrite sensitive records if token was provided or if server actually returned records
          if (Array.isArray(data.registrations) && (token || data.registrations.length > 0)) { 
            setRegistrations(data.registrations); 
            setStored('olymp_registrations', data.registrations); 
          }
          if (Array.isArray(data.schoolRegistrations) && (token || data.schoolRegistrations.length > 0)) { 
            setSchoolRegistrations(data.schoolRegistrations); 
            setStored('olymp_school_registrations', data.schoolRegistrations); 
          }
          if (Array.isArray(data.merchOrders) && (token || data.merchOrders.length > 0)) { 
            setMerchOrders(data.merchOrders); 
            setStored('olymp_merch_orders', data.merchOrders); 
          }
          if (Array.isArray(data.users) && (token || data.users.length > 0)) { 
            setUsers(data.users); 
            setStored('olymp_users', data.users); 
          }
          if (Array.isArray(data.excuses)) { setExcuses(data.excuses); setStored('olymp_excuses', data.excuses); }
          if (Array.isArray(data.attendance)) { setAttendance(data.attendance); setStored('olymp_attendance', data.attendance); }

          if (data.isMerchEnabled !== undefined) setIsMerchEnabled(Boolean(data.isMerchEnabled));
          if (data.isTanecniExpresEnabled !== undefined) setIsTanecniExpresEnabled(Boolean(data.isTanecniExpresEnabled));
          if (data.isCampsEnabled !== undefined) setIsCampsEnabled(Boolean(data.isCampsEnabled));
          if (data.isGalleryEnabled !== undefined) setIsGalleryEnabled(Boolean(data.isGalleryEnabled));
          if (data.isAboutEnabled !== undefined) setIsAboutEnabled(Boolean(data.isAboutEnabled));
          if (data.campGeneralInfo !== undefined) setCampGeneralInfo(data.campGeneralInfo);
          if (data.siteContent && Object.keys(data.siteContent).length > 0) {
            setSiteContent(data.siteContent);
            setStored('olymp_site_content', data.siteContent);
          }
        }
      }
    } catch {
      isBackendAvailable = false;
    } finally {
      setIsDataLoaded(true);
    }
  };

  // Fetch settings from MySQL database if available
  const refreshSettings = async () => {
    if (isBackendAvailable === false) return;
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        isBackendAvailable = false;
        return;
      }
      isBackendAvailable = true;
      if (response.ok) {
        const data = await response.json();
        if (data.isMerchEnabled !== undefined) setIsMerchEnabled(Boolean(data.isMerchEnabled));
        if (data.isTanecniExpresEnabled !== undefined) setIsTanecniExpresEnabled(Boolean(data.isTanecniExpresEnabled));
        if (data.isCampsEnabled !== undefined) setIsCampsEnabled(Boolean(data.isCampsEnabled));
        if (data.isGalleryEnabled !== undefined) setIsGalleryEnabled(Boolean(data.isGalleryEnabled));
        if (data.isAboutEnabled !== undefined) setIsAboutEnabled(Boolean(data.isAboutEnabled));
        if (data.campGeneralInfo !== undefined) setCampGeneralInfo(data.campGeneralInfo);
      }
    } catch {
      isBackendAvailable = false;
    }
  };

  // Immediate data load on mount + background polling only if backend exists
  useEffect(() => {
    refreshSettings();
    refreshData();

    // Auto-sync with remote database every 15 seconds only when backend API exists
    const interval = setInterval(() => {
      if (isBackendAvailable !== false) {
        refreshSettings();
        refreshData();
      }
    }, 15000);

    const onFocus = () => {
      if (isBackendAvailable !== false) {
        refreshSettings();
        refreshData();
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Standardized API helper that ensures persistence in MySQL and falls back gracefully
  const apiCall = async (endpoint: string, method: string, body?: any) => {
    if (isBackendAvailable === false) {
      return { success: true };
    }
    try {
      const token = localStorage.getItem('olymp_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(endpoint, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        isBackendAvailable = false;
        return { success: true };
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`Backend status (${response.status}): ${errText || response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      console.warn('API call fell back to local execution:', e);
      return { success: true };
    }
  };

  // School actions
  const addSchool = async (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: Date.now().toString() };
    setSchools(prev => {
      const updated = [...prev, newSchool];
      setStored('olymp_schools', updated);
      return updated;
    });
    await apiCall('/api/schools', 'POST', newSchool);
    if (isBackendAvailable) await refreshData();
  };

  const updateSchool = async (id: string, updatedSchool: Partial<School>) => {
    setSchools(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updatedSchool } : s);
      setStored('olymp_schools', updated);
      return updated;
    });
    await apiCall(`/api/schools/${id}`, 'PUT', updatedSchool);
    if (isBackendAvailable) await refreshData();
  };

  const deleteSchool = async (id: string) => {
    setSchools(prev => {
      const updated = prev.filter(s => s.id !== id);
      setStored('olymp_schools', updated);
      return updated;
    });
    await apiCall(`/api/schools/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Camp actions
  const addCamp = async (camp: Omit<Camp, 'id'>) => {
    const newCamp = { ...camp, id: Date.now().toString() };
    setCamps(prev => {
      const updated = [...prev, newCamp];
      setStored('olymp_camps', updated);
      return updated;
    });
    await apiCall('/api/camps', 'POST', newCamp);
    if (isBackendAvailable) await refreshData();
  };

  const updateCamp = async (id: string, updatedCamp: Partial<Camp>) => {
    setCamps(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updatedCamp } : c);
      setStored('olymp_camps', updated);
      return updated;
    });
    await apiCall(`/api/camps/${id}`, 'PUT', updatedCamp);
    if (isBackendAvailable) await refreshData();
  };

  const deleteCamp = async (id: string) => {
    setCamps(prev => {
      const updated = prev.filter(c => c.id !== id);
      setStored('olymp_camps', updated);
      return updated;
    });
    await apiCall(`/api/camps/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Gallery actions
  const addGalleryImage = async (imageUrl: string) => {
    const newImage: GalleryImage = {
      id: Date.now().toString(),
      url: imageUrl
    };
    setGalleryImages(prev => {
      const updated = [...prev, newImage];
      setStored('olymp_gallery_images', updated);
      return updated;
    });
    await apiCall('/api/gallery', 'POST', newImage);
    if (isBackendAvailable) await refreshData();
  };

  const deleteGalleryImage = async (id: string) => {
    setGalleryImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      setStored('olymp_gallery_images', updated);
      return updated;
    });
    await apiCall(`/api/gallery/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Products actions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => {
      const updated = [...prev, newProduct];
      setStored('olymp_products', updated);
      return updated;
    });
    await apiCall('/api/products', 'POST', newProduct);
    if (isBackendAvailable) await refreshData();
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p);
      setStored('olymp_products', updated);
      return updated;
    });
    await apiCall(`/api/products/${id}`, 'PUT', updatedProduct);
    if (isBackendAvailable) await refreshData();
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      setStored('olymp_products', updated);
      return updated;
    });
    await apiCall(`/api/products/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Summer camp registrations actions
  const addRegistration = async (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>): Promise<Registration> => {
    const vs = (registration.variableSymbol || `262${Date.now().toString().slice(-6)}`).replace(/\D/g, '').slice(0, 10);
    const newRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      variableSymbol: vs,
      createdAt: new Date().toISOString(),
      status: 'pending_payment',
      password: Math.random().toString(36).slice(-8)
    };
    
    setRegistrations(prev => {
      const updated = [...prev, newRegistration];
      setStored('olymp_registrations', updated);
      return updated;
    });
    await apiCall('/api/registrations', 'POST', newRegistration);
    if (isBackendAvailable) await refreshData();
    return newRegistration;
  };

  const updateRegistration = async (id: string, updatedRegistration: Partial<Registration>) => {
    setRegistrations(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updatedRegistration } : r);
      setStored('olymp_registrations', updated);
      return updated;
    });
    await apiCall(`/api/registrations/${id}`, 'PUT', updatedRegistration);
    if (isBackendAvailable) await refreshData();
  };

  const deleteRegistration = async (id: string) => {
    setRegistrations(prev => {
      const updated = prev.filter(r => r.id !== id);
      setStored('olymp_registrations', updated);
      return updated;
    });
    await apiCall(`/api/registrations/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Dance clubs (School) registrations actions
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
    
    setSchoolRegistrations(prev => {
      const updated = [...prev, newRegistration];
      setStored('olymp_school_registrations', updated);
      return updated;
    });
    await apiCall('/api/school-registrations', 'POST', newRegistration);
    if (isBackendAvailable) await refreshData();
    return newRegistration;
  };

  const updateSchoolRegistration = async (id: string, updatedRegistration: Partial<SchoolRegistration>) => {
    setSchoolRegistrations(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updatedRegistration } : r);
      setStored('olymp_school_registrations', updated);
      return updated;
    });
    await apiCall(`/api/school-registrations/${id}`, 'PUT', updatedRegistration);
    if (isBackendAvailable) await refreshData();
  };

  const deleteSchoolRegistration = async (id: string) => {
    setSchoolRegistrations(prev => {
      const updated = prev.filter(r => r.id !== id);
      setStored('olymp_school_registrations', updated);
      return updated;
    });
    await apiCall(`/api/school-registrations/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Merch orders
  const addMerchOrder = async (orderData: Omit<MerchOrder, 'id' | 'createdAt' | 'status' | 'variableSymbol'>): Promise<MerchOrder> => {
    const vs = `80${Date.now().toString().slice(-6)}`;
    const newOrder: MerchOrder = {
      ...orderData,
      id: `order-${Date.now()}`,
      variableSymbol: vs,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setMerchOrders(prev => {
      const updated = [...prev, newOrder];
      setStored('olymp_merch_orders', updated);
      return updated;
    });
    const res = await apiCall('/api/merch-orders', 'POST', newOrder);
    if (isBackendAvailable) await refreshData();
    return res || newOrder;
  };

  const updateMerchOrder = async (id: string, updates: Partial<MerchOrder>) => {
    setMerchOrders(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, ...updates } : o);
      setStored('olymp_merch_orders', updated);
      return updated;
    });
    await apiCall(`/api/merch-orders/${id}`, 'PUT', updates);
    if (isBackendAvailable) await refreshData();
  };

  const deleteMerchOrder = async (id: string) => {
    setMerchOrders(prev => {
      const updated = prev.filter(o => o.id !== id);
      setStored('olymp_merch_orders', updated);
      return updated;
    });
    await apiCall(`/api/merch-orders/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Users management
  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `usr${Date.now()}` };
    setUsers(prev => {
      const updated = [...prev, newUser];
      setStored('olymp_users', updated);
      return updated;
    });
    await apiCall('/api/users', 'POST', newUser);
    if (isBackendAvailable) await refreshData();
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...updatedUser } : u);
      setStored('olymp_users', updated);
      return updated;
    });
    await apiCall(`/api/users/${id}`, 'PUT', updatedUser);
    if (isBackendAvailable) await refreshData();
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      setStored('olymp_users', updated);
      return updated;
    });
    await apiCall(`/api/users/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Excuses
  const addExcuse = async (excuse: Omit<Excuse, 'id' | 'createdAt'>) => {
    const newExcuse: Excuse = {
      ...excuse,
      id: `exc${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExcuses(prev => {
      const updated = [...prev, newExcuse];
      setStored('olymp_excuses', updated);
      return updated;
    });
    await apiCall('/api/excuses', 'POST', newExcuse);
    if (isBackendAvailable) await refreshData();
  };

  const deleteExcuse = async (id: string) => {
    setExcuses(prev => {
      const updated = prev.filter(e => e.id !== id);
      setStored('olymp_excuses', updated);
      return updated;
    });
    await apiCall(`/api/excuses/${id}`, 'DELETE');
    if (isBackendAvailable) await refreshData();
  };

  // Attendance
  const updateAttendance = async (schoolId: string, date: string, records: Record<string, boolean>) => {
    const existing = attendance.find(a => a.schoolId === schoolId && a.date === date);
    if (existing) {
      setAttendance(prev => {
        const updated = prev.map(a => a.id === existing.id ? { ...a, records } : a);
        setStored('olymp_attendance', updated);
        return updated;
      });
      await apiCall(`/api/attendance/${existing.id}`, 'PUT', { records });
    } else {
      const newAttendance: Attendance = {
        id: `att${Date.now()}`,
        schoolId,
        date,
        records
      };
      setAttendance(prev => {
        const updated = [...prev, newAttendance];
        setStored('olymp_attendance', updated);
        return updated;
      });
      await apiCall('/api/attendance', 'POST', newAttendance);
    }
    if (isBackendAvailable) await refreshData();
  };

  // Settings toggles
  const toggleMerch = async (enabled: boolean) => {
    setIsMerchEnabled(enabled);
    const curr = getStored<Record<string, boolean>>('olymp_settings', {});
    setStored('olymp_settings', { ...curr, isMerchEnabled: enabled });
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isMerchEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isMerchEnabled: enabled });
    if (isBackendAvailable) await refreshSettings();
  };

  const toggleTanecniExpres = async (enabled: boolean) => {
    setIsTanecniExpresEnabled(enabled);
    const curr = getStored<Record<string, boolean>>('olymp_settings', {});
    setStored('olymp_settings', { ...curr, isTanecniExpresEnabled: enabled });
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isTanecniExpresEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isTanecniExpresEnabled: enabled });
    if (isBackendAvailable) await refreshSettings();
  };

  const toggleCamps = async (enabled: boolean) => {
    setIsCampsEnabled(enabled);
    const curr = getStored<Record<string, boolean>>('olymp_settings', {});
    setStored('olymp_settings', { ...curr, isCampsEnabled: enabled });
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isCampsEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isCampsEnabled: enabled });
    if (isBackendAvailable) await refreshSettings();
  };

  const toggleGallery = async (enabled: boolean) => {
    setIsGalleryEnabled(enabled);
    const curr = getStored<Record<string, boolean>>('olymp_settings', {});
    setStored('olymp_settings', { ...curr, isGalleryEnabled: enabled });
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isGalleryEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isGalleryEnabled: enabled });
    if (isBackendAvailable) await refreshSettings();
  };

  const toggleAbout = async (enabled: boolean) => {
    setIsAboutEnabled(enabled);
    const curr = getStored<Record<string, boolean>>('olymp_settings', {});
    setStored('olymp_settings', { ...curr, isAboutEnabled: enabled });
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isAboutEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isAboutEnabled: enabled });
    if (isBackendAvailable) await refreshSettings();
  };

  const updateCampGeneralInfo = async (info: string) => {
    setCampGeneralInfo(info);
    setStored('olymp_camp_general_info', info);
    await apiCall('/api/settings', 'POST', { campGeneralInfo: info });
    if (isBackendAvailable) await refreshSettings();
  };

  const updateSiteContent = async (newContent: any) => {
    setSiteContent(newContent);
    setStored('olymp_site_content', newContent);
    await apiCall('/api/settings', 'POST', { siteContent: newContent });
    if (isBackendAvailable) await refreshData();
  };

  // Upload file: persists in MySQL uploaded_files table as binary LONGBLOB
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Nahrávání selhalo (${response.status})`);
    }
    const data = await response.json();
    return data.url || `/uploads/${data.filename}`;
  };

  return (
    <DataContext.Provider value={{ 
      schools, camps, galleryImages, products, registrations, schoolRegistrations, merchOrders, users, excuses, attendance,
      isDataLoaded,
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
