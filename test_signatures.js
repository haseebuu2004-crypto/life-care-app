const db = require('./backend/shared/db/connection');
const auth = require('./backend/shared/middleware/auth');
const ownerScope = require('./backend/shared/middleware/ownerScope');
const currency = require('./backend/shared/utils/currency');
const audit = require('./backend/shared/utils/audit');

console.log("DB Test: query function type:", typeof db.query, "pool type:", typeof db.pool);
console.log("Auth Test: authenticateToken type:", typeof auth.authenticateToken);
console.log("Owner Scope Test: getOwnerId type:", typeof ownerScope.getOwnerId);
console.log("Currency Test: formatRupees type:", typeof currency.formatRupees, "| Test:", currency.formatRupees(1500));
console.log("Currency Test: rupeesToPaise type:", typeof currency.rupeesToPaise, "| Test:", currency.rupeesToPaise(15.00));
console.log("Audit Test: logAction type:", typeof audit.logAction);
