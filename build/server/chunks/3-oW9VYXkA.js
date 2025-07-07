import { r as redirect } from './index2-DHSpIlkf.js';

const load = async ({ locals }) => {
  if (!locals.user) {
    redirect(302, "/login");
  }
  return {
    user: locals.user
  };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D1r4c3pk.js')).default;
const server_id = "src/routes/dashboard/+page.server.ts";
const imports = ["_app/immutable/nodes/3.oQWuWwpy.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/dzk7Jg2D.js","_app/immutable/chunks/dupZhlXE.js","_app/immutable/chunks/x2hAFOQ2.js","_app/immutable/chunks/DdxBX0KZ.js","_app/immutable/chunks/h5jIJnHw.js","_app/immutable/chunks/Mw_qvY5x.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-oW9VYXkA.js.map
