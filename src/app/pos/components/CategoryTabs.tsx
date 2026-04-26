"use client";

import { POSCategory } from "@/types/pos";
import { POS_CATEGORIES } from "@/lib/mockProducts";
import { GridCircleDiagonalLeft,
         Cycling,
         Cog,   
         ShoppingBag,
         Spanner     
 } from "@boxicons/react";

const CATEGORY_ICONS: Record<POSCategory, React.ReactNode> = {
  Todas: <GridCircleDiagonalLeft />,
  Bicicletas: <Cycling />,
  Componentes: <Cog />,
  Accesorios: <ShoppingBag />,
  Taller: <Spanner />,
};

interface CategoryTabsProps {
  active: POSCategory;
  onChange: (cat: POSCategory) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {POS_CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer border outline-none shrink-0 ${
              isActive
                ? "bg-[#1a2e5a] text-white border-[#1a2e5a] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span className={isActive ? "text-white/80" : "text-gray-400"}>
              {CATEGORY_ICONS[cat]}
            </span>
            {cat}
          </button>
        );
      })}
    </div>
  );
}