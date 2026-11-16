const runMigration = require("./migrate");

const initDatabase = async () => {
  try {
    await runMigration();
  } catch (error) {
    console.error("Gagal inisialisasi tabel database:", error.message);
  }
};

module.exports = initDatabase;
