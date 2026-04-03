const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * UserService: admin-level user management.
 * Only admins can reach these endpoints (enforced via middleware),
 * but we keep ownership/existence checks here in the service layer.
 */

const getAllUsers = async (query = {}) => {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

const updateUser = async (id, data, requestingUser) => {
  // Prevent admin from accidentally deactivating themselves
  if (
    id === requestingUser._id.toString() &&
    data.isActive === false
  ) {
    throw new AppError("You cannot deactivate your own account.", 400);
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError("User not found.", 404);
  return user;
};

const deleteUser = async (id, requestingUser) => {
  if (id === requestingUser._id.toString()) {
    throw new AppError("You cannot delete your own account.", 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError("User not found.", 404);
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
