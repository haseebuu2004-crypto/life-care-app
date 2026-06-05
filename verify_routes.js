const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index') || path.includes('../db') || path.includes('../../shared/db/connection')) {
        return { query: async () => ({ rows: [] }), pool: { connect: async () => ({}) } };
    }
    return originalRequire.apply(this, arguments);
};

const express = require('express');
const notificationsRoutes = require('./backend/features/notifications/notifications.routes');

const app = express();
app.use('/api', notificationsRoutes);

console.log("Registered Routes in notifications.routes.js:");
notificationsRoutes.stack.forEach(layer => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        const path = layer.route.path;
        console.log(`${methods} /api${path === '/' ? '' : path}`);
    }
});
