import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Camera, X } from 'lucide-react';
import axios from 'axios';

const CreateListing = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    deposit: 0,
    condition: '',
    rentalTerms: '',
    tags: '',
    images: []
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setTimeout(() => {
      navigate('/login', { state: { from: '/create-listing' } });
    }, 100);
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    e.preventDefault();
    
    if (imagePreviewUrls.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
      
      // Add to form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file]
      }));
    });
  };

  const removeImage = (index) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, upload images if any
      let imageUrls = [];
      
      if (formData.images.length > 0) {
        // In a real implementation, you would upload each image to your storage service
        // For demonstration, we'll use placeholder URLs
        imageUrls = Array(formData.images.length).fill().map((_, i) => 
          `https://placeholder.com/item${i+1}.jpg`
        );
        
        // Example of how you might upload images in a real application:
        /*
        const uploadPromises = formData.images.map(async (image) => {
          const formData = new FormData();
          formData.append('file', image);
          const response = await axios.post('/api/upload', formData);
          return response.data.imageUrl;
        });
        imageUrls = await Promise.all(uploadPromises);
        */
      }

      // Prepare tags as an array
      const tagsArray = formData.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      // Create item data object that matches the backend schema
      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : undefined,
        pricePerMonth: formData.pricePerMonth ? parseFloat(formData.pricePerMonth) : undefined,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        deposit: parseFloat(formData.deposit) || 0,
        condition: formData.condition,
        rentalTerms: formData.rentalTerms,
        tags: tagsArray,
        images: imageUrls.length > 0 ? imageUrls : ['https://placeholder.com/default-item.jpg']
      };

      // Make API request to create item
      const response = await axios.post('http://localhost:4000/api/items/', itemData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Listing created successfully!');
      navigate(`/items/${response.data._id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create listing. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 md:py-12 animate-fade-in">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">List Your Item</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <div>
                <label htmlFor="title" className="label block mb-2">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="What are you renting out?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="label block mb-2">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="tools">Tools & Equipment</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="outdoor">Outdoor & Garden</option>
                  <option value="sports">Sports & Recreation</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="clothing">Clothing & Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="label block mb-2">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input w-full min-h-[120px]"
                  placeholder="Describe your item in detail. Include condition, size, features, etc."
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="condition" className="label block mb-2">Condition</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
            
            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="pricePerDay" className="label block mb-2">Daily Rate ($)</label>
                  <input
                    type="number"
                    id="pricePerDay"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="pricePerWeek" className="label block mb-2">Weekly Rate ($)</label>
                  <input
                    type="number"
                    id="pricePerWeek"
                    name="pricePerWeek"
                    value={formData.pricePerWeek}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label htmlFor="pricePerMonth" className="label block mb-2">Monthly Rate ($)</label>
                  <input
                    type="number"
                    id="pricePerMonth"
                    name="pricePerMonth"
                    value={formData.pricePerMonth}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="deposit" className="label block mb-2">Security Deposit ($)</label>
                  <input
                    type="number"
                    id="deposit"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="label block mb-2">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Street address"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="label block mb-2">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="City"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="label block mb-2">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="State/Province"
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="label block mb-2">Zip/Postal Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Zip/Postal code"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="label block mb-2">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Country"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Additional Information</h2>
              
              <div>
                <label htmlFor="rentalTerms" className="label block mb-2">Rental Terms</label>
                <textarea
                  id="rentalTerms"
                  name="rentalTerms"
                  value={formData.rentalTerms}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Any specific terms or conditions for renting this item?"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="tags" className="label block mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="e.g. power tool, outdoor, camping"
                />
              </div>
            </div>
            
            {/* Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Images</h2>
              <p className="text-sm text-gray-500">Add up to 5 images of your item. First image will be the cover.</p>
              
              <div className="flex flex-wrap gap-4">
                {/* Image Previews */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 border rounded">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover rounded" 
                    />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {/* Add Image Button */}
                {imagePreviewUrls.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                      multiple={imagePreviewUrls.length < 4}
                    />
                    <div className="flex flex-col items-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Image</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;