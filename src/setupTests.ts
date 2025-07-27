import '@testing-library/jest-dom';

// Mock the global spark object for testing
global.spark = {
  llmPrompt: (strings: string[], ...values: any[]) => {
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  },
  llm: async (prompt: string) => {
    // Mock AI response for testing
    if (prompt.includes('fone')) {
      return 'phone';
    }
    if (prompt.includes('seperate')) {
      return 'separate';
    }
    return prompt;
  },
  user: async () => ({
    avatarUrl: 'https://github.com/test.png',
    email: 'test@example.com',
    id: 'test-user',
    isOwner: true,
    login: 'testuser'
  }),
  kv: {
    keys: async () => ['test-key'],
    get: async (key: string) => {
      if (key === 'test-data') return { value: 'test' };
      return undefined;
    },
    set: async (key: string, value: any) => {},
    delete: async (key: string) => {}
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});