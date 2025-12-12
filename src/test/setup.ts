import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
