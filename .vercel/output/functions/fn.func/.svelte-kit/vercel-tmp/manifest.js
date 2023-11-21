export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["D2-Clarity-fonts.woff","favicon.png"]),
	mimeTypes: {".woff":"font/woff",".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.f751dd83.js","app":"_app/immutable/entry/app.463a5155.js","imports":["_app/immutable/entry/start.f751dd83.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/singletons.9bd2f334.js","_app/immutable/entry/app.463a5155.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.79a65843.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
