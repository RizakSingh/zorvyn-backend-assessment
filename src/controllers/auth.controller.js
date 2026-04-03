const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

/**
 * AuthController: thin layer — delegates to service, formats response.
 * No business logic lives here.
 */

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    sendSuccess(res, 201, "User registered successfully.", { user, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    sendSuccess(res, 200, "Login successful.", { user, token });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, 200, "Current user retrieved.", { user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
