module.exports = {
	apps: [{
		name: 'amonify',
		// script: 'rm -rf .next && npm run build && npm run start',
		script: 'pnpm build && pnpm start',
		args: '',
		instances: 1,
		autorestart: true,
		watch: false,
		max_memory_restart: '8G',
		log_date_format: 'DD-MM-YYYY HH:mm:ss',
		env: {
			NODE_ENV: 'development'
		},
		env_production: {
			NODE_ENV: 'production',
			HOST: 'http://localhost:3005',
			TOKENEXPIRESIN: '30d',
			BLOCK_IP: '',
			TZ: 'Europe/Istanbul',
			IP: '0.0.0.0',
			PORT: 3000,
			LOGLEVEL: 'info',
			NODEPUSH: true,
			NODEID: 'main',
			MAINNODE: 'main',

		}
	}
	]
};
