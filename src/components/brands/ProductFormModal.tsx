import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CloudinaryUploader } from '../ui/CloudinaryUploader';
import { Brand, Product } from '../../types';
import { CheckCircle2, Plus, Wallet } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<{ success: boolean; message: string }>;
  brand: Brand | null;
  initialProduct?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  brand,
  initialProduct,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productColor, setProductColor] = useState('#8b5cf6');
  const [budget, setBudget] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialProduct?.name || '');
      setDescription(initialProduct?.description || '');
      setProductImageUrl(initialProduct?.productImageUrl || '');
      setProductColor(initialProduct?.productColor || '#8b5cf6');
      setBudget(String(initialProduct?.budget ?? 0));
      setError(null);
    }
  }, [isOpen, initialProduct]);

  if (!brand) return null;

  const siblingAllocated = (brand.products || [])
    .filter((p) => p._id !== initialProduct?._id)
    .reduce((sum, p) => sum + (p.budget || 0), 0);
  const availableToAllocate = Math.max(0, (brand.totalBudget || 0) - siblingAllocated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await onSubmit({
      name: name.trim(),
      description: description.trim(),
      productImageUrl,
      productColor,
      budget: Number(budget) || 0,
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? `Edit Product — ${brand.name}` : `New Product for ${brand.name}`}
      subtitle="Add a product line under this brand with its own color, image, and budget split."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CloudinaryUploader
          label="Product Image"
          defaultUrl={productImageUrl}
          onUploadSuccess={setProductImageUrl}
          folder="esytaka_products"
        />

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Product Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Milkimom Drops"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Product Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={productColor}
                onChange={(e) => setProductColor(e.target.value)}
                className="w-11 h-10 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
              />
              <input
                type="text"
                value={productColor}
                onChange={(e) => setProductColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span>Budget Split</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {availableToAllocate} available
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={availableToAllocate}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
              <Wallet className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Description <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Short note about this product..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isSubmitting}
            leftIcon={initialProduct ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {initialProduct ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
