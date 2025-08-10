const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), '.user-data.json');

module.exports = async (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const userData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(userData, null, 2));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'No user data file found' }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(`Error: ${error.message}`);
  }
};
