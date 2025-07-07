import { r as redirect } from "../../../chunks/index2.js";
import { d as deleteSession } from "../../../chunks/auth.js";
const actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      await deleteSession(locals.session.id);
    }
    cookies.delete("session", { path: "/" });
    redirect(302, "/");
  }
};
export {
  actions
};
