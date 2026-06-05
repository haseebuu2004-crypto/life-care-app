const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(path) {
    if (path.includes('../migrations/index') || path.includes('../db')) {
        return { query: async () => ({ rows: [] }) };
    }
    return originalRequire.apply(this, arguments);
};

const express = require('express');
const customerRoutes = require('./backend/features/customers/customers.routes');

const app = express();
app.use('/api/customers', customerRoutes);

console.log("Registered Routes in customers.routes.js:");
customerRoutes.stack.forEach(layer => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        const path = layer.route.path;
        console.log(`${methods} /api/customers${path === '/' ? '' : path}`);
    }
});
