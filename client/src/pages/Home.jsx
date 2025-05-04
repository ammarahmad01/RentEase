import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Star, CheckCircle, Calendar, Clock, ShieldCheck, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import { LoadingSpinner } from '../components/ui/loading-spinner';

const categories = [
  { name: 'Electronics', icon: '📱', slug: 'electronics' },
  { name: 'Tools', icon: '🔨', slug: 'tools' },
  { name: 'Sports', icon: '⚽', slug: 'sports' },
  { name: 'Home & Garden', icon: '🏡', slug: 'home-garden' },
  { name: 'Vehicles', icon: '🚗', slug: 'vehicles' },
  { name: 'Clothing', icon: '👕', slug: 'clothing' },
  { name: 'Party & Events', icon: '🎉', slug: 'party-events' },
  { name: 'Musical Instruments', icon: '🎸', slug: 'musical-instruments' }
];

const features = [
  {
    title: "Save Money",
    description: "Rent items for a fraction of the purchase price and keep your budget in check.",
    icon: Tag
  },
  {
    title: "Flexible Duration",
    description: "Rent for as long as you need, from one day to several months.",
    icon: Calendar
  },
  {
    title: "Fast Process",
    description: "Simple booking process gets you what you need in just a few clicks.",
    icon: Clock
  },
  {
    title: "Secure Transactions",
    description: "Safe payment processing and identity verification for peace of mind.",
    icon: ShieldCheck
  }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/items?limit=8&sortBy=rating');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured items');
        }
        
        const data = await response.json();
        setFeaturedItems(data.items || []);
      } catch (error) {
        console.error('Error fetching featured items:', error);
        toast.error('Failed to load featured items');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?keyword=${searchQuery}`;
    }
  };

  // Feature card component
  const FeatureCard = ({ title, description, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="font-bold text-lg mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Clean, Modern Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-white mb-10 md:mb-0">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-medium mb-4">
                The smart way to rent
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Rent Anything, <span className="text-blue-200">Anytime</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg">
                Save money and reduce waste by renting what you need instead of buying. Our platform makes it simple.
              </p>
              <form onSubmit={handleSearch} className="w-full max-w-md mb-8 relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="What would you like to rent today?"
                    className="pl-5 pr-16 py-4 w-full text-gray-800 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap gap-4">
                <Link to="/browse" className="btn px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow hover:shadow-md transition-all duration-300">
                  Browse Items
                </Link>
                <Link to="/create-listing" className="btn px-6 py-3 bg-blue-700 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300">
                  List Your Item
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-blue-700 p-6 rounded-lg shadow-2xl w-full max-w-md">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-600 rounded-lg p-4 flex items-center justify-center">
                    <span className="text-3xl">📱</span>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-4 flex items-center justify-center">
                    <span className="text-3xl">🔨</span>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-4 flex items-center justify-center">
                    <span className="text-3xl">🎸</span>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-4 flex items-center justify-center">
                    <span className="text-3xl">🚗</span>
                  </div>
                </div>
                <div className="bg-blue-600 rounded-lg p-5 text-center text-white">
                  <h3 className="font-bold text-xl mb-2">Thousands of items</h3>
                  <p className="text-blue-100">Ready to rent in your area</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section with clean cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">Our Benefits</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-gray-800">
              Why Choose RentEase
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes renting simple, affordable, and sustainable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-gray-800">Browse by Category</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect items across all categories available for rent
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/browse?category=${category.slug}`}
                className={`flex flex-col items-center justify-center p-6 rounded-lg transition-all duration-300 ${
                  activeCategory === category.slug 
                  ? 'bg-blue-50 shadow-sm' 
                  : 'bg-white hover:bg-blue-50'
                } hover:shadow border border-gray-100`}
                onMouseEnter={() => setActiveCategory(category.slug)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="text-4xl mb-3">
                  {category.icon}
                </div>
                <span className="text-base font-medium text-gray-800">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured items section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">Popular Rentals</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3 text-gray-800">Featured Items</h2>
              <div className="w-16 h-1 bg-blue-600 md:mx-0 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Discover our most popular and high-rated rental items
              </p>
            </div>
            <Link to="/browse" className="hidden md:flex items-center text-blue-600 font-medium border border-blue-200 px-5 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 mt-6 md:mt-0">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Link 
                  key={item._id}
                  to={`/items/${item._id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <div className="aspect-w-3 aspect-h-2 bg-gray-100 relative overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {item.condition && (
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                        {item.condition}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg text-blue-600">
                        {formatCurrency(item.pricePerDay)}<span className="text-gray-500 text-sm font-normal">/day</span>
                      </p>
                      {item.averageRating > 0 && (
                        <div className="flex items-center bg-blue-50 rounded-md px-2 py-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{item.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-6">No featured items found</p>
              <Link to="/browse" className="btn bg-blue-600 text-white px-6 py-2 rounded-lg">
                Browse All Items
              </Link>
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/browse" className="btn bg-blue-600 text-white px-6 py-2 rounded-lg">
              View All Items
            </Link>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-gray-800">How RentEase Works</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Renting items has never been easier. Follow these simple steps to get started.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Line connector (desktop only) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-blue-200" style={{ width: '70%', margin: '0 auto' }}></div>
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative z-10">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Find What You Need</h3>
              <p className="text-gray-600 text-center">
                Browse thousands of items available for rent in your area. Filter by category, price, and more.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative z-10">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Book and Pay</h3>
              <p className="text-gray-600 text-center">
                Select your rental dates, send a request to the owner, and pay securely through our platform.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative z-10">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Pick Up and Return</h3>
              <p className="text-gray-600 text-center">
                Coordinate with the owner to pick up the item, enjoy your rental, and return it when you're done.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/register" className="btn bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-gray-800">What Our Users Say</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who are saving money and reducing waste through RentEase
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "I saved over $500 by renting a pressure washer instead of buying one for a single weekend project. The process was seamless and the owner was very helpful."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                  JD
                </div>
                <div>
                  <p className="font-bold text-gray-800">John Doe</p>
                  <p className="text-gray-600 text-sm">Renter in Boston</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "I've made over $1,200 in the past three months renting out my camping gear that was just sitting in my garage. It's been an amazing side income!"
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                  JS
                </div>
                <div>
                  <p className="font-bold text-gray-800">Jane Smith</p>
                  <p className="text-gray-600 text-sm">Owner in Chicago</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "As a college student, I was able to rent a professional camera for my photography class instead of buying one. Saved me hundreds and the quality was perfect."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                  RB
                </div>
                <div>
                  <p className="font-bold text-gray-800">Robert Brown</p>
                  <p className="text-gray-600 text-sm">Student in Austin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start renting?</h2>
          <p className="text-lg max-w-xl mx-auto mb-8 text-blue-100">
            Join our community of renters and owners today. Save money, reduce waste, and make the most of your possessions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium">
              Sign Up Now
            </Link>
            <Link to="/browse" className="btn bg-blue-700 text-white hover:bg-blue-800 px-6 py-3 rounded-lg font-medium">
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;