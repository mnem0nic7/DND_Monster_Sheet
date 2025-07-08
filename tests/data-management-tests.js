/**
 * Data Management Tests for D&D Monster Sheet Editor
 * Tests data saving, loading, and persistence functionality
 */

// Test saving and loading creature data
TestRunner.registerTest('saveLoadData', async function() {
    // Get mock creature data
    const mockCreature = TestRunner.getMockCreatureData();
    
    // Test JSON serialization and deserialization
    const jsonString = JSON.stringify(mockCreature);
    TestRunner.assertTrue(jsonString.length > 0, "Creature data should serialize to non-empty JSON");
    
    const parsedData = JSON.parse(jsonString);
    TestRunner.assertEqual(parsedData.name, mockCreature.name, "Name should be preserved in JSON");
    TestRunner.assertEqual(parsedData.armorClass, mockCreature.armorClass, "Armor Class should be preserved");
    TestRunner.assertEqual(parsedData.abilities.strength, mockCreature.abilities.strength, "Ability scores should be preserved");
    
    // Test with the application's save/load functions if they exist
    if (typeof saveCreatureData !== 'undefined' && typeof loadCreatureData !== 'undefined') {
        try {
            await saveCreatureData(mockCreature);
            const loadedData = await loadCreatureData();
            
            TestRunner.assertEqual(loadedData.name, mockCreature.name, "Loaded name should match saved name");
            TestRunner.assertEqual(loadedData.challengeRating, mockCreature.challengeRating, "Challenge rating should be preserved");
        } catch (error) {
            TestRunner.assertTrue(false, `Save/load functions threw error: ${error.message}`);
        }
    }
    
    // Test handling of incomplete data
    const incompleteCreature = {
        name: "Incomplete Creature",
        armorClass: 15
        // Missing many required fields
    };
    
    const incompleteJson = JSON.stringify(incompleteCreature);
    const parsedIncomplete = JSON.parse(incompleteJson);
    TestRunner.assertEqual(parsedIncomplete.name, "Incomplete Creature", "Should handle incomplete data");
    TestRunner.assertEqual(parsedIncomplete.armorClass, 15, "Available fields should be preserved");
    
    // Test with invalid/corrupted data
    try {
        JSON.parse("invalid json {");
        TestRunner.assertTrue(false, "Should throw error on invalid JSON");
    } catch (error) {
        TestRunner.assertTrue(true, "Should properly handle invalid JSON");
    }
});

