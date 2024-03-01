import * as dotenv from 'dotenv';
dotenv.config();

import config from './config';
import app from './server';

// Start the server
app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
