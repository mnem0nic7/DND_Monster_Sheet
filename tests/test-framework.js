/**
 * Test Framework for D&D Monster Sheet Editor
 * Provides utilities for running tests and assertions
 */

class TestFramework {
    constructor() {
        this.tests = new Map();
        this.testResults = [];
        this.currentTest = null;
    }

    // Register a test function
    registerTest(name, testFunction) {
        this.tests.set(name, testFunction);
    }

    // Run a specific test
    async runTest(testName) {
        if (!this.tests.has(testName)) {
            throw new Error(`Test "${testName}" not found`);
        }

        this.currentTest = {
            name: testName,
            assertions: [],
            passed: true,
            message: ''
        };

        try {
            await this.tests.get(testName)();
            
            const failedAssertions = this.currentTest.assertions.filter(a => !a.passed);
            if (failedAssertions.length > 0) {
                this.currentTest.passed = false;
                this.currentTest.message = `${failedAssertions.length} assertion(s) failed:\n` +
                    failedAssertions.map(a => `- ${a.message}`).join('\n');
            } else {
                this.currentTest.message = `✅ All ${this.currentTest.assertions.length} assertions passed`;
            }
        } catch (error) {
            this.currentTest.passed = false;
            this.currentTest.message = `❌ Test threw an error: ${error.message}\n${error.stack}`;
        }

        this.testResults.push({ ...this.currentTest });
        return this.currentTest;
    }

    // Assertion methods
    assertEqual(actual, expected, message = '') {
        const passed = actual === expected;
        const assertionMessage = message || `Expected ${expected}, got ${actual}`;
        
        this.currentTest.assertions.push({
            type: 'assertEqual',
            passed,
            message: assertionMessage,
            actual,
            expected
        });

        if (!passed) {
            console.warn(`❌ ${assertionMessage}`);
        }
        
        return passed;
    }

    assertNotEqual(actual, expected, message = '') {
        const passed = actual !== expected;
        const assertionMessage = message || `Expected not ${expected}, got ${actual}`;
        
        this.currentTest.assertions.push({
            type: 'assertNotEqual',
            passed,
            message: assertionMessage,
            actual,
            expected
        });

        if (!passed) {
            console.warn(`❌ ${assertionMessage}`);
        }
        
        return passed;
    }

    assertTrue(condition, message = '') {
        const passed = Boolean(condition);
        const assertionMessage = message || `Expected true, got ${condition}`;
        
        this.currentTest.assertions.push({
            type: 'assertTrue',
            passed,
            message: assertionMessage,
            condition
        });

        if (!passed) {
            console.warn(`❌ ${assertionMessage}`);
        }
        
        return passed;
    }

    assertFalse(condition, message = '') {
        const passed = !Boolean(condition);
        const assertionMessage = message || `Expected false, got ${condition}`;
        
        this.currentTest.assertions.push({
            type: 'assertFalse',
            passed,
            message: assertionMessage,
            condition
        });

        if (!passed) {
            console.warn(`❌ ${assertionMessage}`);
        }
        
        return passed;
    }

    assertExists(value, message = '') {
        const passed = value !== null && value !== undefined;
        const assertionMessage = message || `Expected value to exist, got ${value}`;
        
        this.currentTest.assertions.push({
            type: 'assertExists',
            passed,
            message: assertionMessage,
            value
        });

        if (!passed) {
            console.warn(`❌ ${assertionMessage}`);
        }
        
        return passed;
    }

    assertThrows(func, expectedError = null, message = '') {
        let passed = false;
        let thrownError = null;
        
        try {
            func();
        } catch (error) {
            thrownError = error;
            if (expectedError) {
                // Handle both constructor functions and string patterns
                if (typeof expectedError === 'function') {
                    passed = error instanceof expectedError;
                } else if (typeof expectedError === 'string') {
                    passed = error.message.includes(expectedError);
                } else {
                    passed = true; // Any error is acceptable
                }
            } else {
                passed = true; // Any error is acceptable
            }
        }
        
        const assertionMessage = message || 
            (expectedError ? `Expected to throw ${expectedError}` : 'Expected to throw an error');
        
        this.currentTest.assertions.push({
            type: 'assertThrows',
            passed,
            message: assertionMessage,
            thrownError,
            expectedError
        });

        if (!passed) {
            console.warn(`❌ ${assertionMessage}`);
        }
        
        return passed;
    }

    // Helper methods for DOM testing
    createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }

    createTestContainer() {
        const container = this.createElement('div', { id: 'test-container' });
        document.body.appendChild(container);
        return container;
    }

    cleanupTestContainer() {
        const container = document.getElementById('test-container');
        if (container) {
            container.remove();
        }
    }

    // Mock creature data for testing
    getMockCreatureData() {
        return {
            name: "Test Goblin",
            size: "Small",
            type: "humanoid",
            subtype: "goblinoid",
            alignment: "neutral evil",
            armorClass: 15,
            hitPoints: 7,
            hitDice: "2d6",
            speed: "30 ft.",
            abilities: {
                strength: 8,
                dexterity: 14,
                constitution: 10,
                intelligence: 10,
                wisdom: 8,
                charisma: 8
            },
            skills: "Stealth +6",
            senses: "darkvision 60 ft., passive Perception 9",
            languages: "Common, Goblin",
            challengeRating: "1/4",
            traits: [
                {
                    name: "Nimble Escape",
                    description: "The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
                }
            ],
            actions: [
                {
                    name: "Scimitar",
                    description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
                }
            ]
        };
    }

    // Utility to wait for DOM updates
    async waitForUpdate(ms = 10) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Clear all test results
    clearResults() {
        this.testResults = [];
    }
}

// Global test framework instance
const TestRunner = new TestFramework();

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestFramework, TestRunner };
}
