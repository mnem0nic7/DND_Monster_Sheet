# D&D Monster Sheet Editor Test Suite

This directory contains a comprehensive test suite for the D&D Monster Sheet Editor web application.

## Files

- `test-runner.html` - The main test interface that can be opened in a browser
- `test-framework.js` - The testing framework with assertions and utilities
- `basic-tests.js` - Framework verification tests 
- `calculation-tests.js` - Tests for mathematical calculations (ability modifiers, HP, AC, etc.)
- `data-management-tests.js` - Tests for data storage, loading, and persistence
- `ui-interaction-tests.js` - Tests for user interface interactions and behaviors
- `integration-tests.js` - End-to-end workflow and cross-component tests

## Running the Tests

1. Start a local web server in the project root directory:
   ```bash
   python -m http.server 8000
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/tests/test-runner.html
   ```

3. Use the test interface to:
   - Run individual tests by clicking "Run Test" buttons
   - Run all tests at once with the "Run All Tests" button
   - Expand test sections to see detailed descriptions
   - View test results and error messages

## Test Categories

### 🔧 Framework Tests
Basic verification that the testing framework itself is working correctly.

### 🧮 Calculation Functions Tests  
Tests all mathematical calculations used in D&D rules:
- Ability score modifiers
- Hit points calculation
- Armor class calculation
- Attack bonuses, saving throws, etc.

### 💾 Data Management Tests
Tests data persistence and storage:
- JSON serialization/deserialization
- LocalStorage operations
- Creature library loading
- Data validation and migration

### 🎛️ UI Interaction Tests
Tests user interface behaviors:
- Section editing functionality
- Form validation
- Modal operations
- Keyboard navigation
- Responsive design

### 🔧 Integration Tests
End-to-end workflow tests:
- Complete creature creation
- Cross-section dependencies
- Error recovery
- Import/export functionality
- Performance testing
- Accessibility compliance

## Test Framework Features

The custom test framework provides:

### Assertions
- `assertEqual(actual, expected, message)` - Test equality
- `assertNotEqual(actual, expected, message)` - Test inequality  
- `assertTrue(condition, message)` - Test true condition
- `assertFalse(condition, message)` - Test false condition
- `assertExists(value, message)` - Test that value exists (not null/undefined)
- `assertThrows(func, expectedError, message)` - Test that function throws error

### Utilities
- `createElement(tag, attributes, textContent)` - Create DOM elements for testing
- `createTestContainer()` - Create isolated test container
- `cleanupTestContainer()` - Clean up test DOM elements
- `getMockCreatureData()` - Get sample creature data for testing
- `waitForUpdate(ms)` - Wait for async operations

### Async Support
All tests support async/await for testing asynchronous operations.

## Writing New Tests

To add a new test:

1. Choose the appropriate test file (or create a new one)
2. Register your test with the framework:
   ```javascript
   TestRunner.registerTest('testName', async function() {
       // Your test code here
       TestRunner.assertEqual(actual, expected, "Test description");
   });
   ```

3. Add the test to the HTML interface in `test-runner.html`
4. Add the test ID to the `testIds` array in the `runAllTests` function

## Best Practices

- Always clean up DOM elements created during tests
- Use descriptive test names and assertion messages
- Test both success and error conditions
- Mock external dependencies when needed
- Keep tests focused and independent
- Use async/await for operations that might take time

## Troubleshooting

- Ensure the web server is running from the project root
- Check browser console for JavaScript errors
- Verify all test files are loaded in the correct order
- Make sure the main application script (script.js) loads before tests
- Use browser developer tools to debug failing tests
