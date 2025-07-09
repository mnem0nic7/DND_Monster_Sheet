// D&D Creature Sheet Editor
// Main JavaScript file for the creature editor application

// Global variables
let currentCreature = null;
let currentEditingSection = null;
let originalData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing app');
    try {
        initializeApp();
        setupEventListeners();
        populateDropdowns();
        console.log('App initialization completed');
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Show welcome screen by default
    showWelcomeScreen();
    
    // Load creature library for the browse option
    loadCreatureLibrary();
}

// Screen navigation functions
function showWelcomeScreen() {
    console.log('Showing welcome screen');
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('mainEditor').style.display = 'none';
    closeModals();
}

function showMainEditor() {
    console.log('Showing main editor');
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainEditor').style.display = 'block';
    closeModals();
}

// Modal functions
function showCreateOptions() {
    console.log('Showing create options');
    document.getElementById('createModal').style.display = 'block';
}

function showImportOptions() {
    console.log('Showing import options');
    document.getElementById('importModal').style.display = 'block';
}

function showCreatureLibrary() {
    console.log('Showing creature library');
    document.getElementById('creatureLibraryFull').style.display = 'block';
    loadCreatureLibrary();
}

function showTemplateLibrary() {
    console.log('Showing template library');
    document.getElementById('templateLibrary').style.display = 'block';
}

