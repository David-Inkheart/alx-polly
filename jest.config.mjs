import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/mocks/(.*)$': '<rootDir>/__mocks__/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/lib/utils$': '<rootDir>/lib/utils.ts',
    '^@/lib/supabase$': '<rootDir>/__mocks__/lib/supabase.js',
    '^next/navigation$': '<rootDir>/__mocks__/next/navigation.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^undici$': '<rootDir>/__mocks__/undici.js',
  },
  // No transform section needed, @next/jest handles SWC transpilation
};

export default createJestConfig(customJestConfig);