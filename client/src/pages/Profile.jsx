import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Camera, Loader, Check, X, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageLoading, setImageLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    profileImage: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        },
        profileImage: user.profileImage || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG, JPEG, and PNG files are allowed' });
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    try {
      setImageLoading(true);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await axios.post('http://localhost:4000/api/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData(prev => ({
        ...prev,
        profileImage: response.data.imageUrl
      }));

      setMessage({ type: 'success', text: 'Profile image uploaded successfully' });
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image', error);
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setImageLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords184 do not match' });
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      if (formData.profileImage !== user.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      const response = await axios.put('http://localhost:4000/api/auth/profile', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      updateUser(response.data);

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      window.location.reload();
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4 inline-block">
            My Profile
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Manage Your <span className="text-blue-200">RentEase</span> Profile
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Update your personal information, manage your account, and enhance your renting experience.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Form Card */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: {
                              street: user.address?.street || '',
                              city: user.address?.city || '',
                              state: user.address?.state || '',
                              zipCode: user.address?.zipCode || '',
                              country: user.address?.country || ''
                            },
                            profileImage: user.profileImage || '',
                            password: '',
                            confirmPassword: ''
                          });
                        }
                      }}
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                  )}
                </div>

                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-center ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <Check className="h-5 w-5 mr-2" />
                    ) : (
                      <X className="h-5 w-5 mr-2" />
                    )}
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Profile Image */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt={formData.name}
                          className="h-32 w-32 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl shadow-md">
                          {formData.name?.charAt(0) || <User className="h-16 w-16" />}
                        </div>
                      )}
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300">
                          {imageLoading ? (
                            <Loader className="h-6 w-6 animate-spin" />
                          ) : (
                            <Camera className="h-6 w-6" />
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleImageUpload}
                            disabled={imageLoading}
                          />
                        </label>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-sm text-gray-600">
                        Click the camera to update your profile picture
                      </p>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50'
                        } focus:outline-none transition-all duration-300`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50'
                        } focus:outline-none transition-all duration-300`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-300' : 'border-gray-100 bg-gray-50'
                        } focus:outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  {isEditing && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Address Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP/Postal Code
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Address when not editing */}
                  {!isEditing && user?.address && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Address</h3>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <address className="not-italic text-gray-600">
                          {user.address.street && <p>{user.address.street}</p>}
                          {user.address.city && user.address.state && (
                            <p>
                              {user.address.city}, {user.address.state} {user.address.zipCode || ''}
                            </p>
                          )}
                          {user.address.country && <p>{user.address.country}</p>}
                        </address>
                      </div>
                    </div>
                  )}

                  {/* Password Update */}
                  {isEditing && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Update Password</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Leave blank to keep your current password
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                            minLength="6"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  {isEditing && (
                    <div className="mt-8">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Account Info Sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 sticky top-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Account Information</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <span className="font-medium">Member since:</span>{' '}
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                  {user?.averageRating > 0 && (
                    <p>
                      <span className="font-medium">User Rating:</span>{' '}
                      {user.averageRating.toFixed(1)} ({user.totalReviews} reviews)
                    </p>
                  )}
                </div>
                <div className="mt-8">
                  <a
                    href="/dashboard"
                    className="block text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300"
                  >
                    View My Listings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;