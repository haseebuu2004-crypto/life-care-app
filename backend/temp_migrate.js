const prisma = require('./config/prisma');
async function run() {
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS unique_product_flavor_owner;');
        await prisma.$executeRawUnsafe('ALTER TABLE product_variants ADD CONSTRAINT unique_product_variant_attrs UNIQUE (product_id, flavor, vp, sp, owner_id);');
        console.log('Successfully updated constraints');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
