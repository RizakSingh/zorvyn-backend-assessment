const { z } = require("zod");
const { ROLES } = require("../config/constants");

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(Object.values(ROLES)).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { updateUserSchema };
