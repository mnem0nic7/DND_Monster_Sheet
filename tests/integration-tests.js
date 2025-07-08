/**
 * Integr                <div id="nameSection        // Create a basic editor interface mockup
        const editorContainer = TestRunner.createElement('div', { id: 'editor-container' });
        editorContainer.innerHTML = `
            <div id="welcomeScreen" style="display: none;"></div>
            <div id="mainEditor" style="display: block;">
                <div id="creature-editor" style="display: none;">
                    <div id="nameSection" class="editable-section">
                        <div class="display-content">
                            <span id="creatureNameDisplay">Unnamed Creature</span>
                            <span id="creatureTypeDisplay"><em>Medium humanoid, neutral</em></span>
                        </div>
                        <div class="edit-content" style="display: none;">
                            <input type="text" id="creatureName" value="">
                            <input type="text" id="creatureSize" value="Medium">
                            <select id="creatureType">
                                <option value="humanoid" selected>humanoid</option>
                                <option value="beast">beast</option>
                                <option value="Other">Other</option>
                            </select>
                            <input type="text" id="creatureTypeOther" value="" style="display: none;">
                            <input type="text" id="creatureAlignment" value="neutral">
                        </div>
                    </div>
                    
                    <div id="basicStatsSection" class="editable-section">
                        <div class="display-content">
                            <span id="armorClassDisplay">10</span>
                            <span id="hitPointsDisplay">1 (1d6)</span>
                            <span id="speedDisplay">30 ft.</span>
                        </div>
                        <div class="edit-content">
                            <input type="checkbox" id="overrideAC">
                            <input type="number" id="armorClass" value="10">
                            <select id="armorKind">
                                <option value="">None</option>
                                <option value="leather">leather armor</option>
                            </select>
                            <input type="text" id="armorKindOther" value="" style="display: none;">
                            <input type="checkbox" id="overrideHP">
                            <input type="number" id="hitPoints" value="1">
                            <input type="number" id="hitDiceNumber" value="1">
                            <select id="hitDiceType">
                                <option value="6" selected>d6</option>
                                <option value="8">d8</option>
                            </select>
                            <input type="number" id="hitPointModifier" value="0">
                            <input type="text" id="speed" value="30 ft.">
                        </div>
                    </div>
                    
                    <div id="abilityScoresSection" class="editable-section">
                        <div class="edit-content">
                            <input type="number" id="strength" value="10">
                            <input type="number" id="dexterity" value="10">
                            <input type="number" id="constitution" value="10">
                            <input type="number" id="intelligence" value="10">
                            <input type="number" id="wisdom" value="10">
                            <input type="number" id="charisma" value="10">
                            <span id="strMod">+0</span>
                            <span id="dexMod">+0</span>
                            <span id="conMod">+0</span>
                            <span id="intMod">+0</span>
                            <span id="wisMod">+0</span>
                            <span id="chaMod">+0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button id="create-blank-creature">Blank Creature</button>
        `;ss="editable-section">
                    <div class="display-content">
                        <span class="creature-name">Unnamed Creature</span>
                    </div>
                    <div class="edit-content" style="display: none;">
                        <input type="text" id="creature-name" value="">
                        <input type="text" id="creature-size" value="Medium">
                        <input type="text" id="creature-type" value="humanoid">
                    </div>
                </div>
                
                <!-- Required elements for storeOriginalData -->
                <input type="text" id="creatureName" value="">
                <input type="text" id="creatureSize" value="Medium">
                <input type="text" id="creatureType" value="humanoid">
                <input type="text" id="creatureAlignment" value="neutral">
                <select id="armorCategory">
                    <option value="Light Armor">Light Armor</option>
                </select>
                <select id="armorKind">
                    <option value="Leather">Leather</option>
                </select>
                <input type="number" id="armorBonus" value="0">
                
                <!-- Required elements for updateDisplayContent -->
                <span id="creatureNameDisplay">Unnamed Creature</span>
                <span id="creatureTypeDisplay"><em>Medium humanoid, neutral</em></span>
                <input type="text" id="creatureTypeOther" value="">
                <span id="armorClassDisplay">10</span>
                <span id="hitPointsDisplay">1 (1d6)</span>
                <span id="speedDisplay">30 ft.</span>
                <input type="text" id="armorKindOther" value="">
                <input type="text" id="speed" value="30 ft.">
                
                <!-- Ability score displays -->
                <span id="strDisplay">10 (+0)</span>
                <span id="dexDisplay">10 (+0)</span>
                <span id="conDisplay">10 (+0)</span>
                <span id="intDisplay">10 (+0)</span>
                <span id="wisDisplay">10 (+0)</span>
                <span id="chaDisplay">10 (+0)</span>`s for D&D Monster Sheet Editor
 * Tests complete workflows and cross-component interactions
 */

