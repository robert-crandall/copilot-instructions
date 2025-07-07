import { r as redirect, f as fail } from "../../../chunks/index2.js";
import { g as getUserByEmail, b as createUser, c as createSession } from "../../../chunks/auth.js";
const load = async ({ locals }) => {
  if (locals.user) {
    redirect(302, "/dashboard");
  }
  return {};
};
const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email");
    const password = data.get("password");
    const confirmPassword = data.get("confirmPassword");
    const displayName = data.get("displayName");
    if (!email || !password || !confirmPassword || !displayName) {
      return fail(400, {
        error: "All fields are required",
        email,
        displayName
      });
    }
    if (password !== confirmPassword) {
      return fail(400, {
        error: "Passwords do not match",
        email,
        displayName
      });
    }
    if (password.length < 8) {
      return fail(400, {
        error: "Password must be at least 8 characters long",
        email,
        displayName
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: "Please enter a valid email address",
        email,
        displayName
      });
    }
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return fail(400, {
          error: "An account with this email already exists",
          email,
          displayName
        });
      }
      const user = await createUser(email, password, displayName);
      const sessionId = await createSession(user.id);
      cookies.set("session", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        // 30 days
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      });
      redirect(302, "/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      return fail(500, {
        error: "An error occurred during registration. Please try again.",
        email,
        displayName
      });
    }
  }
};
export {
  actions,
  load
};
