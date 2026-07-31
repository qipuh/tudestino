// Global test setup
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'tudestino_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_DIALECT = 'mysql';

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);
