import { r as redirect } from "../../../chunks/index2.js";
const load = async ({ locals }) => {
  if (!locals.user) {
    redirect(302, "/login");
  }
  return {
    user: locals.user
  };
};
export {
  load
};
