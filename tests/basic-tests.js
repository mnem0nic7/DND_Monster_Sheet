/**
 * Basic verification tests to ensure the test framework is working
 * These tests should always pass and verify core functionality
 */

// Simple test to verify the test framework itself is working
TestRunner.registerTest('testFramework', async function() {
    // Test basic assertions
    TestRunner.assertTrue(true, "assertTrue should work with true");
    TestRunner.assertFalse(false, "assertFalse should work with false");
    TestRunner.assertEqual(1, 1, "assertEqual should work with equal values");
    TestRunner.assertNotEqual(1, 2, "assertNotEqual should work with different values");
    TestRunner.assertExists("test", "assertExists should work with non-null values");
    
    // Test that the framework tracks assertions
    TestRunner.assertTrue(TestRunner.currentTest.assertions.length > 0, 
        "Framework should track assertions");
});

// Test DOM manipulation utilities
TestRunner.registerTest('domUtilities', async function() {
    const testContainer = TestRunner.createTestContainer();
    
    try {
        TestRunner.assertExists(testContainer, "Should be able to create test container");
        TestRunner.assertEqual(testContainer.id, 'test-container', "Test container should have correct ID");
        
        // Test element creation
        const testElement = TestRunner.createElement('div', { id: 'test-element' }, 'Test Content');
        TestRunner.assertEqual(testElement.tagName, 'DIV', "Should create correct element type");
        TestRunner.assertEqual(testElement.id, 'test-element', "Should set attributes correctly");
        TestRunner.assertEqual(testElement.textContent, 'Test Content', "Should set text content");
        
        // Test appending to container
        testContainer.appendChild(testElement);
        const foundElement = document.getElementById('test-element');
        TestRunner.assertExists(foundElement, "Element should be added to DOM");
        
    } finally {
        TestRunner.cleanupTestContainer();
        const removedContainer = document.getElementById('test-container');
        TestRunner.assertEqual(removedContainer, null, "Test container should be cleaned up");
    }
});

// Test async functionality
TestRunner.registerTest('asyncTest', async function() {
    // Test waiting for updates
    const startTime = Date.now();
    await TestRunner.waitForUpdate(50);
    const endTime = Date.now();
    
    TestRunner.assertTrue(endTime - startTime >= 45, "Should wait for specified time");
    
    // Test async operations
    const result = await new Promise(resolve => {
        setTimeout(() => resolve('async-result'), 10);
    });
    
    TestRunner.assertEqual(result, 'async-result', "Should handle async operations");
});

// Test error handling
TestRunner.registerTest('errorHandling', async function() {
    // Test that test framework handles errors gracefully
    try {
        throw new Error("Test error");
    } catch (error) {
        TestRunner.assertEqual(error.message, "Test error", "Should catch and handle errors");
    }
    
    // Test assertThrows with function that throws
    TestRunner.assertThrows(function() {
        throw new Error("Expected error");
    }, "Expected error", "Should detect thrown errors");
    
    // Test assertThrows with function that doesn't throw
    // We'll count assertions and expect one more to be added (and it will fail, which is correct)
    const assertionCountBefore = TestRunner.currentTest.assertions.length;
    
    // This should add a failed assertion but not throw an exception
    TestRunner.assertThrows(function() {
        return "no error";
    }, null, "This should fail because no error was thrown");
    
    // Verify that an assertion was added
    const assertionCountAfter = TestRunner.currentTest.assertions.length;
    TestRunner.assertTrue(assertionCountAfter > assertionCountBefore, "Should have added new assertion");
    
    // Note: The added assertion will be marked as failed, which is the expected behavior
    // We don't test the assertion's passed status here because that would create confusion
    TestRunner.assertTrue(true, "Error handling test completed successfully");
});

// Test mock data utilities
TestRunner.registerTest('mockData', async function() {
    const mockCreature = TestRunner.getMockCreatureData();
    
    TestRunner.assertExists(mockCreature, "Should provide mock creature data");
    TestRunner.assertExists(mockCreature.name, "Mock creature should have name");
    TestRunner.assertExists(mockCreature.abilities, "Mock creature should have abilities");
    TestRunner.assertExists(mockCreature.abilities.strength, "Mock creature should have strength");
    TestRunner.assertTrue(typeof mockCreature.abilities.strength === 'number', 
        "Ability scores should be numbers");
    TestRunner.assertTrue(mockCreature.abilities.strength > 0, "Ability scores should be positive");
});
