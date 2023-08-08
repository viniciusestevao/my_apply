const sql = require('mssql');

const config = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=tcp:hexagon.database.windows.net,1433;Database=ProjetoReact;Uid=hexagon;Pwd=H3x4g0n0;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;',
  options: {
    trustedConnection: true, // Pode ser alterado isso conforme necessário
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  pool,
  poolConnect,
};
