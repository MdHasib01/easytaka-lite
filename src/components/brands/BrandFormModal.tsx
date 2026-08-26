import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CloudinaryUploader } from '../ui/CloudinaryUploader';
import { Brand } from '../../types';
import { CheckCircle2, Plus, Wallet } from 'lucide-react';

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Brand>) => Promise<any>;
  initialBrand?: Brand | null;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialBrand,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#6366f1');
  const [totalBudget, setTotalBudget] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialBrand?.name || '');
      setDescription(initialBrand?.description || '');
      setLogoUrl(initialBrand?.logoUrl || '');
      setBrandColor(initialBrand?.brandColor || '#6366f1');
      setTotalBudget(String(initialBrand?.totalBudget ?? 0));
      setError(null);
    }
  }, [isOpen, initialBrand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Brand name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await onSubmit({
      name: name.trim(),
      description: description.trim(),
      logoUrl,
      brandColor,
      totalBudget: Number(totalBudget) || 0,
    });

    setIsSubmitting(false);

    if (res) {
      onClose();
    } else {
      setError('Failed to save brand. Please check the details and try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBrand ? 'Edit Brand' : 'Create New Brand'}
      subtitle="Define a brand's identity, color, and overall marketing budget."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CloudinaryUploader
          label="Brand Logo"
          defaultUrl={logoUrl}
          onUploadSuccess={setLogoUrl}
          folder="esytaka_brands"
        />

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Brand Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Milkimom Family"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Brand Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-11 h-10 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Total Marketing Budget
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
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
            placeholder="Short note about this brand..."
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
            leftIcon={initialBrand ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {initialBrand ? 'Save Changes' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
