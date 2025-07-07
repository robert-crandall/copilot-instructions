export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DyxwitEx.js",app:"_app/immutable/entry/app.-WeIDBSL.js",imports:["_app/immutable/entry/start.DyxwitEx.js","_app/immutable/chunks/BnM-H2vA.js","_app/immutable/chunks/C8gFv3Qf.js","_app/immutable/chunks/dupZhlXE.js","_app/immutable/chunks/x2hAFOQ2.js","_app/immutable/chunks/DdxBX0KZ.js","_app/immutable/chunks/COjZQ44n.js","_app/immutable/entry/app.-WeIDBSL.js","_app/immutable/chunks/dupZhlXE.js","_app/immutable/chunks/x2hAFOQ2.js","_app/immutable/chunks/DdxBX0KZ.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/C8gFv3Qf.js","_app/immutable/chunks/COjZQ44n.js","_app/immutable/chunks/jDb7IAEd.js","_app/immutable/chunks/Mw_qvY5x.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/logout",
				pattern: /^\/logout\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/register",
				pattern: /^\/register\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
