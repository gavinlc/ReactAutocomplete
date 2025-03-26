// Mock implementation of lodash/debounce
const debounce = jest.fn((fn, delay) => {
  // Create a mock function that will be returned
  const mockFn = jest.fn((...args) => {
    fn(...args);
  });
  
  // Add the cancel method to the mock function
  mockFn.cancel = jest.fn();
  
  // Return the mock function
  return mockFn;
});

// Make the mock function itself have a cancel method
debounce.cancel = jest.fn();

module.exports = debounce; 