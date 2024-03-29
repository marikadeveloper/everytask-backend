import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import cors from 'cors';
import express from 'express';
import { body } from 'express-validator';
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
import { importBadges } from './utils/badge';

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

// Sentry
Sentry.init({
  dsn: 'https://06a4b837855ef20f00b03ca9d98f1534@o4506950729662464.ingest.us.sentry.io/4506950733463552',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// serve the OpenAPI specification
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// always put middleware before routes
app.use(cors());
app.use(morgan('dev')); // log requests to the console
app.use(express.json()); // allows a client to send us JSON
app.use(express.urlencoded({ extended: true })); // allows a client to send us query stringsù

// Health check
app.get('/', (req, res) => {
  console.log('Hello world received a request.');
  res.status(200);
  res.json({ message: 'Hello!' });
});
// Sentry check
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

app.use('/api', protect, router);

/**
 * User routes (no auth required)
 */
app.post(
  '/register',
  body('email').exists().isString(),
  body('name').optional().isString(),
  body('password').exists().isString(),
  createNewUser,
);
app.post('/login', signIn);
app.post('/reset-password-request', sendResetPasswordEmail);
app.post('/reset-password', resetPassword);

app.post('/import-badges', importBadges);

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

export default app;
