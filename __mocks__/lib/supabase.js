module.exports = {
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    },
  }),
};