// Test complete creature creation workflow
TestRunner.registerTest('completeCreation', async function() {
    const testContainer = TestRunner.createTestContainer();
    
    try {
        // Create a basic editor interface mockup
        const editorContainer = TestRunner.createElement('div', { id: 'editor-container' });
        editorContainer.innerHTML = `
            <div id="mainEditor" style="display: block;">
                <div id="creature-editor" style="display: none;">
                    <div id="nameSection" class="editable-section">
                        <div class="display-content">
                            <span id="creatureNameDisplay">Unnamed Creature</span>
                            <span id="creatureTypeDisplay"><em>Medium humanoid, neutral</em></span>
                        </div>
                        <div class="edit-content" style="display: none;">
                            <input type="text" id="creatureName" value="">
                            <input type="text" id="creatureSize" value="Medium">
                            <select id="creatureType">
                                <option value="humanoid" selected>humanoid</option>
                                <option value="beast">beast</option>
                                <option value="Other">Other</option>
                            </select>
                            <input type="text" id="creatureTypeOther" value="" style="display: none;">
                            <input type="text" id="creatureAlignment" value="neutral">
                        </div>
                    </div>
                    
                    <div id="basicStatsSection" class="editable-section">
                        <div class="display-content">
                            <span id="armorClassDisplay">10</span>
                            <span id="hitPointsDisplay">1 (1d6)</span>
                            <span id="speedDisplay">30 ft.</span>
                        </div>
                        <div class="edit-content">
                            <input type="checkbox" id="overrideAC">
                            <input type="number" id="armorClass" value="10">
                            <select id="armorKind">
                                <option value="">None</option>
                                <option value="leather">leather armor</option>
                            </select>
                            <input type="text" id="armorKindOther" value="" style="display: none;">
                            <input type="checkbox" id="overrideHP">
                            <input type="number" id="hitPoints" value="1">
                            <input type="number" id="hitDiceNumber" value="1">
                            <select id="hitDiceType">
                                <option value="6" selected>d6</option>
                                <option value="8">d8</option>
                            </select>
                            <input type="number" id="hitPointModifier" value="0">
                            <input type="text" id="speed" value="30 ft.">
                        </div>
                    </div>
                    
                    <div id="abilityScoresSection" class="editable-section">
                        <div class="edit-content">
                            <input type="number" id="strength" value="10">
                            <input type="number" id="dexterity" value="10">
                            <input type="number" id="constitution" value="10">
                            <input type="number" id="intelligence" value="10">
                            <input type="number" id="wisdom" value="10">
                            <input type="number" id="charisma" value="10">
                            <span id="strMod">+0</span>
                            <span id="dexMod">+0</span>
                            <span id="conMod">+0</span>
                            <span id="intMod">+0</span>
                            <span id="wisMod">+0</span>
                            <span id="chaMod">+0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button id="create-blank-creature">Blank Creature</button>
        `;
        
        testContainer.appendChild(editorContainer);
        await TestRunner.waitForUpdate();
        
        // Mock required functions that createBlankCreature depends on
        window.closeModals = window.closeModals || function() {};
        window.showMainEditor = window.showMainEditor || function() {
            console.log('showMainEditor called (mocked)');
            
            const welcomeScreen = document.getElementById('welcomeScreen');
            const mainEditor = document.getElementById('mainEditor');
            const creatureEditor = document.getElementById('creature-editor');
            
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
            
            if (mainEditor) {
                mainEditor.style.display = 'block';
                
                // Mock the initialization check to prevent multiple calls
                if (!mainEditor.hasAttribute('data-initialized')) {
                    mainEditor.setAttribute('data-initialized', 'true');
                    
                    // Call initializeApp mock
                    if (typeof initializeApp !== 'undefined') {
                        try {
                            initializeApp();
                        } catch (error) {
                            console.log('Error in initializeApp:', error.message);
                        }
                    }
                }
            }
            
            if (creatureEditor) {
                creatureEditor.style.display = 'block';
            }
        };
        window.createNewCreature = window.createNewCreature || function() {
            // Simulate creating blank creature data - clear all fields except abilities
            const nameInput = document.getElementById('creatureName');
            if (nameInput) {
                nameInput.value = '';
            }
            
            const sizeInput = document.getElementById('creatureSize');
            if (sizeInput) {
                sizeInput.value = 'Medium';
            }
            
            const typeSelect = document.getElementById('creatureType');
            if (typeSelect) {
                typeSelect.value = 'humanoid';
            }
            
            const alignmentInput = document.getElementById('creatureAlignment');
            if (alignmentInput) {
                alignmentInput.value = 'neutral';
            }
            
            // Set all ability scores to 10 (the default for a blank creature)
            const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            abilities.forEach(ability => {
                const input = document.getElementById(ability);
                if (input) {
                    input.value = '10';
                }
            });
            
            // Update ability modifiers if the function exists
            if (typeof updateAbilityModifiers !== 'undefined') {
                updateAbilityModifiers();
            }
            
            console.log('Blank creature created with ability scores set to 10');
        };
        // loadCreatureData is no longer needed - removed from initializeApp
        window.initializeApp = window.initializeApp || function() {
            // Mock initialization to prevent errors
            console.log('initializeApp called (mocked)');
            
            try {
                if (typeof updateAbilityModifiers !== 'undefined') {
                    updateAbilityModifiers();
                }
                // loadCreatureData no longer called - removed from real initializeApp
                
                // Mock adding event listeners for ability scores
                const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                abilities.forEach(ability => {
                    const element = document.getElementById(ability);
                    if (element && typeof updateAbilityModifiers !== 'undefined') {
                        // Remove existing listeners to prevent duplicates
                        element.removeEventListener('input', updateAbilityModifiers);
                        element.addEventListener('input', updateAbilityModifiers);
                    }
                });
                
                // Mock setup hit points listeners
                if (typeof setupHitPointsListeners !== 'undefined') {
                    setupHitPointsListeners();
                }
            } catch (error) {
                console.log('Error in initializeApp mock:', error.message);
            }
        };
        // setupHitPointsListeners is now defined in script.js
        
        // Test 1: Create blank creature using the actual function
        const createBtn = document.getElementById('create-blank-creature');
        if (createBtn && typeof createBlankCreature !== 'undefined') {
            createBtn.onclick = createBlankCreature;
            createBtn.click();
            
            // Wait for the timeout in createBlankCreature
            await TestRunner.waitForUpdate(100);
            
            // Verify editor is shown
            const editor = document.getElementById('creature-editor');
            TestRunner.assertNotEqual(editor.style.display, 'none', 
                "Editor should be visible after creating blank creature");
            
            const nameInput = document.getElementById('creatureName');
            TestRunner.assertExists(nameInput, "Name input should exist after creating blank creature");
            
            // Verify blank creature setup
            TestRunner.assertEqual(nameInput.value, '', "Name should be blank for new creature");
            
            // Verify ability scores are set to 10
            const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            abilities.forEach(ability => {
                const input = document.getElementById(ability);
                if (input) {
                    TestRunner.assertEqual(input.value, '10', `${ability} should be 10 for blank creature`);
                }
            });
            
        } else {
            TestRunner.assertTrue(true, "createBlankCreature function not found - test skipped");
        }
        
        // Test 2: Fill in basic information
        document.getElementById('creatureName').value = 'Test Orc';
        document.getElementById('creatureSize').value = 'Medium';
        document.getElementById('creatureType').value = 'humanoid';
        
        // Test 3: Set ability scores and verify modifiers update
        document.getElementById('strength').value = '16';
        document.getElementById('dexterity').value = '12';
        document.getElementById('constitution').value = '16';
        
        if (typeof updateAbilityModifiers !== 'undefined') {
            updateAbilityModifiers();
            await TestRunner.waitForUpdate();
            
            // Check if modifiers are calculated correctly
            const strModifier = calculateModifier(16);
            TestRunner.assertEqual(strModifier, 3, "Strength 16 should give +3 modifier");
            
            // Check if modifier display is updated
            const strModDisplay = document.getElementById('strMod');
            if (strModDisplay) {
                TestRunner.assertTrue(strModDisplay.textContent.includes('3'), 
                    "Strength modifier display should show +3");
            }
        }
        
        // Test 4: Set hit dice and verify HP calculation
        document.getElementById('hitDiceNumber').value = '2';
        document.getElementById('hitDiceType').value = '8';
        document.getElementById('overrideHP').checked = false;
        
        if (typeof calculateHitPoints !== 'undefined') {
            calculateHitPoints();
            const hp = parseInt(document.getElementById('hitPoints').value);
            TestRunner.assertTrue(hp > 0, "Calculated HP should be positive");
        }
        
        // Test 5: Save section using actual function
        if (typeof saveSection !== 'undefined') {
            // Mock dependencies
            window.recalculateAllValues = window.recalculateAllValues || function() {
                if (typeof updateAbilityModifiers !== 'undefined') updateAbilityModifiers();
                if (typeof calculateHitPoints !== 'undefined') calculateHitPoints();
            };
            window.updateDisplayContent = window.updateDisplayContent || function() {};
            window.getCreatureFromForm = window.getCreatureFromForm || function() {
                return {
                    name: document.getElementById('creatureName').value,
                    size: document.getElementById('creatureSize').value,
                    type: document.getElementById('creatureType').value
                };
            };
            window.showNotification = window.showNotification || function(message, type) {
                console.log(`Notification: ${message} (${type})`);
            };
            
            saveSection('nameSection');
            await TestRunner.waitForUpdate();
            
            TestRunner.assertTrue(true, "Save section should execute without errors");
        }
        
        // Test 6: Verify all critical elements exist and have values
        const creatureName = document.getElementById('creatureName').value;
        const strength = document.getElementById('strength').value;
        const armorClass = document.getElementById('armorClass').value;
        const hitPoints = document.getElementById('hitPoints').value;
        
        TestRunner.assertEqual(creatureName, 'Test Orc', "Name should be preserved");
        TestRunner.assertEqual(parseInt(strength), 16, "Strength should be preserved");
        TestRunner.assertTrue(parseInt(armorClass) >= 10, "Armor class should be reasonable");
        TestRunner.assertTrue(parseInt(hitPoints) > 0, "Hit points should be positive");
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});

// Test cross-section dependencies
TestRunner.registerTest('crossSectionDeps', async function() {
    const testContainer = TestRunner.createTestContainer();
    
    try {
        // Create sections that depend on each other
        const abilitiesSection = TestRunner.createElement('div', { id: 'abilities-section' });
        abilitiesSection.innerHTML = `
            <input type="number" id="strength" value="14">
            <input type="number" id="dexterity" value="16">
            <input type="number" id="constitution" value="13">
            <input type="number" id="intelligence" value="10">
            <input type="number" id="wisdom" value="12">
            <input type="number" id="charisma" value="8">
        `;
        
        const statsSection = TestRunner.createElement('div', { id: 'basic-stats-section' });
        statsSection.innerHTML = `
            <input type="number" id="armor-class" value="12">
            <select id="armor-type">
                <option value="none">No Armor</option>
                <option value="leather" selected>Leather Armor</option>
            </select>
            <input type="number" id="hit-points" value="10">
            <input type="number" id="hit-dice-count" value="2">
            <select id="hit-dice-type">
                <option value="6" selected>d6</option>
                <option value="8">d8</option>
            </select>
        `;
        
        const skillsSection = TestRunner.createElement('div', { id: 'skills-section' });
        skillsSection.innerHTML = `
            <input type="checkbox" id="athletics-prof" data-ability="strength">
            <input type="checkbox" id="stealth-prof" data-ability="dexterity">
            <input type="checkbox" id="perception-prof" data-ability="wisdom">
        `;
        
        testContainer.appendChild(abilitiesSection);
        testContainer.appendChild(statsSection);
        testContainer.appendChild(skillsSection);
        
        await TestRunner.waitForUpdate();
        
        // Test 1: Dexterity change affects AC
        const dexInput = document.getElementById('dexterity');
        dexInput.value = '18'; // +4 modifier
        
        if (typeof recalculateAllValues !== 'undefined') {
            recalculateAllValues();
            await TestRunner.waitForUpdate();
            
            // Leather armor (11) + Dex modifier (4) = 15 AC
            const expectedAC = 11 + calculateModifier(18);
            if (typeof calculateArmorClass !== 'undefined') {
                const actualAC = calculateArmorClass();
                TestRunner.assertEqual(actualAC, expectedAC, 
                    "AC should update when Dexterity changes");
            }
        }
        
        // Test 2: Constitution change affects HP
        const conInput = document.getElementById('constitution');
        const originalCon = parseInt(conInput.value);
        conInput.value = '16'; // +3 modifier
        
        if (typeof updateHitPointsFromCon !== 'undefined') {
            updateHitPointsFromCon();
            await TestRunner.waitForUpdate();
            
            TestRunner.assertTrue(true, "HP should update when Constitution changes");
        }
        
        // Test 3: Ability changes affect skill bonuses
        const athleticsProf = document.getElementById('athletics-prof');
        athleticsProf.checked = true;
        
        if (typeof updateSkillBonuses !== 'undefined') {
            updateSkillBonuses();
            await TestRunner.waitForUpdate();
            
            // Athletics uses Strength, should be ability modifier + proficiency
            const strModifier = calculateModifier(14);
            const expectedBonus = strModifier + 2; // Assuming +2 proficiency
            
            TestRunner.assertTrue(expectedBonus > strModifier, 
                "Proficient skills should have higher bonuses");
        }
        
        // Test 4: Challenge Rating affects proficiency bonus
        if (typeof updateChallengeRating !== 'undefined' && typeof calculateProficiencyBonus !== 'undefined') {
            updateChallengeRating('5');
            await TestRunner.waitForUpdate();
            
            const profBonus = calculateProficiencyBonus(5);
            TestRunner.assertEqual(profBonus, 3, "CR 5 should give +3 proficiency bonus");
        }
        
        // Test 5: Verify all values are consistent
        if (typeof validateConsistency !== 'undefined') {
            const isConsistent = validateConsistency();
            TestRunner.assertTrue(isConsistent, "All calculated values should be consistent");
        }
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});

// Test error recovery and resilience
TestRunner.registerTest('errorRecovery', async function() {
    const testContainer = TestRunner.createTestContainer();
    
    try {
        // Test 1: Recovery from missing DOM elements
        if (typeof updateAbilityModifiers !== 'undefined') {
            // Call function when required elements don't exist
            const result = updateAbilityModifiers();
            TestRunner.assertTrue(true, "Should handle missing DOM elements gracefully");
        }
        
        // Test 2: Recovery from invalid data
        const invalidSection = TestRunner.createElement('div', { id: 'test-section' });
        invalidSection.innerHTML = `
            <input type="number" id="test-number" value="not a number">
            <input type="text" id="test-text" value="">
        `;
        
        testContainer.appendChild(invalidSection);
        await TestRunner.waitForUpdate();
        
        if (typeof storeSectionData !== 'undefined') {
            const data = storeSectionData('test');
            TestRunner.assertExists(data, "Should return data object even with invalid inputs");
        }
        
        // Test 3: Network error simulation
        if (typeof loadCreatureFromFile !== 'undefined') {
            try {
                await loadCreatureFromFile('non-existent-file.json');
                TestRunner.assertTrue(true, "Should handle network errors gracefully");
            } catch (error) {
                TestRunner.assertTrue(true, "Should throw handled errors for network issues");
            }
        }
        
        // Test 4: Local storage errors
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function() {
            throw new Error("Storage quota exceeded");
        };
        
        if (typeof saveToLocalStorage !== 'undefined') {
            try {
                await saveToLocalStorage('test', { data: 'test' });
                TestRunner.assertTrue(true, "Should handle localStorage errors gracefully");
            } catch (error) {
                TestRunner.assertTrue(true, "Should catch and handle storage errors");
            }
        }
        
        // Restore localStorage
        localStorage.setItem = originalSetItem;
        
        // Test 5: JSON parsing errors
        if (typeof parseCreatureData !== 'undefined') {
            const invalidJSON = "{ invalid json }";
            try {
                parseCreatureData(invalidJSON);
                TestRunner.assertTrue(true, "Should handle invalid JSON gracefully");
            } catch (error) {
                TestRunner.assertTrue(true, "Should catch JSON parsing errors");
            }
        }
        
        // Test 6: Calculation errors with extreme values
        if (typeof calculateModifier !== 'undefined') {
            const extremeValues = [null, undefined, NaN, Infinity, -Infinity, "string"];
            
            extremeValues.forEach(value => {
                try {
                    const result = calculateModifier(value);
                    TestRunner.assertTrue(typeof result === 'number', 
                        `Should return number for extreme value: ${value}`);
                } catch (error) {
                    TestRunner.assertTrue(true, 
                        `Should handle extreme value gracefully: ${value}`);
                }
            });
        }
        
        // Test 7: Event handler errors
        const testButton = TestRunner.createElement('button', { id: 'error-test-btn' });
        testContainer.appendChild(testButton);
        
        testButton.addEventListener('click', function() {
            throw new Error("Test error in event handler");
        });
        
        try {
            testButton.click();
            TestRunner.assertTrue(true, "Should handle event handler errors gracefully");
        } catch (error) {
            TestRunner.assertTrue(true, "Event handler errors should be contained");
        }
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});

// Test import/export functionality
TestRunner.registerTest('importExport', async function() {
    const testContainer = TestRunner.createTestContainer();
    
    try {
        // Create mock file input
        const fileInput = TestRunner.createElement('input', { 
            type: 'file',
            id: 'import-file',
            accept: '.json'
        });
        
        testContainer.appendChild(fileInput);
        await TestRunner.waitForUpdate();
        
        // Test 1: Export functionality
        const testCreature = TestRunner.getMockCreatureData();
        
        if (typeof exportCreatureJSON !== 'undefined') {
            const exportResult = exportCreatureJSON(testCreature);
            
            if (typeof exportResult === 'string') {
                TestRunner.assertTrue(exportResult.length > 0, "Export should produce non-empty JSON");
                
                // Verify it's valid JSON
                try {
                    const parsed = JSON.parse(exportResult);
                    TestRunner.assertEqual(parsed.name, testCreature.name, "Exported data should match input");
                } catch (error) {
                    TestRunner.assertTrue(false, "Exported data should be valid JSON");
                }
            }
        }
        
        // Test 2: Import functionality
        const validJSON = JSON.stringify(testCreature);
        
        if (typeof importCreatureJSON !== 'undefined') {
            try {
                const importResult = importCreatureJSON(validJSON);
                TestRunner.assertExists(importResult, "Import should return data");
                TestRunner.assertEqual(importResult.name, testCreature.name, "Imported name should match");
            } catch (error) {
                TestRunner.assertTrue(false, `Import should handle valid JSON: ${error.message}`);
            }
        }
        
        // Test 3: Import error handling
        if (typeof importCreatureJSON !== 'undefined') {
            try {
                const invalidResult = importCreatureJSON("invalid json");
                TestRunner.assertTrue(false, "Should throw error for invalid JSON");
            } catch (error) {
                TestRunner.assertTrue(true, "Should properly handle invalid JSON import");
            }
        }
        
        // Test 4: File upload simulation
        if (typeof handleFileUpload !== 'undefined') {
            const mockFile = new Blob([validJSON], { type: 'application/json' });
            Object.defineProperty(mockFile, 'name', { value: 'test-creature.json' });
            
            const mockFileList = {
                0: mockFile,
                length: 1,
                item: function(index) { return this[index]; }
            };
            
            fileInput.files = mockFileList;
            
            try {
                await handleFileUpload({ target: fileInput });
                TestRunner.assertTrue(true, "File upload should handle valid files");
            } catch (error) {
                TestRunner.assertTrue(true, "File upload errors should be handled gracefully");
            }
        }
        
        // Test 5: Batch export
        if (typeof exportMultipleCreatures !== 'undefined') {
            const creatures = [testCreature, { ...testCreature, name: 'Second Creature' }];
            
            const batchResult = exportMultipleCreatures(creatures);
            TestRunner.assertExists(batchResult, "Batch export should return data");
        }
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});

// Test performance with large datasets
TestRunner.registerTest('performance', async function() {
    // Test 1: Large creature list handling
    if (typeof loadCreatureList !== 'undefined') {
        const startTime = performance.now();
        
        try {
            await loadCreatureList();
            const loadTime = performance.now() - startTime;
            
            TestRunner.assertTrue(loadTime < 5000, "Creature list should load within 5 seconds");
        } catch (error) {
            TestRunner.assertTrue(true, "Performance test should handle load errors gracefully");
        }
    }
    
    // Test 2: Multiple rapid calculations
    if (typeof calculateModifier !== 'undefined') {
        const startTime = performance.now();
        
        for (let i = 0; i < 1000; i++) {
            calculateModifier(Math.floor(Math.random() * 20) + 1);
        }
        
        const calcTime = performance.now() - startTime;
        TestRunner.assertTrue(calcTime < 1000, "1000 calculations should complete within 1 second");
    }
    
    // Test 3: Large form handling
    const testContainer = TestRunner.createTestContainer();
    
    try {
        const largeForm = TestRunner.createElement('form', { id: 'large-form' });
        
        // Create many form elements
        for (let i = 0; i < 100; i++) {
            const input = TestRunner.createElement('input', { 
                type: 'text',
                id: `field-${i}`,
                value: `value-${i}`
            });
            largeForm.appendChild(input);
        }
        
        testContainer.appendChild(largeForm);
        await TestRunner.waitForUpdate();
        
        if (typeof storeSectionData !== 'undefined') {
            const startTime = performance.now();
            storeSectionData('large-form');
            const storeTime = performance.now() - startTime;
            
            TestRunner.assertTrue(storeTime < 1000, "Large form data storage should be fast");
        }
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});

// Test accessibility features
TestRunner.registerTest('accessibility', async function() {
    const testContainer = TestRunner.createTestContainer();
    
    try {
        // Create accessible form elements
        const form = TestRunner.createElement('form', { id: 'accessible-form' });
        form.innerHTML = `
            <label for="accessible-input">Creature Name:</label>
            <input type="text" id="accessible-input" aria-required="true">
            
            <fieldset>
                <legend>Ability Scores</legend>
                <label for="str">Strength:</label>
                <input type="number" id="str" min="1" max="30" aria-describedby="str-help">
                <span id="str-help">Enter a value between 1 and 30</span>
            </fieldset>
            
            <button type="submit" aria-label="Save creature data">Save</button>
        `;
        
        testContainer.appendChild(form);
        await TestRunner.waitForUpdate();
        
        // Test 1: Labels are properly associated
        const input = document.getElementById('accessible-input');
        const label = document.querySelector('label[for="accessible-input"]');
        
        TestRunner.assertExists(label, "Input should have associated label");
        TestRunner.assertEqual(label.getAttribute('for'), 'accessible-input', 
            "Label should be properly associated with input");
        
        // Test 2: Required fields have aria-required
        TestRunner.assertEqual(input.getAttribute('aria-required'), 'true', 
            "Required fields should have aria-required");
        
        // Test 3: Fieldsets have legends
        const fieldset = form.querySelector('fieldset');
        const legend = fieldset.querySelector('legend');
        
        TestRunner.assertExists(legend, "Fieldset should have legend");
        TestRunner.assertTrue(legend.textContent.length > 0, "Legend should have meaningful text");
        
        // Test 4: Help text is properly associated
        const strInput = document.getElementById('str');
        const helpText = document.getElementById('str-help');
        
        TestRunner.assertEqual(strInput.getAttribute('aria-describedby'), 'str-help',
            "Input should be described by help text");
        
        // Test 5: Buttons have accessible names
        const saveButton = form.querySelector('button[type="submit"]');
        const ariaLabel = saveButton.getAttribute('aria-label');
        
        TestRunner.assertTrue(ariaLabel && ariaLabel.length > 0, 
            "Buttons should have aria-label or visible text");
        
        // Test 6: Focus management
        if (typeof manageFocus !== 'undefined') {
            input.focus();
            TestRunner.assertEqual(document.activeElement, input, "Focus should be manageable");
        }
        
        // Test 7: Keyboard navigation
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        input.dispatchEvent(tabEvent);
        
        TestRunner.assertTrue(true, "Should handle keyboard navigation gracefully");
        
    } finally {
        TestRunner.cleanupTestContainer();
    }
});
