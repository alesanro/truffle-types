module.exports = {
  roots: ["./src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "src/__tests__/.*\\.(test|spec)?\\.(ts|tsx)$"
};
