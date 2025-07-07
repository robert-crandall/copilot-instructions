import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.oQWuWwpy.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/dzk7Jg2D.js","_app/immutable/chunks/dupZhlXE.js","_app/immutable/chunks/x2hAFOQ2.js","_app/immutable/chunks/DdxBX0KZ.js","_app/immutable/chunks/h5jIJnHw.js","_app/immutable/chunks/Mw_qvY5x.js"];
export const stylesheets = [];
export const fonts = [];
