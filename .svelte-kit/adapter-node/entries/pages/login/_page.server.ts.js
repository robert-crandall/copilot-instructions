import { r as redirect, f as fail } from "../../../chunks/index2.js";
import { a as authenticateUser, c as createSession } from "../../../chunks/auth.js";
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
    if (!email || !password) {
      return fail(400, {
        error: "Email and password are required",
        email
      });
    }
    try {
      const user = await authenticateUser(email, password);
      if (!user) {
        return fail(400, {
          error: "Invalid email or password",
          email
        });
      }
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
      console.error("Login error:", error);
      return fail(500, {
        error: "An error occurred during login. Please try again.",
        email
      });
    }
  }
};
export {
  actions,
  load
};
