import { useState, useEffect } from "react";
import { X, Save, Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EditItemModal = ({ item, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    deposit: 0,
    isAvailable: true,
    rentalTerms: "",
    location: {
      city: "",
      country: "",
      coordinates: null, // Initialize coordinates as null
    },
    specifications: {},
  });

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        category: item.category || "",
        condition: item.condition || "",
        pricePerDay: item.pricePerDay || 0,
        pricePerWeek: item.pricePerWeek || 0,
        pricePerMonth: item.pricePerMonth || 0,
        deposit: item.deposit || 0,
        isAvailable: item.isAvailable !== false,
        rentalTerms: item.rentalTerms || "",
        location: {
          city: item.location?.city || "",
          country: item.location?.country || "",
          coordinates: item.location?.coordinates || null, // Ensure coordinates is null if not present
        },
        specifications: item.specifications || {},
      });

      setImages(item.images || []);
      setNewImages([]);
      setDeletedImages([]);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSpecificationChange = (key, value) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [key]: value,
      },
    });
  };

  const addSpecification = () => {
    const newSpecs = { ...formData.specifications, "": "" };
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
  };

  const removeSpecification = (keyToRemove) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[keyToRemove];
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in again.");
      return;
    }

    const uploadFormData = new FormData();
    files.forEach(file => {
      uploadFormData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:4000/api/items/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }

      const data = await response.json();
      const newImageUrls = data.imageUrls;

      const newImagePreviews = files.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        url: newImageUrls[index],
      }));

      setNewImages([...newImages, ...newImagePreviews]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Failed to upload images");
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    const removedImage = updatedImages.splice(index, 1)[0];
    setImages(updatedImages);
    setDeletedImages([...deletedImages, removedImage]);
  };

  const removeNewImage = (index) => {
    const updatedNewImages = [...newImages];
    const removed = updatedNewImages.splice(index, 1)[0];
    URL.revokeObjectURL(removed.preview);
    setNewImages(updatedNewImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const updatedImages = [
        ...images,
        ...newImages.map(img => img.url),
      ].filter(Boolean);

      const finalImages = updatedImages.filter(img => !deletedImages.includes(img));

      if (finalImages.length === 0) {
        throw new Error("At least one image is required");
      }

      const updatedFormData = {
        ...formData,
        images: finalImages,
        location: {
          city: formData.location.city || "",
          country: formData.location.country || "",
          address: formData.location.address || undefined,
          state: formData.location.state || undefined,
          zipCode: formData.location.zipCode || undefined,
          coordinates: formData.location.coordinates || undefined, // Ensure coordinates is either a valid object or undefined
        },
      };

      const response = await fetch(`http://localhost:4000/api/items/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item');
      }

      const updatedItem = await response.json();
      
      newImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      onSave(updatedItem);
      toast.success("Item updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(error.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Edit Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="label">
                    Item Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="input w-full"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="category" className="label">
                      Category*
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="condition" className="label">
                      Condition*
                    </label>
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
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2">Item is available for rent</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Pricing Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="pricePerDay" className="label">
                    Daily Rate (${formData.pricePerDay})*
                  </label>
                  <input
                    type="number"
                    id="pricePerDay"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pricePerWeek" className="label">
                    Weekly Rate (${formData.pricePerWeek})
                  </label>
                  <input
                    type="number"
                    id="pricePerWeek"
                    name="pricePerWeek"
                    value={formData.pricePerWeek}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="pricePerMonth" className="label">
                    Monthly Rate (${formData.pricePerMonth})
                  </label>
                  <input
                    type="number"
                    id="pricePerMonth"
                    name="pricePerMonth"
                    value={formData.pricePerMonth}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label htmlFor="deposit" className="label">
                    Security Deposit (${formData.deposit})
                  </label>
                  <input
                    type="number"
                    id="deposit"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location.city" className="label">
                  City*
                </label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="location.country" className="label">
                  Country*
                </label>
                <input
                  type="text"
                  id="location.country"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Specifications</h3>
              <button
                type="button"
                onClick={addSpecification}
                className="text-sm text-primary hover:underline"
              >
                + Add Specification
              </button>
            </div>

            {Object.keys(formData.specifications).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(formData.specifications).map(([key, value], index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={key}
                      placeholder="Name"
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newSpecs = Object.fromEntries(
                          Object.entries(formData.specifications).map(([k, v]) =>
                            k === key ? [newKey, v] : [k, v]
                          )
                        );
                        setFormData({
                          ...formData,
                          specifications: newSpecs,
                        });
                      }}
                      className="input w-1/3"
                    />
                    <input
                      type="text"
                      value={value}
                      placeholder="Value"
                      onChange={(e) => handleSpecificationChange(key, e.target.value)}
                      className="input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No specifications added yet.</p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Rental Terms</h3>
            <textarea
              name="rentalTerms"
              value={formData.rentalTerms}
              onChange={handleChange}
              rows="4"
              className="input w-full"
              placeholder="Describe your rental terms, policies, and any important information renters should know."
            ></textarea>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Images</h3>

            <div className="mb-4">
              <label className="btn btn-outline flex items-center justify-center gap-2 w-full">
                <Upload className="h-5 w-5" />
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img
                    src={image}
                    alt={`Item ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {newImages.map((image, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={image.preview}
                    alt={`New upload ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">New</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;