import '@testing-library/jest-dom/extend-expect';
import 'whatwg-fetch';
import { vi } from 'vitest';

// Ensure Jest can mock database calls
vi.mock('../../drizzle/pool', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
