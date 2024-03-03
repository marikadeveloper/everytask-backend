import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import {
  createNewUser,
  resetPassword,
  sendResetPasswordEmail,
  signIn,
} from './handlers/user';
import { protect } from './modules/auth';
import router from './router';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Everytask Backend',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
      },
      {
        url: 'https://everytask-backend.onrender.com',
      },
    ],
  },
  apis: ['./src/docs/**.**.ts'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

const app = express();

// serve the OpenAPI specification
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// always put middleware before routes
app.use(cors());
app.use(morgan('dev')); // log requests to the console
app.use(express.json()); // allows a client to send us JSON
app.use(express.urlencoded({ extended: true })); // allows a client to send us query stringsù

app.get('/', (req, res) => {
  console.log('Hello world received a request.');
  res.status(200);
  res.json({ message: 'Hello!' });
});

app.use('/api', protect, router);

app.post('/register', createNewUser);
app.post('/login', signIn);
app.post('/reset-password-request', sendResetPasswordEmail);
app.post('/reset-password', resetPassword);

app.use((err, req, res, next) => {
  if (err.type === 'auth') {
    res.status(401).json({
      message: 'Unauthorized',
    });
  } else if (err.type === 'input') {
    res.status(400).json({
      message: 'Invalid input',
      error: err.error,
    });
  } else {
    res.status(500).json({
      error: "That's on me",
    });
  }
  console.error(err.stack);
});

export default app;
