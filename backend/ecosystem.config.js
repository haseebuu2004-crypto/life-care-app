module.exports = {
  apps: [{
    name: "club-app-backend",
    script: "./server.js",
    instances: "max", // Uses all available CPU cores for clustering
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true,
  }]
};
