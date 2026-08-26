import React from 'react';
import { Brand, Product } from '../../types';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Edit2, Trash2, PlusCircle, Package, Wallet } from 'lucide-react';

interface BrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
  onAddProduct: (brand: Brand) => void;
  onEditProduct: (brand: Brand, product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  onEdit,
  onDelete,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const products = brand.products || [];
  const allocatedBudget = brand.allocatedBudget ?? products.reduce((s, p) => s + (p.budget || 0), 0);
  const allocatedPct = brand.totalBudget > 0 ? Math.min(100, Math.round((allocatedBudget / brand.totalBudget) * 100)) : 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border p-1.5"
            style={{ backgroundColor: `${brand.brandColor}22`, borderColor: `${brand.brandColor}55` }}
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-lg font-extrabold" style={{ color: brand.brandColor }}>
                {brand.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base truncate">{brand.name}</h4>
            {brand.description && (
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{brand.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(brand)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit brand"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(brand._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Archive brand"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Budget Split */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Budget Split
          </span>
          <span className="text-slate-300 font-semibold">
            {allocatedBudget} / {brand.totalBudget}
          </span>
        </div>
        <ProgressBar progress={allocatedPct} showPercentage={false} size="sm" />
        <div className="text-[11px] text-slate-500">
          {Math.max(0, brand.totalBudget - allocatedBudget)} remaining to allocate
        </div>
      </div>

      {/* Products */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Products ({products.length})
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddProduct(brand)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-xl">
            No products yet. Add one to split this brand's budget.
          </div>
        ) : (
          <div className="space-y-1.5">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border p-1"
                    style={{ backgroundColor: `${product.productColor}22`, borderColor: `${product.productColor}55` }}
                  >
                    {product.productImageUrl ? (
                      <img src={product.productImageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: product.productColor }}>
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-400">Budget: {product.budget}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEditProduct(brand, product)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
