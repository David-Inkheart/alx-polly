module.exports = {
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-access-token', user: { id: 'test-user-id' } } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-access-token', user: { id: 'test-user-id' } } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({
        data: {},
        error: null,
      }),
    },
  }),
};