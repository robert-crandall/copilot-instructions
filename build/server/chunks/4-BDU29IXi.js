import { f as fail, r as redirect } from './index2-DHSpIlkf.js';
import { a as authenticateUser, c as createSession } from './auth-cKT9vkjt.js';
import '@node-rs/argon2';
import 'nanoid';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import './shared-server-BfUoNEXY.js';
import 'drizzle-orm';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-XJhE-jfm.js')).default;
const server_id = "src/routes/login/+page.server.ts";
const imports = ["_app/immutable/nodes/4.Do5gZPa_.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/dzk7Jg2D.js","_app/immutable/chunks/dupZhlXE.js","_app/immutable/chunks/x2hAFOQ2.js","_app/immutable/chunks/DdxBX0KZ.js","_app/immutable/chunks/jDb7IAEd.js","_app/immutable/chunks/iLG2255Q.js","_app/immutable/chunks/BnM-H2vA.js","_app/immutable/chunks/C8gFv3Qf.js","_app/immutable/chunks/COjZQ44n.js","_app/immutable/chunks/h5jIJnHw.js","_app/immutable/chunks/Mw_qvY5x.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-BDU29IXi.js.map
