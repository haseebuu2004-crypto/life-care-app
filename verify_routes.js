const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index') || path.includes('../db') || path.includes('../../shared/db/connection')) {
        return { query: async () => ({ rows: [] }), pool: { connect: async () => ({}) } };
    }
    return originalRequire.apply(this, arguments);
};

const express = require('express');
const dashboardRoutes = require('./backend/features/dashboard/dashboard.routes');

const app = express();
app.use('/api', dashboardRoutes);

console.log("Registered Routes in dashboard.routes.js:");
dashboardRoutes.stack.forEach(layer => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        const path = layer.route.path;
        console.log(`${methods} /api${path === '/' ? '' : path}`);
    }
});
