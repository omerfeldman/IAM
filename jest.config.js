export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'mjs'], 
  transformIgnorePatterns: [
    '/node_modules/' 
  ],
};
