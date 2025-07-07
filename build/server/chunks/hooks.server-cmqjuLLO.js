import { v as validateSession } from './auth-cKT9vkjt.js';
import '@node-rs/argon2';
import 'nanoid';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import './shared-server-BfUoNEXY.js';
import 'drizzle-orm';

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

export { handle };
//# sourceMappingURL=hooks.server-cmqjuLLO.js.map
