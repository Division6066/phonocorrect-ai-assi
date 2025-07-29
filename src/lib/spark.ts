// Mock implementation of the Spark global API for development

interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

// Mock implementation of the global spark API
const mockSpark = {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]): string => {
    return strings.reduce((result, str, i) => {
      return result + str + (values[i] || '');
    }, '');
  },

  llm: async (prompt: string, modelName?: string, jsonMode?: boolean): Promise<string> => {
    // Mock LLM response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (jsonMode) {
      return JSON.stringify({ correction: "mock response", confidence: 0.85 });
    }
    
    // Simple mock corrections
    if (prompt.includes('fone')) {
      return 'phone';
    }
    if (prompt.includes('seperate')) {
      return 'separate';
    }
    if (prompt.includes('recieve')) {
      return 'receive';
    }
    
    return `Mock response for: ${prompt.slice(0, 50)}...`;
  },

  user: async (): Promise<UserInfo> => {
    return {
      avatarUrl: 'https://github.com/github.png',
      email: 'developer@example.com',
      id: 'mock-user-id',
      isOwner: true,
      login: 'mockuser'
    };
  },

  kv: {
    keys: async (): Promise<string[]> => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('kv:')) {
          keys.push(key.slice(3));
        }
      }
      return keys;
    },

    get: async <T>(key: string): Promise<T | undefined> => {
      try {
        const value = localStorage.getItem(`kv:${key}`);
        return value ? JSON.parse(value) : undefined;
      } catch {
        return undefined;
      }
    },

    set: async <T>(key: string, value: T): Promise<void> => {
      try {
        localStorage.setItem(`kv:${key}`, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to set KV value:', error);
      }
    },

    delete: async (key: string): Promise<void> => {
      try {
        localStorage.removeItem(`kv:${key}`);
      } catch (error) {
        console.warn('Failed to delete KV value:', error);
      }
    }
  }
};

// Add to global window object
declare global {
  interface Window {
    spark: typeof mockSpark;
  }
}

// Initialize the global spark object
if (typeof window !== 'undefined') {
  window.spark = mockSpark;
}

export default mockSpark;