function closeModals() {
    console.log('Closing all modals');
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Create a blank creature by loading the template
async function createBlankCreature() {
    console.log('createBlankCreature called');
    
    try {
        closeModals();
        
        // Load the blank creature template
        await loadCreatureFromLibrary('new_creature_cr0.json');
        
    } catch (error) {
        console.error('Error in createBlankCreature:', error);
        alert('Error creating blank creature: ' + error.message);
    }
}

// Load creature from library
async function loadCreatureFromLibrary(filename) {
    console.log('Loading creature from library:', filename);
    
    try {
        const response = await fetch(`./creatures/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load creature: ${response.statusText}`);
        }
        
        const creatureData = await response.json();
        console.log('Creature data loaded:', creatureData);
        
        // Load the creature data into the editor
        loadCreatureFromData(creatureData);
        
        // Switch to main editor
        showMainEditor();
        
        showNotification(`${creatureData.name || 'Creature'} loaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Error loading creature from library:', error);
        showNotification('Error loading creature file', 'error');
        throw error;
    }
}

// Load creature data into the form
function loadCreatureFromData(data) {
    console.log('Loading creature data into form:', data);
    
    try {
        currentCreature = data;
        
        // Basic Info
        setElementValue('creatureName', data.name || '');
        setElementValue('creatureSize', data.size || 'Medium');
        setElementValue('creatureType', data.type || 'humanoid');
        setElementValue('creatureAlignment', data.alignment || 'neutral');
        
        // Basic Stats
        setElementValue('armorClass', data.armor_class || data.armorClass || 10);
        setElementValue('hitPoints', data.hit_points || data.hitPoints || 1);
        // Support new speeds array structure
        if (Array.isArray(data.speeds)) {
            setElementValue('speed', JSON.stringify(data.speeds));
        } else {
            setElementValue('speed', '[]');
        }
        
        // Ability Scores - handle both snake_case and camelCase, and nested abilities object
        const abilities = data.abilities || data;
        setElementValue('strength', abilities.strength || abilities.str || 10);
        setElementValue('dexterity', abilities.dexterity || abilities.dex || 10);
        setElementValue('constitution', abilities.constitution || abilities.con || 10);
        setElementValue('intelligence', abilities.intelligence || abilities.int || 10);
        setElementValue('wisdom', abilities.wisdom || abilities.wis || 10);
        setElementValue('charisma', abilities.charisma || abilities.cha || 10);
        
        // Skills and Traits
        setElementValue('savingThrows', data.saving_throws || data.savingThrows || '');
        setElementValue('skills', data.skills || '');
        setElementValue('vulnerabilities', data.damage_vulnerabilities || data.damageVulnerabilities || '');
        setElementValue('resistances', data.damage_resistances || data.damageResistances || '');
        setElementValue('immunities', data.damage_immunities || data.damageImmunities || '');
        setElementValue('conditionImmunities', data.condition_immunities || data.conditionImmunities || '');
        setElementValue('senses', data.senses || '');
        setElementValue('languages', data.languages || '');
        setElementValue('challenge', data.challenge_rating || data.challengeRating || '0');
        setElementValue('proficiencyBonus', data.proficiency_bonus || data.proficiencyBonus || '+2');
        
        // Update calculated fields
        updateDisplay();
        updateAllDisplays();
        
        console.log('Creature data loaded successfully');
        
    } catch (error) {
        console.error('Error loading creature data:', error);
        throw error;
    }
}

// Helper function to safely set element values
function setElementValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}

// Load and populate the creature library
async function loadCreatureLibrary() {
    console.log('Loading creature library...');
    
    try {
        const response = await fetch('./creature-list.json');
        if (!response.ok) {
            throw new Error(`Failed to load creature list: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Creature list loaded:', data);
        
        populateCreatureLibrary(data.creatures);
        
    } catch (error) {
        console.error('Error loading creature library:', error);
        const libraryGrid = document.getElementById('creatureLibraryGrid');
        if (libraryGrid) {
            libraryGrid.innerHTML = '<p class="error-text">Error loading creature library</p>';
        }
    }
}

// Populate the creature library grid
function populateCreatureLibrary(creatures) {
    const libraryGrid = document.getElementById('creatureLibraryGrid');
    if (!libraryGrid) return;
    
    libraryGrid.innerHTML = '';
    
    creatures.forEach(creature => {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.innerHTML = `
            <strong>${creature.name}</strong>
            <span class="cr">CR ${creature.cr}</span>
            <small>${creature.type || 'Unknown type'}</small>
        `;
        
        item.addEventListener('click', () => {
            console.log('Loading creature:', creature.file);
            loadCreatureFromLibrary(creature.file);
            closeModals();
        });
        
        libraryGrid.appendChild(item);
    });
}

// Update all display sections
function updateAllDisplays() {
    updateNameDisplay();
    updateBasicStatsDisplay();
    updateAbilityScoresDisplay();
    updateTraitsDisplay();
}

// Update name display
function updateNameDisplay() {
    const nameEl = document.getElementById('creatureNameDisplay');
    const typeEl = document.getElementById('creatureTypeDisplay');
    
    if (nameEl) {
        const name = document.getElementById('creatureName')?.value || 'Unnamed Creature';
        nameEl.textContent = name;
    }
    
    if (typeEl) {
        const size = document.getElementById('creatureSize')?.value || 'Medium';
        const type = document.getElementById('creatureType')?.value || 'humanoid';
        const alignment = document.getElementById('creatureAlignment')?.value || 'neutral';
        typeEl.innerHTML = `<em>${size} ${type}, ${alignment}</em>`;
    }
}

// Update basic stats display
function updateBasicStatsDisplay() {
    const acEl = document.getElementById('armorClassDisplay');
    const hpEl = document.getElementById('hitPointsDisplay');
    const speedEl = document.getElementById('speedDisplay');
    
    if (acEl) {
        const ac = document.getElementById('armorClass')?.value || '10';
        acEl.textContent = `${ac} (natural armor)`;
    }
    
    if (hpEl) {
        const hp = document.getElementById('hitPoints')?.value || '1';
        hpEl.textContent = hp;
    }
    
    if (speedEl) {
        let speedStr = '';
        try {
            const val = document.getElementById('speed')?.value || '[]';
            const speeds = JSON.parse(val);
            if (Array.isArray(speeds) && speeds.length > 0) {
                speedStr = speeds.map(s => {
                    let type = s.type === 'Other' ? (s.customType || 'Other') : s.type;
                    let dist = s.distance ? s.distance + ' ft.' : '';
                    return type && type.toLowerCase() !== 'walk' ? `${type} ${dist}` : dist;
                }).filter(Boolean).join(', ');
            }
        } catch { speedStr = ''; }
        speedEl.textContent = speedStr || '—';
    }
}

// Update ability scores display
function updateAbilityScoresDisplay() {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const fullNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    abilities.forEach((ability, index) => {
        const displayEl = document.getElementById(`${ability}Display`);
        const inputEl = document.getElementById(fullNames[index]);
        
        if (displayEl && inputEl) {
            const score = parseInt(inputEl.value) || 10;
            const modifier = getAbilityModifier(score);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            displayEl.textContent = `${score} (${modifierText})`;
        }
    });
}

// Update traits display
function updateTraitsDisplay() {
    const traits = [
        { id: 'savingThrows', displayId: 'savingThrowsDisplay', lineId: 'savingThrowsLine' },
        { id: 'skills', displayId: 'skillsDisplay', lineId: 'skillsLine' },
        { id: 'vulnerabilities', displayId: 'vulnerabilitiesDisplay', lineId: 'vulnerabilitiesLine' },
        { id: 'resistances', displayId: 'resistancesDisplay', lineId: 'resistancesLine' },
        { id: 'immunities', displayId: 'immunitiesDisplay', lineId: 'immunitiesLine' },
        { id: 'conditionImmunities', displayId: 'conditionImmunitiesDisplay', lineId: 'conditionImmunitiesLine' },
        { id: 'senses', displayId: 'sensesDisplay', lineId: 'sensesLine' },
        { id: 'languages', displayId: 'languagesDisplay', lineId: 'languagesLine' }
    ];
    
    traits.forEach(trait => {
        const inputEl = document.getElementById(trait.id);
        const displayEl = document.getElementById(trait.displayId);
        const lineEl = document.getElementById(trait.lineId);
        
        if (inputEl && displayEl) {
            const value = inputEl.value.trim();
            displayEl.textContent = value;
            
            if (lineEl) {
                lineEl.style.display = value ? 'block' : 'none';
            }
        }
    });
    
    // Update challenge rating
    const challengeEl = document.getElementById('challengeDisplay');
    const proficiencyEl = document.getElementById('proficiencyBonusDisplay');
    
    if (challengeEl) {
        const challenge = document.getElementById('challenge')?.value || '0';
        challengeEl.textContent = challenge;
    }
    
    if (proficiencyEl) {
        const proficiency = document.getElementById('proficiencyBonus')?.value || '+2';
        proficiencyEl.textContent = proficiency;
    }
}

// Populate dropdown menus
function populateDropdowns() {
    console.log('Populating dropdowns...');
    
    // Creature sizes
    const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
    populateDropdown('creatureSize', sizes);
    
    // Creature types
    const types = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'];
    populateDropdown('creatureType', types);
    
    // Alignments
    const alignments = ['lawful good', 'neutral good', 'chaotic good', 'lawful neutral', 'neutral', 'chaotic neutral', 'lawful evil', 'neutral evil', 'chaotic evil', 'unaligned'];
    populateDropdown('creatureAlignment', alignments);
}

function populateDropdown(elementId, options) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    select.innerHTML = '';
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        select.appendChild(optionEl);
    });
}

