import React, { useEffect, useState } from 'react';
import { useBrandStore } from '../stores/useBrandStore';
import { Brand, Product } from '../types';
import { BrandCard } from '../components/brands/BrandCard';
import { BrandFormModal } from '../components/brands/BrandFormModal';
import { ProductFormModal } from '../components/brands/ProductFormModal';
import { Button } from '../components/ui/Button';
import { Tags, PlusCircle } from 'lucide-react';

export const BrandsPage: React.FC = () => {
  const { brands, fetchBrands, createBrand, updateBrand, deleteBrand, createProduct, updateProduct, deleteProduct } =
    useBrandStore();

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreateBrand = () => {
    setEditingBrand(null);
    setBrandModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandModalOpen(true);
  };

  const handleBrandSubmit = async (data: Partial<Brand>) => {
    if (editingBrand) {
      return updateBrand(editingBrand._id, data);
    }
    return createBrand(data);
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Archive this brand and all of its products? This can be reversed later by support.')) return;
    await deleteBrand(id);
  };

  const handleAddProduct = (brand: Brand) => {
    setActiveBrand(brand);
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (brand: Brand, product: Product) => {
    setActiveBrand(brand);
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (data: Partial<Product>) => {
    if (!activeBrand) return { success: false, message: 'No brand selected.' };
    if (editingProduct) {
      return updateProduct(editingProduct._id, data);
    }
    return createProduct(activeBrand._id, data);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Archive this product?')) return;
    await deleteProduct(productId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Tags className="w-6 h-6 text-indigo-400" /> Brands
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {brands.length} Managed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create brands, add their products, and split marketing budget across each product line.
          </p>
        </div>

        <Button variant="glow" onClick={handleCreateBrand} leftIcon={<PlusCircle className="w-4 h-4" />}>
          New Brand
        </Button>
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-dashed border-slate-800 text-center space-y-3">
          <Tags className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">No brands yet. Create your first brand to get started.</p>
          <Button variant="glow" onClick={handleCreateBrand} leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create Brand
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <BrandCard
              key={brand._id}
              brand={brand}
              onEdit={handleEditBrand}
              onDelete={handleDeleteBrand}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      <BrandFormModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        onSubmit={handleBrandSubmit}
        initialBrand={editingBrand}
      />

      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        brand={activeBrand}
        initialProduct={editingProduct}
      />
    </div>
  );
};
