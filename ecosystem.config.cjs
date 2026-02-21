module.exports = {
  apps: [
    {
      name: "lumiohan",
      // script: 'rm -rf .next && npm run build && npm run start',
      script: "npm run build && npm start",
      args: "",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "8G",
      log_date_format: "DD-MM-YYYY HH:mm:ss",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        HOST: "https://lumiohan.com",
        TOKENEXPIRESIN: "30d",
        BLOCK_IP: "",
        TZ: "Europe/Istanbul",
        IP: "0.0.0.0",
        PORT: 3000,
        LOGLEVEL: "info",
        NODEPUSH: true,
        NODEID: "main",
        MAINNODE: "main",
      },
    },
  ],
};
