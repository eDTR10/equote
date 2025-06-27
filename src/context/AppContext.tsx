import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from '../plugin/axios'; // Adjust the import path as necessary

// Define types
export type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'select';

export interface CustomField {
  id: number;
  name: string;
  type: FieldType;
  required: boolean;
  enabled: boolean;
}

export interface Entity {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customFields: CustomField[];
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Quotation {
  id: string;
  entityId: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  isPaid: boolean;
  paymentDate?: string;
  paymentReference?: string;
  customValues: Record<string, any>;
}

interface PaymentDetails {
  isPaid: boolean;
  paymentDate?: string;
  paymentReference?: string;
}

interface AppContextType {
  // Entities
  entities: Entity[];
  addEntity: (entity: Omit<Entity, 'id'>) => Promise<void>;
  updateEntity: (entity: Entity) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  getEntityById: (id: string) => Entity | undefined;

  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id'>) => Promise<void>;
  updateQuotation: (quotation: Quotation) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  updateQuotationPaymentStatus: (id: string, paymentDetails: PaymentDetails) => Promise<void>;
  getQuotationsByEntityId: (entityId: string) => Quotation[];

  // Utils
  getNextQuotationNumber: () => string;

  // Loading states
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// API base URL
const API_URL = axios.defaults.baseURL; // Replace with your actual API URL

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

// Provider component
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // State management
  const [entities, setEntities] = useState<Entity[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch entities
        const entitiesResponse = await axios.get(`${API_URL}/quotation/entities/`);
        setEntities(entitiesResponse.data);

        // Fetch quotations
        const quotationsResponse = await axios.get(`${API_URL}/quotation/`);
        setQuotations(quotationsResponse.data);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');

        // For development/demo purposes: Initialize with empty arrays if API fails
        setEntities([]);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Entity CRUD operations
  const addEntity = async (entity: Omit<Entity, 'id'>) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/entities`, entity);
      const newEntity: Entity = response.data;
      setEntities([...entities, newEntity]);
      setError(null);
    } catch (err) {
      console.error('Error adding entity:', err);
      setError('Failed to add entity. Please try again.');

      // For development/demo: Add locally if API fails
      const newEntity: Entity = {
        ...entity,
        id: `e${Date.now()}`,
      };
      setEntities([...entities, newEntity]);
    } finally {
      setLoading(false);
    }
  };

  const updateEntity = async (updatedEntity: Entity) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/entities/${updatedEntity.id}`, updatedEntity);
      setEntities(entities.map(entity =>
        entity.id === updatedEntity.id ? updatedEntity : entity
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating entity:', err);
      setError('Failed to update entity. Please try again.');

      // Update locally anyway for better UX
      setEntities(entities.map(entity =>
        entity.id === updatedEntity.id ? updatedEntity : entity
      ));
    } finally {
      setLoading(false);
    }
  };

  const deleteEntity = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/entities/${id}`);
      setEntities(entities.filter(entity => entity.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting entity:', err);
      setError('Failed to delete entity. Please try again.');

      // Delete locally anyway for better UX
      setEntities(entities.filter(entity => entity.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const getEntityById = (id: string) => {
    return entities.find(entity => entity.id === id);
  };

  // Quotation CRUD operations
  const addQuotation = async (quotation: Omit<Quotation, 'id'>) => {
    setLoading(true);
    try {
      // Ensure quotation number is unique by adding timestamp if missing
      if (!quotation.quotationNumber.includes('-')) {
        const timestamp = new Date().getTime().toString().slice(-5);
        quotation = {
          ...quotation,
          quotationNumber: `${quotation.quotationNumber}-${timestamp}`
        };
      }

      const response = await axios.post(`${API_URL}/quotation/`, quotation);
      const newQuotation: Quotation = response.data;
      setQuotations([...quotations, newQuotation]);
      setError(null);
    } catch (err) {
      console.error('Error adding quotation:', err);
      setError('Failed to add quotation. Please try again.');

      // For development/demo: Add locally if API fails
      const newQuotation: Quotation = {
        ...quotation,
        id: `q${Date.now()}`,
      };
      setQuotations([...quotations, newQuotation]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuotation = async (updatedQuotation: Quotation) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/quotations/${updatedQuotation.id}`, updatedQuotation);
      setQuotations(quotations.map(quotation =>
        quotation.id === updatedQuotation.id ? updatedQuotation : quotation
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating quotation:', err);
      setError('Failed to update quotation. Please try again.');

      // Update locally anyway for better UX
      setQuotations(quotations.map(quotation =>
        quotation.id === updatedQuotation.id ? updatedQuotation : quotation
      ));
    } finally {
      setLoading(false);
    }
  };

  const deleteQuotation = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/quotations/${id}`);
      setQuotations(quotations.filter(quotation => quotation.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting quotation:', err);
      setError('Failed to delete quotation. Please try again.');

      // Delete locally anyway for better UX
      setQuotations(quotations.filter(quotation => quotation.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const updateQuotationPaymentStatus = async (id: string, paymentDetails: PaymentDetails) => {
    setLoading(true);
    try {
      // Format the request payload according to the API requirements
      const payload = {
        status: paymentDetails.isPaid ? 'paid' : 'pending',
        is_paid: paymentDetails.isPaid,
        payment_date: paymentDetails.isPaid ? (paymentDetails.paymentDate || new Date().toISOString().split('T')[0]) : null,
        payment_reference: paymentDetails.isPaid ? (paymentDetails.paymentReference || `PAYMENT-${new Date().getFullYear()}-${id}`) : null
      };

      await axios.patch(`${API_URL}/quotation/${id}/`, payload);

      // Update local state
      setQuotations(quotations.map(quotation =>
        quotation.id === id ? {
          ...quotation,
          isPaid: paymentDetails.isPaid,
          paymentDate: paymentDetails.paymentDate,
          paymentReference: paymentDetails.paymentReference,
          status: paymentDetails.isPaid ? 'paid' : 'pending' // Set to paid if paid, pending if not
        } : quotation
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status. Please try again.');

      // Update locally anyway for better UX
      setQuotations(quotations.map(quotation =>
        quotation.id === id ? {
          ...quotation,
          isPaid: paymentDetails.isPaid,
          paymentDate: paymentDetails.paymentDate,
          paymentReference: paymentDetails.paymentReference
        } : quotation
      ));
    } finally {
      setLoading(false);
    }
  };

  const getQuotationsByEntityId = (entityId: string) => {
    return quotations.filter(quotation => quotation.entityId === entityId);
  };

  // Utility functions
  const getNextQuotationNumber = () => {
    const currentYear = new Date().getFullYear();
    const prefix = `Q-${currentYear}-`;

    // Find the highest quotation number
    let maxNumber = 0;
    quotations.forEach(quotation => {
      if (quotation.quotationNumber?.startsWith(prefix)) {
        // Extract base number without any timestamp suffix
        const fullNumber = quotation.quotationNumber.substring(prefix.length);
        const baseNumber = fullNumber.split('-')[0]; // Get part before any timestamp
        const num = parseInt(baseNumber, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // Generate next number with leading zeros
    const nextNumber = String(maxNumber + 1).padStart(4, '0');

    // Add timestamp to ensure uniqueness
    const timestamp = new Date().getTime().toString().slice(-5);

    // Return the unique quotation number
    return `${prefix}${nextNumber}-${timestamp}`;
  };

  const value: AppContextType = {
    entities,
    addEntity,
    updateEntity,
    deleteEntity,
    getEntityById,

    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    updateQuotationPaymentStatus,
    getQuotationsByEntityId,

    getNextQuotationNumber,

    loading,
    error
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};