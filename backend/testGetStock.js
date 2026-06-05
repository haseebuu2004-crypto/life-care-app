const db = require('./db');
const stockController = require('./controllers/stockController');

async function test() {
  try {
    const ownerId = '3ab51607-4452-4941-8f3a-82de44b18ae9';
    
    // Mock req, res
    const req = { user: { owner_id: ownerId } };
    const res = {
      json: (data) => {
        console.log("getStock response:", JSON.stringify(data, null, 2));
        process.exit(0);
      },
      status: (code) => ({
        json: (data) => {
          console.error("getStock error:", code, data);
          process.exit(1);
        }
      })
    };

    await stockController.getStock(req, res);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
