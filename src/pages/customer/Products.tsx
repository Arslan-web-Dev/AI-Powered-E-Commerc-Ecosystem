import { useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ui-custom/ProductCard";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const search = searchParams.get("search") || undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sortBy = (searchParams.get("sortBy") as any) || "newest";
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = trpc.product.list.useQuery({
    page,
    limit: 20,
    categoryId,
    search,
    minPrice,
    maxPrice,
    sortBy,
  });

  const { data: categories } = trpc.category.list.useQuery();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const activeFilters = [
    ...(categoryId ? [{ label: categories?.find(c => c.id === categoryId)?.name || "Category", key: "categoryId" }] : []),
    ...(search ? [{ label: `Search: ${search}`, key: "search" }] : []),
    ...(minPrice ? [{ label: `Min: $${minPrice}`, key: "minPrice" }] : []),
    ...(maxPrice ? [{ label: `Max: $${maxPrice}`, key: "maxPrice" }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {search ? `Search: "${search}"` : categoryId ? categories?.find(c => c.id === categoryId)?.name || "Products" : "All Products"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total ?? 0} products found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500/40"
          >
            <option value="newest">Newest</option>
            <option value="bestselling">Best Selling</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name_asc">Name: A-Z</option>
          </select>

          {/* View mode */}
          <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              <LayoutList size={18} />
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              showFilters ? "border-purple-500/40 text-purple-400 bg-purple-500/10" : "border-white/[0.08] text-gray-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20"
            >
              {filter.label}
              <button onClick={() => updateFilter(filter.key, undefined)} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            onClick={() => setSearchParams({})}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 space-y-6 overflow-hidden"
          >
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateFilter("categoryId", undefined)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryId ? "bg-purple-500/15 text-purple-400" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}`}
                >
                  All Categories
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter("categoryId", String(cat.id))}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      categoryId === cat.id ? "bg-purple-500/15 text-purple-400" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ""}
                  onChange={(e) => updateFilter("minPrice", e.target.value || undefined)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ""}
                  onChange={(e) => updateFilter("maxPrice", e.target.value || undefined)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
                />
              </div>
            </GlassCard>
          </motion.aside>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
              {[...Array(8)].map((_, i) => (
                <GlassCard key={i} className="animate-pulse">
                  <div className="aspect-square bg-white/[0.05] rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/[0.05] rounded w-3/4" />
                    <div className="h-3 bg-white/[0.05] rounded w-1/2" />
                    <div className="h-5 bg-white/[0.05] rounded w-1/4" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-400">No products found matching your criteria.</p>
            </GlassCard>
          ) : (
            <>
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                {data?.items.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => updateFilter("page", String(page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg text-sm border border-white/[0.08] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400 px-4">
                    Page {page} of {data.totalPages}
                  </span>
                  <button
                    onClick={() => updateFilter("page", String(page + 1))}
                    disabled={page >= data.totalPages}
                    className="px-4 py-2 rounded-lg text-sm border border-white/[0.08] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
