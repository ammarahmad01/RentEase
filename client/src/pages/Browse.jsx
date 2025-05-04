import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Calendar,
  Filter,
  X,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/ui/loading-spinner";

const categories = [
  { name: "All Categories", slug: "", icon: "🔍" },
  { name: "Electronics", slug: "electronics", icon: "📱" },
  { name: "Tools", slug: "tools", icon: "🔨" },
  { name: "Sports", slug: "sports", icon: "⚽" },
  { name: "Home & Garden", slug: "home-garden", icon: "🏡" },
  { name: "Vehicles", slug: "vehicles", icon: "🚗" },
  { name: "Clothing", slug: "clothing", icon: "👕" },
  { name: "Party & Events", slug: "party-events", icon: "🎉" },
  { name: "Musical Instruments", slug: "musical-instruments", icon: "🎸" },
];

const conditions = [
  { label: "Any Condition", value: "" },
  { label: "New", value: "new" },
  { label: "Like New", value: "like-new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
];

const sortOptions = [
  { label: "Newest", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Popularity", value: "popularity" },
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [condition, setCondition] = useState(
    searchParams.get("condition") || ""
  );
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  // Mobile filter visibility
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("items"); // 'items' or 'map'

  // Fetch items on initial load and when filters change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        // Build query string from filters
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (category) params.append("category", category);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (location) params.append("location", location);
        if (condition) params.append("condition", condition);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (sortBy) params.append("sortBy", sortBy);

        // Add pagination
        params.append("page", currentPage);
        params.append("limit", 12);

        const response = await fetch(`/api/items?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await response.json();
        setItems(data.items || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.pages || 1);
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [
    currentPage,
    keyword,
    category,
    minPrice,
    maxPrice,
    location,
    condition,
    startDate,
    endDate,
    sortBy,
  ]);

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (keyword) params.append("keyword", keyword);
    if (category) params.append("category", category);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (location) params.append("location", location);
    if (condition) params.append("condition", condition);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (sortBy) params.append("sortBy", sortBy);
    if (currentPage > 1) params.append("page", currentPage);

    setSearchParams(params);
  }, [
    keyword,
    category,
    minPrice,
    maxPrice,
    location,
    condition,
    startDate,
    endDate,
    sortBy,
    currentPage,
    setSearchParams,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
    setMobileFiltersOpen(false); // Close mobile filters
  };

  const clearFilters = () => {
    setKeyword("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setCondition("");
    setStartDate("");
    setEndDate("");
    setSortBy("");
    setCurrentPage(1);
  };

  const handleCategoryClick = (slug) => {
    setCategory(slug);
    handleFilterChange();
  };

  const hasActiveFilters =
    keyword ||
    category ||
    minPrice ||
    maxPrice ||
    location ||
    condition ||
    startDate ||
    endDate ||
    sortBy;

  // Get current category object
  const currentCategory =
    categories.find((cat) => cat.slug === category) || categories[0];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {category
              ? `${currentCategory.name} for Rent`
              : "Browse Items for Rent"}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            {category
              ? `Discover high-quality ${currentCategory.name.toLowerCase()} available for rent in your area`
              : "Find exactly what you need, when you need it, without the commitment of buying"}
          </p>

          {/* Main search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex rounded-lg shadow-lg overflow-hidden">
              <input
                type="text"
                placeholder="What are you looking for today?"
                className="flex-1 py-4 px-6 outline-none text-gray-700 bg-white"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-6 hover:bg-blue-50 transition-colors border-l border-gray-100"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category pills */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center overflow-x-auto pb-2 gap-2 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex items-center whitespace-nowrap px-4 py-2 rounded-full border ${
                  category === cat.slug
                    ? "bg-blue-50 border-blue-200 text-blue-600 font-medium"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                } transition-colors`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Filter and Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="text-blue-600 text-sm font-medium hover:underline"
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Condition</h3>
                <div className="space-y-2">
                  {conditions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        id={`condition-desktop-${option.value}`}
                        name="condition-desktop"
                        className="h-4 w-4 text-blue-600"
                        checked={condition === option.value}
                        onChange={() => {
                          setCondition(option.value);
                          handleFilterChange();
                        }}
                      />
                      <label
                        htmlFor={`condition-desktop-${option.value}`}
                        className="ml-2 text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="minPrice-desktop"
                      className="text-sm text-gray-600 mb-1 block"
                    >
                      Min
                    </label>
                    <input
                      type="number"
                      id="minPrice-desktop"
                      placeholder="$0"
                      className="input py-2 px-3 w-full text-sm"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="maxPrice-desktop"
                      className="text-sm text-gray-600 mb-1 block"
                    >
                      Max
                    </label>
                    <input
                      type="number"
                      id="maxPrice-desktop"
                      placeholder="$1000"
                      className="input py-2 px-3 w-full text-sm"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Location</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="City or country"
                    className="input py-2 px-3 pr-10 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Date range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Date Range</h3>
                <div className="space-y-2">
                  <div>
                    <label
                      htmlFor="startDate-desktop"
                      className="text-sm text-gray-600 mb-1 block"
                    >
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="startDate-desktop"
                        className="input py-2 px-3 pr-10 w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="endDate-desktop"
                      className="text-sm text-gray-600 mb-1 block"
                    >
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="endDate-desktop"
                        className="input py-2 px-3 pr-10 w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={
                          startDate || new Date().toISOString().split("T")[0]
                        }
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFilterChange}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Sort and Layout Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <div className="text-sm text-gray-600">
                    {totalItems > 0 && (
                      <span>
                        Showing <strong>{items.length}</strong> of{" "}
                        <strong>{totalItems}</strong> items
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {mobileFiltersOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <div className="flex-1 sm:flex-none">
                    <select
                      className="w-full sm:w-auto border border-gray-200 rounded-md py-2 pl-3 pr-8 text-gray-700 focus:outline-none"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View toggle */}
                  <div className="hidden sm:flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <button
                      className={`px-3 py-2 ${
                        activeTab === "items"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-white text-gray-700"
                      }`}
                      onClick={() => setActiveTab("items")}
                    >
                      Grid
                    </button>
                    <button
                      className={`px-3 py-2 ${
                        activeTab === "map"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-white text-gray-700"
                      }`}
                      onClick={() => setActiveTab("map")}
                    >
                      Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile filters panel */}
              {mobileFiltersOpen && (
                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label
                        htmlFor="category-mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="category-mobile"
                        className="input py-2 w-full"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          handleFilterChange();
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Condition */}
                    <div>
                      <label
                        htmlFor="condition-mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Condition
                      </label>
                      <select
                        id="condition-mobile"
                        className="input py-2 w-full"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                      >
                        {conditions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="input py-2 w-full"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          min="0"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="input py-2 w-full"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="location-mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location-mobile"
                        placeholder="City or country"
                        className="input py-2 w-full"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    {/* Date range */}
                    <div>
                      <label
                        htmlFor="startDate-mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate-mobile"
                        className="input py-2 w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endDate-mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate-mobile"
                        className="input py-2 w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={
                          startDate || new Date().toISOString().split("T")[0]
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                        onClick={clearFilters}
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                      onClick={handleFilterChange}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Display */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-20 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : items.length > 0 ? (
              <>
                {activeTab === "items" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <Link
                        key={item._id}
                        to={`/items/${item._id}`}
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group flex flex-col"
                      >
                        <div className="aspect-w-3 aspect-h-2 bg-gray-100 relative overflow-hidden">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          {item.condition && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                              {item.condition}
                            </span>
                          )}
                          {item.isAvailable === false && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                              <span className="text-white font-medium px-3 py-1 rounded-md border border-white">
                                Currently Rented
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-auto">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-lg text-blue-600">
                                {formatCurrency(item.pricePerDay)}
                                <span className="text-gray-500 text-sm font-normal">
                                  /day
                                </span>
                              </p>
                              {item.averageRating > 0 && (
                                <div className="flex items-center bg-blue-50 rounded-md px-2 py-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="text-sm font-medium">
                                    {item.averageRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {item.location && item.location.city && (
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {item.location.city}, {item.location.country}
                                </span>
                              </div>
                            )}

                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 2 && (
                                  <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                    +{item.tags.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  // Placeholder for map view
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">
                        Map view is coming soon
                      </p>
                      <button
                        onClick={() => setActiveTab("items")}
                        className="text-blue-600 underline"
                      >
                        Return to grid view
                      </button>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <button
                        className="px-4 py-2 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50 disabled:hover:bg-white"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show current page, first, last, and pages around current
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              className={`w-10 h-10 ${
                                currentPage === pageNumber
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                        // Show ellipsis between first and current range
                        if (pageNumber === 2 && currentPage > 3) {
                          return (
                            <span
                              key={pageNumber}
                              className="flex items-center justify-center w-10 h-10 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        // Show ellipsis between current range and last
                        if (
                          pageNumber === totalPages - 1 &&
                          currentPage < totalPages - 2
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="flex items-center justify-center w-10 h-10 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        className="px-4 py-2 hover:bg-gray-50 border-l border-gray-200 disabled:opacity-50 disabled:hover:bg-white"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
                <h3 className="text-xl font-medium mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search filters or browse all available
                  items.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured sections or categories could go here */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Popular Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.slice(1, 6).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                How does renting work?
              </h3>
              <p className="text-gray-600">
                Browse items, select your rental dates, and request a booking.
                Once approved by the owner, you can arrange pickup or delivery
                of the item.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                Is there a security deposit?
              </h3>
              <p className="text-gray-600">
                Security deposits are set by individual owners. You can see the
                deposit amount on each item's listing page before booking.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                What if an item gets damaged?
              </h3>
              <p className="text-gray-600">
                All rentals include basic protection coverage. For additional
                peace of mind, you can purchase extra protection during
                checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
