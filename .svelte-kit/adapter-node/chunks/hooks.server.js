import { v as validateSession } from "./auth.js";
const handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session");
  if (sessionId) {
    const sessionData = await validateSession(sessionId);
    if (sessionData) {
      event.locals.user = sessionData.user;
      event.locals.session = sessionData.session;
    } else {
      event.cookies.delete("session", { path: "/" });
    }
  }
  return resolve(event);
};
export {
  handle
};
