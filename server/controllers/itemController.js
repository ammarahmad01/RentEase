import Item from '../models/Item.js';
import User from '../models/User.js';

// @desc    Create a new item listing
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      images,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      location,
      deposit,
      condition,
      availabilityCalendar,
      specifications,
      rentalTerms,
      tags,
    } = req.body;

    // Create new item with owner being the current user
    const item = await Item.create({
      owner: req.user._id,
      title,
      description,
      category,
      images,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      location,
      deposit,
      condition,
      availabilityCalendar,
      specifications,
      rentalTerms,
      tags,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all items with filters
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    // Destructure query parameters
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      location,
      condition,
      startDate,
      endDate,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = {};

    // Search by keyword in title, description, or tags
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.pricePerDay = {};
      if (minPrice !== undefined) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Filter by location (city or country)
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
      ];
    }

    // Filter by condition
    if (condition) {
      query.condition = condition;
    }

    // Filter by availability
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      query.$and = [
        {
          $or: [
            { bookedDates: { $size: 0 } },
            {
              bookedDates: {
                $not: {
                  $elemMatch: {
                    $and: [
                      { startDate: { $lt: end } },
                      { endDate: { $gt: start } },
                    ],
                  },
                },
              },
            },
          ],
        },
        { isAvailable: true },
      ];
    }

    let sortOptions = {};
    if (sortBy === 'price_asc') {
      sortOptions = { pricePerDay: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { pricePerDay: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { averageRating: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const items = await Item.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip)
      .populate('owner', 'name email profileImage averageRating');

    const count = await Item.countDocuments(query);

    res.json({
      items,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count,
    });
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'owner',
      'name email phone profileImage averageRating totalReviews'
    );

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error in getItemById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the user is the owner of the item
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Validate required fields
    const updateData = req.body;

    // Ensure required fields are present
    const requiredFields = ['title', 'description', 'category', 'condition', 'pricePerDay'];
    for (const field of requiredFields) {
      if (!(field in updateData) || updateData[field] === undefined || updateData[field] === null) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // Validate location
    if (!updateData.location || !updateData.location.city || !updateData.location.country) {
      return res.status(400).json({ message: 'Location city and country are required' });
    }

    // Validate images (required field)
    if (!updateData.images || updateData.images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Update item fields
    const {
      title,
      description,
      category,
      images,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      location,
      deposit,
      condition,
      availabilityCalendar,
      isAvailable,
      specifications,
      rentalTerms,
      tags,
    } = updateData;

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (images) item.images = images;
    if (pricePerDay) item.pricePerDay = pricePerDay;
    if (pricePerWeek !== undefined) item.pricePerWeek = pricePerWeek;
    if (pricePerMonth !== undefined) item.pricePerMonth = pricePerMonth;
    if (location) {
      item.location = {
        ...item.location,
        ...location,
        coordinates: location.coordinates || undefined, // Ensure coordinates is either a valid object or undefined
      };
    }
    if (deposit !== undefined) item.deposit = deposit;
    if (condition) item.condition = condition;
    if (availabilityCalendar) item.availabilityCalendar = availabilityCalendar;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;
    if (specifications) item.specifications = specifications;
    if (rentalTerms) item.rentalTerms = rentalTerms;
    if (tags) item.tags = tags;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Error in updateItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the user is the owner of the item or an admin
    if (item.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Item.deleteOne({ _id: item._id }); // Replace remove() with deleteOne()
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Get user's items (listings)
// @route   GET /api/items/user/listings
// @access  Private
const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id });
    res.json(items);
  } catch (error) {
    console.error('Error in getUserItems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { createItem, getItems, getItemById, updateItem, deleteItem, getUserItems };