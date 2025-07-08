/**
 * Debug Tests - Check what functions are actually available
 */

TestRunner.registerTest('debugAvailableFunctions', async function() {
    // List all functions that start with common prefixes
    const functionPrefixes = ['calculate', 'update', 'save', 'load', 'create', 'edit', 'validate', 'show', 'hide', 'open', 'close'];
    const availableFunctions = [];
    
    functionPrefixes.forEach(prefix => {
        Object.getOwnPropertyNames(window).forEach(name => {
            if (name.startsWith(prefix) && typeof window[name] === 'function') {
                availableFunctions.push(name);
            }
        });
    });
    
    TestRunner.assertTrue(availableFunctions.length > 0, 
        `Found ${availableFunctions.length} functions: ${availableFunctions.join(', ')}`);
    
    // Check for specific expected functions
    const expectedFunctions = ['calculateModifier', 'updateAbilityModifiers', 'calculateHitPoints', 'updateArmorClassField'];
    expectedFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        TestRunner.assertTrue(exists, `${funcName} should exist and be a function`);
    });
    
    // Report all available functions for debugging
    console.log('Available functions:', availableFunctions);
});

// Debug calculateModifier behavior
TestRunner.registerTest('debugCalculateModifier', async function() {
    if (typeof calculateModifier !== 'undefined') {
        const nullResult = calculateModifier(null);
        console.log('calculateModifier(null) =', nullResult, 'isNaN:', isNaN(nullResult));
        
        const undefinedResult = calculateModifier(undefined);
        console.log('calculateModifier(undefined) =', undefinedResult, 'isNaN:', isNaN(undefinedResult));
        
        const stringResult = calculateModifier("test");
        console.log('calculateModifier("test") =', stringResult, 'isNaN:', isNaN(stringResult));
        
        TestRunner.assertTrue(true, `Debug info logged to console`);
    } else {
        TestRunner.assertTrue(true, "calculateModifier function not found");
    }
});
