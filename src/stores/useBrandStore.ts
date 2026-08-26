import { create } from 'zustand';
import api from '../services/api';
import { Brand, Product } from '../types';

interface BrandState {
  brands: Brand[];
  products: Product[]; // Flat list across all brands, for dropdowns
  isLoading: boolean;
  error: string | null;

  fetchBrands: () => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  createBrand: (data: Partial<Brand>) => Promise<Brand | null>;
  updateBrand: (id: string, data: Partial<Brand>) => Promise<boolean>;
  deleteBrand: (id: string) => Promise<boolean>;
  createProduct: (brandId: string, data: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  updateProduct: (productId: string, data: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  deleteProduct: (productId: string) => Promise<boolean>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  products: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/brands');
      set({ brands: res.data.brands || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch brands', isLoading: false });
    }
  },

  fetchAllProducts: async () => {
    try {
      const res = await api.get('/brands/products/all');
      set({ products: res.data.products || [] });
    } catch (err) {
      console.error('Fetch all products error:', err);
    }
  },

  createBrand: async (data) => {
    try {
      const res = await api.post('/brands', data);
      const newBrand = res.data.brand;
      set((state) => ({ brands: [newBrand, ...state.brands] }));
      return newBrand;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create brand' });
      return null;
    }
  },

  updateBrand: async (id, data) => {
    try {
      const res = await api.put(`/brands/${id}`, data);
      const updated = res.data.brand;
      set((state) => ({ brands: state.brands.map((b) => (b._id === id ? updated : b)) }));
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update brand' });
      return false;
    }
  },

  deleteBrand: async (id) => {
    try {
      await api.delete(`/brands/${id}`);
      set((state) => ({ brands: state.brands.filter((b) => b._id !== id) }));
      return true;
    } catch (err) {
      return false;
    }
  },

  createProduct: async (brandId, data) => {
    try {
      const res = await api.post(`/brands/${brandId}/products`, data);
      set((state) => ({
        brands: state.brands.map((b) => (b._id === brandId ? res.data.brand : b)),
      }));
      get().fetchAllProducts();
      return { success: true, message: res.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add product';
      return { success: false, message: msg };
    }
  },

  updateProduct: async (productId, data) => {
    try {
      const res = await api.put(`/brands/products/${productId}`, data);
      set((state) => ({
        brands: state.brands.map((b) => ({
          ...b,
          products: b.products?.map((p) => (p._id === productId ? res.data.product : p)),
        })),
      }));
      get().fetchAllProducts();
      return { success: true, message: res.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update product';
      return { success: false, message: msg };
    }
  },

  deleteProduct: async (productId) => {
    try {
      await api.delete(`/brands/products/${productId}`);
      set((state) => ({
        brands: state.brands.map((b) => ({
          ...b,
          products: b.products?.filter((p) => p._id !== productId),
        })),
      }));
      get().fetchAllProducts();
      return true;
    } catch (err) {
      return false;
    }
  },
}));
