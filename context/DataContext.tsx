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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All state is backed strictly by the MySQL database - NO localStorage reliance!
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [camps, setCamps] = useState<Camp[]>(INITIAL_CAMPS);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(INITIAL_GALLERY_IMAGES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [schoolRegistrations, setSchoolRegistrations] = useState<SchoolRegistration[]>([]);
  const [merchOrders, setMerchOrders] = useState<MerchOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Settings from server-injected window variable or database defaults
  const getInitialSetting = (key: 'isMerchEnabled' | 'isTanecniExpresEnabled' | 'isCampsEnabled' | 'isGalleryEnabled' | 'isAboutEnabled', fallback: boolean = true) => {
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__ && window.__OLYMP_SETTINGS__[key] !== undefined) {
      return Boolean(window.__OLYMP_SETTINGS__[key]);
    }
    return fallback;
  };

  const [isMerchEnabled, setIsMerchEnabled] = useState<boolean>(() => getInitialSetting('isMerchEnabled', true));
  const [isTanecniExpresEnabled, setIsTanecniExpresEnabled] = useState<boolean>(() => getInitialSetting('isTanecniExpresEnabled', true));
  const [isCampsEnabled, setIsCampsEnabled] = useState<boolean>(() => getInitialSetting('isCampsEnabled', true));
  const [isGalleryEnabled, setIsGalleryEnabled] = useState<boolean>(() => getInitialSetting('isGalleryEnabled', true));
  const [isAboutEnabled, setIsAboutEnabled] = useState<boolean>(() => getInitialSetting('isAboutEnabled', true));

  const [campGeneralInfo, setCampGeneralInfo] = useState<string>('');
  const [siteContent, setSiteContent] = useState<any>({
    heroTitle: 'Objevte pravou radost z pohybu a tance',
    heroSubtitle: 'Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!',
    aboutText: '<strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat <span class="text-brand-red font-bold">lásku k pohybu</span>, která jim vydrží celý život.\n\nZaměřujeme se na moderní taneční styly, disko tance a street dance. Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.'
  });

  // Fetch all core application data from MySQL database
  const refreshData = async () => {
    try {
      const response = await fetch('/api/data', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          if (Array.isArray(data.schools)) setSchools(data.schools);
          if (Array.isArray(data.camps)) setCamps(data.camps);
          if (Array.isArray(data.galleryImages)) setGalleryImages(data.galleryImages);
          if (Array.isArray(data.products)) setProducts(data.products);
          if (Array.isArray(data.registrations)) setRegistrations(data.registrations);
          if (Array.isArray(data.schoolRegistrations)) setSchoolRegistrations(data.schoolRegistrations);
          if (Array.isArray(data.merchOrders)) setMerchOrders(data.merchOrders);
          if (Array.isArray(data.users)) setUsers(data.users);
          if (Array.isArray(data.excuses)) setExcuses(data.excuses);
          if (Array.isArray(data.attendance)) setAttendance(data.attendance);

          if (data.isMerchEnabled !== undefined) setIsMerchEnabled(Boolean(data.isMerchEnabled));
          if (data.isTanecniExpresEnabled !== undefined) setIsTanecniExpresEnabled(Boolean(data.isTanecniExpresEnabled));
          if (data.isCampsEnabled !== undefined) setIsCampsEnabled(Boolean(data.isCampsEnabled));
          if (data.isGalleryEnabled !== undefined) setIsGalleryEnabled(Boolean(data.isGalleryEnabled));
          if (data.isAboutEnabled !== undefined) setIsAboutEnabled(Boolean(data.isAboutEnabled));
          if (data.campGeneralInfo !== undefined) setCampGeneralInfo(data.campGeneralInfo);
          if (data.siteContent && Object.keys(data.siteContent).length > 0) {
            setSiteContent(data.siteContent);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch data from MySQL:', error);
    } finally {
      setIsDataLoaded(true);
    }
  };

  // Fetch settings from MySQL database
  const refreshSettings = async () => {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.isMerchEnabled !== undefined) setIsMerchEnabled(Boolean(data.isMerchEnabled));
        if (data.isTanecniExpresEnabled !== undefined) setIsTanecniExpresEnabled(Boolean(data.isTanecniExpresEnabled));
        if (data.isCampsEnabled !== undefined) setIsCampsEnabled(Boolean(data.isCampsEnabled));
        if (data.isGalleryEnabled !== undefined) setIsGalleryEnabled(Boolean(data.isGalleryEnabled));
        if (data.isAboutEnabled !== undefined) setIsAboutEnabled(Boolean(data.isAboutEnabled));
        if (data.campGeneralInfo !== undefined) setCampGeneralInfo(data.campGeneralInfo);
      }
    } catch (e) {
      console.error('Failed to fetch settings from MySQL:', e);
    }
  };

  // Immediate data load on mount + background polling
  useEffect(() => {
    refreshSettings();
    refreshData();

    // Auto-sync with remote MySQL database every 15 seconds and on tab focus
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

  // Standardized API helper that ensures strict persistence in MySQL
  const apiCall = async (endpoint: string, method: string, body?: any) => {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Chyba databáze (${response.status}): ${errText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return { success: true };
  };

  // School actions
  const addSchool = async (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: Date.now().toString() };
    await apiCall('/api/schools', 'POST', newSchool);
    await refreshData();
  };

  const updateSchool = async (id: string, updatedSchool: Partial<School>) => {
    await apiCall(`/api/schools/${id}`, 'PUT', updatedSchool);
    await refreshData();
  };

  const deleteSchool = async (id: string) => {
    await apiCall(`/api/schools/${id}`, 'DELETE');
    await refreshData();
  };

  // Camp actions
  const addCamp = async (camp: Omit<Camp, 'id'>) => {
    const newCamp = { ...camp, id: Date.now().toString() };
    await apiCall('/api/camps', 'POST', newCamp);
    await refreshData();
  };

  const updateCamp = async (id: string, updatedCamp: Partial<Camp>) => {
    await apiCall(`/api/camps/${id}`, 'PUT', updatedCamp);
    await refreshData();
  };

  const deleteCamp = async (id: string) => {
    await apiCall(`/api/camps/${id}`, 'DELETE');
    await refreshData();
  };

  // Gallery actions
  const addGalleryImage = async (imageUrl: string) => {
    const newImage: GalleryImage = {
      id: Date.now().toString(),
      url: imageUrl
    };
    await apiCall('/api/gallery', 'POST', newImage);
    await refreshData();
  };

  const deleteGalleryImage = async (id: string) => {
    await apiCall(`/api/gallery/${id}`, 'DELETE');
    await refreshData();
  };

  // Products actions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    await apiCall('/api/products', 'POST', newProduct);
    await refreshData();
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    await apiCall(`/api/products/${id}`, 'PUT', updatedProduct);
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    await apiCall(`/api/products/${id}`, 'DELETE');
    await refreshData();
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
    
    await apiCall('/api/registrations', 'POST', newRegistration);
    await refreshData();
    return newRegistration;
  };

  const updateRegistration = async (id: string, updatedRegistration: Partial<Registration>) => {
    await apiCall(`/api/registrations/${id}`, 'PUT', updatedRegistration);
    await refreshData();
  };

  const deleteRegistration = async (id: string) => {
    await apiCall(`/api/registrations/${id}`, 'DELETE');
    await refreshData();
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
    
    await apiCall('/api/school-registrations', 'POST', newRegistration);
    await refreshData();
    return newRegistration;
  };

  const updateSchoolRegistration = async (id: string, updatedRegistration: Partial<SchoolRegistration>) => {
    await apiCall(`/api/school-registrations/${id}`, 'PUT', updatedRegistration);
    await refreshData();
  };

  const deleteSchoolRegistration = async (id: string) => {
    await apiCall(`/api/school-registrations/${id}`, 'DELETE');
    await refreshData();
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
    const res = await apiCall('/api/merch-orders', 'POST', newOrder);
    await refreshData();
    return res || newOrder;
  };

  const updateMerchOrder = async (id: string, updates: Partial<MerchOrder>) => {
    await apiCall(`/api/merch-orders/${id}`, 'PUT', updates);
    await refreshData();
  };

  const deleteMerchOrder = async (id: string) => {
    await apiCall(`/api/merch-orders/${id}`, 'DELETE');
    await refreshData();
  };

  // Users management
  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `usr${Date.now()}` };
    await apiCall('/api/users', 'POST', newUser);
    await refreshData();
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    await apiCall(`/api/users/${id}`, 'PUT', updatedUser);
    await refreshData();
  };

  const deleteUser = async (id: string) => {
    await apiCall(`/api/users/${id}`, 'DELETE');
    await refreshData();
  };

  // Excuses
  const addExcuse = async (excuse: Omit<Excuse, 'id' | 'createdAt'>) => {
    const newExcuse: Excuse = {
      ...excuse,
      id: `exc${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await apiCall('/api/excuses', 'POST', newExcuse);
    await refreshData();
  };

  const deleteExcuse = async (id: string) => {
    await apiCall(`/api/excuses/${id}`, 'DELETE');
    await refreshData();
  };

  // Attendance
  const updateAttendance = async (schoolId: string, date: string, records: Record<string, boolean>) => {
    const existing = attendance.find(a => a.schoolId === schoolId && a.date === date);
    if (existing) {
      await apiCall(`/api/attendance/${existing.id}`, 'PUT', { records });
    } else {
      const newAttendance: Attendance = {
        id: `att${Date.now()}`,
        schoolId,
        date,
        records
      };
      await apiCall('/api/attendance', 'POST', newAttendance);
    }
    await refreshData();
  };

  // Settings toggles in MySQL
  const toggleMerch = async (enabled: boolean) => {
    setIsMerchEnabled(enabled);
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isMerchEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isMerchEnabled: enabled });
    await refreshSettings();
  };

  const toggleTanecniExpres = async (enabled: boolean) => {
    setIsTanecniExpresEnabled(enabled);
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isTanecniExpresEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isTanecniExpresEnabled: enabled });
    await refreshSettings();
  };

  const toggleCamps = async (enabled: boolean) => {
    setIsCampsEnabled(enabled);
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isCampsEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isCampsEnabled: enabled });
    await refreshSettings();
  };

  const toggleGallery = async (enabled: boolean) => {
    setIsGalleryEnabled(enabled);
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isGalleryEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isGalleryEnabled: enabled });
    await refreshSettings();
  };

  const toggleAbout = async (enabled: boolean) => {
    setIsAboutEnabled(enabled);
    if (typeof window !== 'undefined' && window.__OLYMP_SETTINGS__) {
      window.__OLYMP_SETTINGS__.isAboutEnabled = enabled;
    }
    await apiCall('/api/settings', 'POST', { isAboutEnabled: enabled });
    await refreshSettings();
  };

  const updateCampGeneralInfo = async (info: string) => {
    setCampGeneralInfo(info);
    await apiCall('/api/settings', 'POST', { campGeneralInfo: info });
    await refreshSettings();
  };

  const updateSiteContent = async (newContent: any) => {
    setSiteContent(newContent);
    await apiCall('/api/settings', 'POST', { siteContent: newContent });
    await refreshData();
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
