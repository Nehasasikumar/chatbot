// Mock API service for testing without backend
export const mockApi = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: email,
    };
    
    // Simple validation - just check if email and password exist
    if (email && password) {
      return {
        data: {
          success: true,
          token: 'mock-jwt-token-' + Date.now(),
          user: mockUser,
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  signup: async (name: string, email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation
    if (name && email && password) {
      return {
        data: {
          success: true,
          message: 'Account created successfully',
        }
      };
    } else {
      throw new Error('All fields are required');
    }
  },

  getHistory: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        success: true,
        summaries: [
          {
            id: '1',
            title: 'AI Revolution in 2024',
            url: 'https://example.com/article1',
            summary: 'This article discusses the major AI breakthroughs...',
            created_at: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            title: 'Climate Change Solutions',
            url: 'https://example.com/article2',
            summary: 'New renewable energy technologies are emerging...',
            created_at: '2024-01-14T15:45:00Z',
          },
        ]
      }
    };
  },

  summarize: async (url: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    return {
      data: {
        success: true,
        summary: `This is a mock summary for the article at ${url}. In a real implementation, this would contain the actual AI-generated summary of the article content. The summary would highlight key points, main arguments, and important conclusions from the original text.`,
        title: 'Mock Article Title',
        url: url,
        summary_id: 'mock-summary-' + Date.now(),
      }
    };
  },
};