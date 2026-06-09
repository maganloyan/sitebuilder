const common_site_config = require('../../../sites/common_site_config.json');
const { webserver_port, default_site } = common_site_config;

const siteName = process.env.FRAPPE_SITE || default_site || 'portalsite';

export default {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function (req) {
			// Vite dev runs on localhost; Frappe site is portalsite (not localhost).
			return `http://127.0.0.1:${webserver_port}`;
		},
		configure: (proxy) => {
			proxy.on('proxyReq', (proxyReq) => {
				proxyReq.setHeader('X-Frappe-Site-Name', siteName);
				proxyReq.setHeader('Host', `${siteName}:${webserver_port}`);
			});
		},
	},
};
