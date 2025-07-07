import * as server from '../entries/pages/register/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/register/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.VTCTj8VN.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/dzk7Jg2D.js","_app/immutable/chunks/dupZhlXE.js","_app/immutable/chunks/x2hAFOQ2.js","_app/immutable/chunks/DdxBX0KZ.js","_app/immutable/chunks/jDb7IAEd.js","_app/immutable/chunks/iLG2255Q.js","_app/immutable/chunks/BnM-H2vA.js","_app/immutable/chunks/C8gFv3Qf.js","_app/immutable/chunks/COjZQ44n.js","_app/immutable/chunks/h5jIJnHw.js","_app/immutable/chunks/Mw_qvY5x.js"];
export const stylesheets = [];
export const fonts = [];