// Utility functions for ability score calculations
function getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function getAbilityModifierText(score) {
    const modifier = getAbilityModifier(score);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function calculateProficiencyBonus(cr) {
    if (cr === '0') return 2;
    if (cr === '1/8' || cr === '1/4' || cr === '1/2') return 2;
    
    const crNum = parseFloat(cr);
    if (crNum <= 4) return 2;
    if (crNum <= 8) return 3;
    if (crNum <= 12) return 4;
    if (crNum <= 16) return 5;
    if (crNum <= 20) return 6;
    if (crNum <= 24) return 7;
    if (crNum <= 28) return 8;
    return 9;
}

function updateAbilityModifiers() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const shortNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    abilities.forEach((ability, index) => {
        const input = document.getElementById(ability);
        const modifierEl = document.getElementById(`${shortNames[index]}Mod`);
        
        if (input && modifierEl) {
            const score = parseInt(input.value) || 10;
            const modifier = getAbilityModifier(score);
            modifierEl.textContent = modifier >= 0 ? `(+${modifier})` : `(${modifier})`;
        }
    });
    
    // Update displays
    updateAbilityScoresDisplay();
}

function updateProficiencyBonus() {
    const crInput = document.getElementById('challenge');
    const pbInput = document.getElementById('proficiencyBonus');
    
    if (crInput && pbInput) {
        const cr = crInput.value;
        const pb = calculateProficiencyBonus(cr);
        pbInput.value = `+${pb}`;
    }
    
    updateTraitsDisplay();
}