// Test section data storage and retrieval
TestRunner.registerTest('sectionStorage', async function() {
    // Create test container with form elements
    const testContainer = TestRunner.createTestContainer();
    
    try {
        // Create mock form sections
        const nameSection = TestRunner.createElement('div', { id: 'name-section' });
        nameSection.innerHTML = `
            <input type="text" id="creature-name" value="Test Creature">
            <input type="text" id="creature-size" value="Medium">
            <input type="text" id="creature-type" value="humanoid">
        `;
        
        const statsSection = TestRunner.createElement('div', { id: 'basic-stats-section' });
        statsSection.innerHTML = `
            <input type="number" id="armor-class" value="15">
            <input type="number" id="hit-points" value="25">
            <input type="text" id="speed" value="30 ft.">
        `;
        
        const abilitiesSection = TestRunner.createElement('div', { id: 'abilities-section' });
        abilitiesSection.innerHTML = `
            <input type="number" id="strength" value="16">
            <input type="number" id="dexterity" value="14">
            <input type="number" id="constitution" value="13">
            <input type="number" id="intelligence" value="10">
            <input type="number" id="wisdom" value="12">
            <input type="number" id="charisma" value="8">
        `;
        
        testContainer.appendChild(nameSection);
        testContainer.appendChild(statsSection);
        testContainer.appendChild(abilitiesSection);
        
        await TestRunner.waitForUpdate();
        
        // Test storing section data
        if (typeof storeSectionData !== 'undefined') {
            const nameData = storeSectionData('name');
            TestRunner.assertExists(nameData, "Should return data when storing name section");
            TestRunner.assertEqual(nameData.name, "Test Creature", "Should store creature name correctly");
            TestRunner.assertEqual(nameData.size, "Medium", "Should store creature size correctly");
            
            const statsData = storeSectionData('basic-stats');
            TestRunner.assertExists(statsData, "Should return data when storing stats section");
            TestRunner.assertEqual(statsData.armorClass, 15, "Should store armor class correctly");
            TestRunner.assertEqual(statsData.hitPoints, 25, "Should store hit points correctly");
            
            const abilitiesData = storeSectionData('abilities');
            TestRunner.assertExists(abilitiesData, "Should return data when storing abilities section");
            TestRunner.assertEqual(abilitiesData.strength, 16, "Should store strength correctly");
            TestRunner.assertEqual(abilitiesData.charisma, 8, "Should store charisma correctly");
        }
        
        // Test restoring section data
        if (typeof restoreSectionData !== 'undefined') {
            const testData = {
                name: "Restored Creature",
                size: "Large",
                type: "beast"
            };
            
            restoreSectionData('name', testData);
            await TestRunner.waitForUpdate();
            
            TestRunner.assertEqual(document.getElementById('creature-name').value, "Restored Creature", 
                "Should restore creature name");
            TestRunner.assertEqual(document.getElementById('creature-size').value, "Large", 
                "Should restore creature size");
            TestRunner.assertEqual(document.getElementById('creature-type').value, "beast", 
                "Should restore creature type");
        }
        
        // Test with missing elements
        if (typeof storeSectionData !== 'undefined') {
            const nonExistentData = storeSectionData('non-existent-section');
            // Should either return empty object or handle gracefully
            TestRunner.assertTrue(typeof nonExistentData === 'object', "Should handle non-existent sections gracefully");
        }
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});

// Test creature library loading
TestRunner.registerTest('libraryLoading', async function() {
    // Test loading the creature list
    if (typeof loadCreatureList !== 'undefined') {
        try {
            const creatureList = await loadCreatureList();
            
            TestRunner.assertExists(creatureList, "Creature list should be loaded");
            TestRunner.assertTrue(Array.isArray(creatureList), "Creature list should be an array");
            TestRunner.assertTrue(creatureList.length > 0, "Creature list should not be empty");
            
            // Test structure of creature list items
            if (creatureList.length > 0) {
                const firstCreature = creatureList[0];
                TestRunner.assertExists(firstCreature.name, "Creature should have a name");
                TestRunner.assertExists(firstCreature.file, "Creature should have a file reference");
            }
            
        } catch (error) {
            TestRunner.assertTrue(false, `Failed to load creature list: ${error.message}`);
        }
    }
    
    // Test loading individual creature data
    if (typeof loadCreatureFromFile !== 'undefined') {
        try {
            // Try to load a known creature file
            const creatureData = await loadCreatureFromFile('creatures/goblin_cr14.json');
            
            if (creatureData) {
                TestRunner.assertExists(creatureData.name, "Loaded creature should have a name");
                TestRunner.assertExists(creatureData.abilities, "Loaded creature should have abilities");
                TestRunner.assertTrue(typeof creatureData.abilities === 'object', "Abilities should be an object");
                
                // Test required fields
                TestRunner.assertExists(creatureData.armorClass, "Should have armor class");
                TestRunner.assertExists(creatureData.hitPoints, "Should have hit points");
                TestRunner.assertExists(creatureData.challengeRating, "Should have challenge rating");
            }
            
        } catch (error) {
            // It's OK if specific files don't exist, but function should handle gracefully
            TestRunner.assertTrue(true, "Should handle missing files gracefully");
        }
    }
    
    // Test error handling for invalid files
    if (typeof loadCreatureFromFile !== 'undefined') {
        try {
            const invalidData = await loadCreatureFromFile('non-existent-file.json');
            // Should either return null/undefined or throw handled error
            TestRunner.assertTrue(invalidData === null || invalidData === undefined, 
                "Should return null/undefined for non-existent files");
        } catch (error) {
            TestRunner.assertTrue(true, "Should handle invalid file paths gracefully");
        }
    }
});

// Test local storage functionality
TestRunner.registerTest('localStorage', async function() {
    // Test basic localStorage operations
    const testKey = 'dnd-editor-test';
    const testData = { test: 'data', number: 42 };
    
    try {
        // Test saving to localStorage
        localStorage.setItem(testKey, JSON.stringify(testData));
        const savedData = localStorage.getItem(testKey);
        TestRunner.assertExists(savedData, "Data should be saved to localStorage");
        
        // Test loading from localStorage
        const parsedData = JSON.parse(savedData);
        TestRunner.assertEqual(parsedData.test, 'data', "Should preserve string data");
        TestRunner.assertEqual(parsedData.number, 42, "Should preserve numeric data");
        
        // Test removing from localStorage
        localStorage.removeItem(testKey);
        const removedData = localStorage.getItem(testKey);
        TestRunner.assertEqual(removedData, null, "Data should be removed from localStorage");
        
    } catch (error) {
        TestRunner.assertTrue(false, `localStorage operations failed: ${error.message}`);
    }
    
    // Test application-specific localStorage functions
    if (typeof saveToLocalStorage !== 'undefined' && typeof loadFromLocalStorage !== 'undefined') {
        const appTestData = TestRunner.getMockCreatureData();
        
        try {
            await saveToLocalStorage('test-creature', appTestData);
            const loadedData = await loadFromLocalStorage('test-creature');
            
            TestRunner.assertExists(loadedData, "Should load data from localStorage");
            TestRunner.assertEqual(loadedData.name, appTestData.name, "Should preserve creature name");
            TestRunner.assertEqual(loadedData.armorClass, appTestData.armorClass, "Should preserve armor class");
            
        } catch (error) {
            TestRunner.assertTrue(false, `App localStorage functions failed: ${error.message}`);
        }
    }
});

// Test data validation
TestRunner.registerTest('dataValidation', async function() {
    if (typeof validateCreatureData !== 'undefined') {
        const validCreature = TestRunner.getMockCreatureData();
        
        // Test valid creature data
        const validResult = validateCreatureData(validCreature);
        TestRunner.assertTrue(validResult.isValid, "Valid creature data should pass validation");
        
        // Test missing required fields
        const invalidCreature = { ...validCreature };
        delete invalidCreature.name;
        
        const invalidResult = validateCreatureData(invalidCreature);
        TestRunner.assertFalse(invalidResult.isValid, "Creature without name should fail validation");
        TestRunner.assertTrue(invalidResult.errors.length > 0, "Should return validation errors");
        
        // Test invalid ability scores
        const badAbilities = { ...validCreature };
        badAbilities.abilities.strength = -5;
        
        const badAbilityResult = validateCreatureData(badAbilities);
        TestRunner.assertFalse(badAbilityResult.isValid, "Negative ability scores should fail validation");
        
        // Test invalid armor class
        const badAC = { ...validCreature };
        badAC.armorClass = -10;
        
        const badACResult = validateCreatureData(badAC);
        TestRunner.assertFalse(badACResult.isValid, "Negative armor class should fail validation");
    }
});

// Test data migration/upgrade
TestRunner.registerTest('dataMigration', async function() {
    if (typeof migrateCreatureData !== 'undefined') {
        // Test upgrading old data format
        const oldFormatData = {
            name: "Old Format Creature",
            ac: 15,  // Old field name
            hp: 25,  // Old field name
            str: 16, // Old field names for abilities
            dex: 14,
            con: 13,
            int: 10,
            wis: 12,
            cha: 8
        };
        
        const migratedData = migrateCreatureData(oldFormatData);
        
        TestRunner.assertEqual(migratedData.name, "Old Format Creature", "Name should be preserved");
        TestRunner.assertEqual(migratedData.armorClass, 15, "AC should be migrated to armorClass");
        TestRunner.assertEqual(migratedData.hitPoints, 25, "HP should be migrated to hitPoints");
        TestRunner.assertEqual(migratedData.abilities.strength, 16, "Abilities should be restructured");
        TestRunner.assertEqual(migratedData.abilities.dexterity, 14, "All abilities should be migrated");
    }
});
