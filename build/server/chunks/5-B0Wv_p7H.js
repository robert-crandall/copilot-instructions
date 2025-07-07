import { r as redirect } from './index2-DHSpIlkf.js';
import { d as deleteSession } from './auth-cKT9vkjt.js';
import '@node-rs/argon2';
import 'nanoid';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import './shared-server-BfUoNEXY.js';
import 'drizzle-orm';

const actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      await deleteSession(locals.session.id);
    }
    cookies.delete("session", { path: "/" });
    redirect(302, "/");
  }
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions
});

const index = 5;
const server_id = "src/routes/logout/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

export { fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-B0Wv_p7H.js.map