function updateDisplay() {
    try {
        updateAbilityModifiers();
        updateProficiencyBonus();
        updateAllDisplays();
        
    } catch (error) {
        console.error('Error updating display:', error);
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`);
    
    // Simple notification using a temporary div
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white; padding: 12px 20px; border-radius: 4px;
        font-family: Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Main editor buttons
    const backBtn = document.getElementById('backToWelcome');
    if (backBtn) backBtn.addEventListener('click', showWelcomeScreen);
    
    const newBtn = document.getElementById('newCreature');
    if (newBtn) newBtn.addEventListener('click', createBlankCreature);
    
    // Modal close buttons
    document.querySelectorAll('.close, .close-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Set up ability score listeners
    setupAbilityScoreListeners();
    
    // Set up other form listeners
    setupFormListeners();
    
    console.log('Event listeners setup completed');
}

function setupAbilityScoreListeners() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    abilities.forEach(ability => {
        const input = document.getElementById(ability);
        if (input) {
            input.addEventListener('input', updateDisplay);
            input.addEventListener('change', updateDisplay);
        }
    });
}

function setupFormListeners() {
    // Basic info listeners
    const basicFields = ['creatureName', 'creatureSize', 'creatureType', 'creatureAlignment'];
    basicFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateDisplay);
        }
    });
    
    // Challenge rating listener
    const crInput = document.getElementById('challenge');
    if (crInput) {
        crInput.addEventListener('change', updateDisplay);
    }
    
    // All other form fields
    const allFields = ['armorClass', 'hitPoints', 'speed', 'savingThrows', 'skills', 'vulnerabilities', 'resistances', 'immunities', 'conditionImmunities', 'senses', 'languages'];
    allFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateDisplay);
        }
    });
}

// Edit section functionality
function editSection(sectionId) {
    console.log('Editing section:', sectionId);
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Hide display content and show edit content
    const displayContent = section.querySelector('.display-content');
    const editContent = section.querySelector('.edit-content');
    
    if (displayContent) displayContent.style.display = 'none';
    if (editContent) editContent.style.display = 'block';
    
    currentEditingSection = sectionId;
}

function saveSection(sectionId) {
    console.log('Saving section:', sectionId);
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Show display content and hide edit content
    const displayContent = section.querySelector('.display-content');
    const editContent = section.querySelector('.edit-content');
    
    if (displayContent) displayContent.style.display = 'block';
    if (editContent) editContent.style.display = 'none';
    
    // Update displays
    updateDisplay();
    
    currentEditingSection = null;
    showNotification('Section saved successfully!', 'success');
}

function cancelEdit(sectionId) {
    console.log('Cancelling edit for section:', sectionId);
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Show display content and hide edit content
    const displayContent = section.querySelector('.display-content');
    const editContent = section.querySelector('.edit-content');
    
    if (displayContent) displayContent.style.display = 'block';
    if (editContent) editContent.style.display = 'none';
    
    // Restore original values if needed
    // TODO: Implement proper restore functionality
    
    currentEditingSection = null;
}

// Export functionality
function exportCreatureJSON() {
    if (!currentCreature) {
        showNotification('No creature loaded to export', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(currentCreature, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentCreature.name || 'creature'}.json`;
    link.click();
    
    showNotification('Creature exported successfully!', 'success');
}

// Print functionality
function printStatBlock() {
    window.print();
}

console.log('Script loaded successfully');
