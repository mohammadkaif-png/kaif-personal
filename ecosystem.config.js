module.exports = {
  apps: [
    {
      name: "worker",                  // descriptive name
      script: "worker/worker.js",      // path to your worker
      instances: 1,                     // usually 1 for background worker
      exec_mode: "fork",                // fork mode for non-server script
      autorestart: true,                // restart if it crashes
      watch: false                     // set true only if you want auto reloa
    }
  ]
};
