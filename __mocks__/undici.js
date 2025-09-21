module.exports = {
  Request: jest.fn(() => ({})),
  Response: jest.fn(() => ({})),
  fetch: jest.fn(() => Promise.resolve({}))
};