// D&D Creature Sheet Editor
// Main JavaScript file for the creature editor application

// Global variables
let currentCreature = null;
let currentEditingSection = null;
let originalData = {};

// Utility functions
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function getAbilityModifierText(score) {
    const modifier = getAbilityModifier(score);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

// Local storage keys
const STORAGE_KEYS = {
    CURRENT_CREATURE: 'dnd_editor_current_creature',
    CURRENT_VIEW: 'dnd_editor_current_view',
    EDITING_SECTION: 'dnd_editor_editing_section',
    FORM_DATA: 'dnd_editor_form_data'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing app');
    try {
        initializeApp();
        setupEventListeners();
        console.log('App initialization completed');
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Load dropdowns first so they're available when restoring state
    populateDropdowns().then(() => {
        // Try to restore previous state
        restoreCurrentState();
        
        // If no saved state, show welcome screen by default
        const currentView = localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW);
        if (!currentView || currentView === 'welcome') {
            showWelcomeScreen();
        }
        
        // Load creature library for the browse option
        loadCreatureLibrary();
        
        // Set up auto-save
        setupAutoSave();
    });
}

// Screen navigation functions
function showWelcomeScreen() {
    console.log('Showing welcome screen');
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('mainEditor').style.display = 'none';
    closeModals();
    
    // Save current view state
    localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, 'welcome');
}

function showMainEditor() {
    console.log('Showing main editor');
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainEditor').style.display = 'block';
    closeModals();
    
    // Save current view state
    localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, 'editor');
    saveCurrentState();
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
        // Clear any saved state first
        clearSavedState();
        
        // Reset editing state
        currentEditingSection = null;
        
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
        // Clear previous state when loading existing creature
        clearSavedState();
        
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

// Helper function to safely set element values
function setElementValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}

function setElementChecked(elementId, checked) {
    const element = document.getElementById(elementId);
    if (element) {
        element.checked = checked;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
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
        
        // Handle AC override
        const overrideAC = data.overrideAC || false;
        setElementChecked('overrideAC', overrideAC);
        
        // Handle armor data - for legacy files, try to guess armor type from AC and armor description
        const armorType = data.armorType || 'none';
        const armorSubtype = data.armorSubtype || 'unarmored';
        const armorModifier = data.armorModifier || 0;
        const hasShield = data.hasShield || false;
        const shieldModifier = data.shieldModifier || 0;
        
        setElementValue('armorType', armorType);
        setElementValue('armorSubtype', armorSubtype);
        setElementValue('armorModifier', armorModifier);
        setElementChecked('hasShield', hasShield);
        setElementValue('shieldModifier', shieldModifier);
        
        setElementValue('hitPoints', data.hit_points || data.hitPoints || 1);
        setElementValue('speed', data.speed || '30 ft.');
        
        // Update armor subtypes and calculate AC after setting values
        setTimeout(() => {
            updateArmorSubtypes();
            setElementValue('armorSubtype', armorSubtype);
            
            // Set up the AC override state
            toggleACOverride();
            
            // For legacy files, don't recalculate AC, keep the original value
            if (!data.armorType && !data.armorSubtype) {
                const acInput = document.getElementById('armorClass');
                if (acInput) acInput.value = data.armor_class || data.armorClass || 10;
            } else if (!overrideAC) {
                calculateAndUpdateAC();
            }
        }, 100);
        
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
        
        // Load dynamic sections
        loadSpecialAbilities(data.special_abilities || data.specialAbilities || []);
        loadActions(data.actions || []);
        loadLegendaryActions(data.legendary_actions || data.legendaryActions || []);
        
        // Update calculated fields
        updateDisplay();
        updateAllDisplays();
        
        // Save current state
        saveCurrentState();
        
        console.log('Creature data loaded successfully');
        
    } catch (error) {
        console.error('Error loading creature data:', error);
        throw error;
    }
}

// Load special abilities
function loadSpecialAbilities(abilities) {
    const container = document.getElementById('specialAbilities');
    const display = document.getElementById('specialAbilitiesDisplay');
    
    if (!container || !display) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!abilities || abilities.length === 0) {
        display.innerHTML = '<p class="empty-section">No special abilities defined. Click to add.</p>';
        return;
    }
    
    // Load abilities into edit section
    abilities.forEach(ability => {
        addSpecialAbilityItem(ability.name || '', ability.uses || '', ability.description || '');
    });
    
    // Update display
    updateSpecialAbilitiesDisplay();
}

// Load actions
function loadActions(actions) {
    const container = document.getElementById('actions');
    const display = document.getElementById('actionsDisplay');
    
    if (!container || !display) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!actions || actions.length === 0) {
        display.innerHTML = '<p class="empty-section">No actions defined. Click to add.</p>';
        return;
    }
    
    // Load actions into edit section
    actions.forEach(action => {
        addActionItem(action.name || '', action.description || '');
    });
    
    // Update display
    updateActionsDisplay();
}

// Load legendary actions
function loadLegendaryActions(legendaryActions) {
    const container = document.getElementById('legendaryActions');
    const display = document.getElementById('legendaryActionsDisplay');
    
    if (!container || !display) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!legendaryActions || legendaryActions.length === 0) {
        display.innerHTML = '<p class="empty-section">No legendary actions defined. Click to add.</p>';
        return;
    }
    
    // Load legendary actions into edit section
    legendaryActions.forEach(action => {
        addLegendaryActionItem(action.name || '', action.uses || '', action.description || '');
    });
    
    // Update display
    updateLegendaryActionsDisplay();
}

// Add special ability item
function addSpecialAbilityItem(name = '', uses = '', description = '') {
    const container = document.getElementById('specialAbilities');
    if (!container) return;
    
    const item = document.createElement('div');
    item.className = 'ability-item';
    item.innerHTML = `
        <input type="text" class="ability-name" placeholder="Ability Name" value="${name}">
        <span class="ability-uses">(<input type="text" class="ability-use-count" placeholder="uses" value="${uses}">)</span>
        <button class="btn btn-small" onclick="removeElement(this.parentElement)" style="float: right; background: #dc3545; color: white;">Remove</button>
        <textarea class="ability-description" placeholder="Ability description">${description}</textarea>
    `;
    container.appendChild(item);
    
    // Add auto-save event listeners to the new inputs
    const inputs = item.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveCurrentState, 1000));
        input.addEventListener('change', saveCurrentState);
        input.addEventListener('blur', () => {
            // Auto-save and update display when clicking off field
            saveCurrentState();
            updateDisplay();
            updateAllDisplays();
        });
    });
}

// Add action item
function addActionItem(name = '', description = '') {
    const container = document.getElementById('actions');
    if (!container) return;
    
    const item = document.createElement('div');
    item.className = 'action-item';
    item.innerHTML = `
        <input type="text" class="action-name" placeholder="Action Name" value="${name}">
        <button class="btn btn-small" onclick="removeElement(this.parentElement)" style="float: right; background: #dc3545; color: white;">Remove</button>
        <textarea class="action-description" placeholder="Action description">${description}</textarea>
    `;
    container.appendChild(item);
    
    // Add auto-save event listeners to the new inputs
    const inputs = item.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveCurrentState, 1000));
        input.addEventListener('change', saveCurrentState);
        input.addEventListener('blur', () => {
            // Auto-save and update display when clicking off field
            saveCurrentState();
            updateDisplay();
            updateAllDisplays();
        });
    });
}

// Add legendary action item
function addLegendaryActionItem(name = '', uses = '', description = '') {
    const container = document.getElementById('legendaryActions');
    if (!container) return;
    
    const item = document.createElement('div');
    item.className = 'legendary-action-item';
    item.innerHTML = `
        <input type="text" class="legendary-action-name" placeholder="Action Name" value="${name}">
        <span class="ability-uses">(<input type="text" class="legendary-action-use-count" placeholder="uses" value="${uses}">)</span>
        <button class="btn btn-small" onclick="removeElement(this.parentElement)" style="float: right; background: #dc3545; color: white;">Remove</button>
        <textarea class="legendary-action-description" placeholder="Action description">${description}</textarea>
    `;
    container.appendChild(item);
    
    // Add auto-save event listeners to the new inputs
    const inputs = item.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveCurrentState, 1000));
        input.addEventListener('change', saveCurrentState);
        input.addEventListener('blur', () => {
            // Auto-save and update display when clicking off field
            saveCurrentState();
            updateDisplay();
            updateAllDisplays();
        });
    });
}

// Add new special ability
function addSpecialAbility() {
    addSpecialAbilityItem();
    saveCurrentState();
}

// Add new action
function addAction() {
    addActionItem();
    saveCurrentState();
}

// Add new legendary action
function addLegendaryAction() {
    addLegendaryActionItem();
    saveCurrentState();
}

// Remove element helper
function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
        saveCurrentState();
    }
}

// Update special abilities display
function updateSpecialAbilitiesDisplay() {
    const container = document.getElementById('specialAbilities');
    const display = document.getElementById('specialAbilitiesDisplay');
    
    if (!container || !display) return;
    
    const abilities = container.querySelectorAll('.ability-item');
    
    if (abilities.length === 0) {
        display.innerHTML = '<p class="empty-section">No special abilities defined. Click to add.</p>';
        return;
    }
    
    let html = '';
    abilities.forEach(ability => {
        const name = ability.querySelector('.ability-name')?.value || '';
        const uses = ability.querySelector('.ability-use-count')?.value || '';
        const description = ability.querySelector('.ability-description')?.value || '';
        
        if (name || description) {
            const usesText = uses ? ` (${uses})` : '';
            html += `
                <div class="ability-display">
                    <div class="ability-name-display"><strong>${name}${usesText}.</strong></div>
                    <div class="ability-description-display">${description}</div>
                </div>
            `;
        }
    });
    
    display.innerHTML = html || '<p class="empty-section">No special abilities defined. Click to add.</p>';
}

// Update actions display
function updateActionsDisplay() {
    const container = document.getElementById('actions');
    const display = document.getElementById('actionsDisplay');
    
    if (!container || !display) return;
    
    const actions = container.querySelectorAll('.action-item');
    
    if (actions.length === 0) {
        display.innerHTML = '<p class="empty-section">No actions defined. Click to add.</p>';
        return;
    }
    
    let html = '';
    actions.forEach(action => {
        const name = action.querySelector('.action-name')?.value || '';
        const description = action.querySelector('.action-description')?.value || '';
        
        if (name || description) {
            html += `
                <div class="action-display">
                    <div class="action-name-display"><strong>${name}.</strong></div>
                    <div class="action-description-display">${description}</div>
                </div>
            `;
        }
    });
    
    display.innerHTML = html || '<p class="empty-section">No actions defined. Click to add.</p>';
}

// Update legendary actions display
function updateLegendaryActionsDisplay() {
    const container = document.getElementById('legendaryActions');
    const display = document.getElementById('legendaryActionsDisplay');
    
    if (!container || !display) return;
    
    const actions = container.querySelectorAll('.legendary-action-item');
    
    if (actions.length === 0) {
        display.innerHTML = '<p class="empty-section">No legendary actions defined. Click to add.</p>';
        return;
    }
    
    let html = '';
    actions.forEach(action => {
        const name = action.querySelector('.legendary-action-name')?.value || '';
        const uses = action.querySelector('.legendary-action-use-count')?.value || '';
        const description = action.querySelector('.legendary-action-description')?.value || '';
        
        if (name || description) {
            const usesText = uses ? ` (${uses})` : '';
            html += `
                <div class="legendary-action-display">
                    <div class="legendary-action-name-display"><strong>${name}${usesText}.</strong></div>
                    <div class="legendary-action-description-display">${description}</div>
                </div>
            `;
        }
    });
    
    display.innerHTML = html || '<p class="empty-section">No legendary actions defined. Click to add.</p>';
}

// Populate dropdown menus
async function populateDropdowns() {
    console.log('Populating dropdowns...');
    
    // Load creature sizes from JSON file
    try {
        const sizesResponse = await fetch('./dropdowns/creaturesizes.json');
        if (sizesResponse.ok) {
            const sizes = await sizesResponse.json();
            populateDropdown('creatureSize', sizes);
        } else {
            console.warn('Could not load creature sizes, using fallback');
            const fallbackSizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
            populateDropdown('creatureSize', fallbackSizes);
        }
    } catch (error) {
        console.error('Error loading creature sizes:', error);
        const fallbackSizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
        populateDropdown('creatureSize', fallbackSizes);
    }
    
    // Load creature types from JSON file
    try {
        const typesResponse = await fetch('./dropdowns/creatureTypes.json');
        if (typesResponse.ok) {
            const types = await typesResponse.json();
            populateDropdown('creatureType', types);
        } else {
            console.warn('Could not load creature types, using fallback');
            const fallbackTypes = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
            populateDropdown('creatureType', fallbackTypes);
        }
    } catch (error) {
        console.error('Error loading creature types:', error);
        const fallbackTypes = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
        populateDropdown('creatureType', fallbackTypes);
    }
    
    // Load alignments from JSON file
    try {
        const alignmentsResponse = await fetch('./dropdowns/creatureAlignments.json');
        if (alignmentsResponse.ok) {
            const alignments = await alignmentsResponse.json();
            populateDropdown('creatureAlignment', alignments);
        } else {
            console.warn('Could not load creature alignments, using fallback');
            const fallbackAlignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
            populateDropdown('creatureAlignment', fallbackAlignments);
        }
    } catch (error) {
        console.error('Error loading creature alignments:', error);
        const fallbackAlignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
        populateDropdown('creatureAlignment', fallbackAlignments);
    }
    
    // Load armor categories from JSON file
    try {
        console.log('Loading armor categories...');
        const armorCategoriesResponse = await fetch('./dropdowns/armorCategories.json');
        console.log('Armor categories response:', armorCategoriesResponse.status);
        if (armorCategoriesResponse.ok) {
            const armorCategories = await armorCategoriesResponse.json();
            console.log('Armor categories loaded:', armorCategories);
            populateDropdown('armorType', armorCategories);
            console.log('Armor type dropdown populated');
        } else {
            console.warn('Could not load armor categories, using fallback');
            const fallbackCategories = ['None', 'Natural Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'];
            populateDropdown('armorType', fallbackCategories);
        }
    } catch (error) {
        console.error('Error loading armor categories:', error);
        const fallbackCategories = ['None', 'Natural Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor'];
        populateDropdown('armorType', fallbackCategories);
    }
    
    // Load detailed armor data for calculations
    try {
        const armorDataResponse = await fetch('./dropdowns/armorTypes.json');
        if (armorDataResponse.ok) {
            const armorData = await armorDataResponse.json();
            window.armorData = armorData; // Store globally for calculations
            setupArmorEventListeners();
        } else {
            console.warn('Could not load armor data, using fallback');
            setupFallbackArmor();
        }
    } catch (error) {
        console.error('Error loading armor data:', error);
        setupFallbackArmor();
    }
}

function populateDropdown(elementId, options) {
    console.log(`Populating dropdown ${elementId} with options:`, options);
    const select = document.getElementById(elementId);
    if (!select) {
        console.warn(`Element with id '${elementId}' not found`);
        return;
    }
    
    select.innerHTML = '';
    options.forEach((option, index) => {
        console.log(`Adding option ${index}: ${option}`);
        const optionEl = document.createElement('option');
        optionEl.value = option.toLowerCase();
        optionEl.textContent = option;
        select.appendChild(optionEl);
    });
    console.log(`Dropdown ${elementId} now has ${select.options.length} options`);
}

// Auto-save and update function for blur events
function autoSaveAndUpdate() {
    saveCurrentState();
    updateDisplay();
    updateAllDisplays();
    
    // Special case: preserve AC override state after updates
    const overrideACCheckbox = document.getElementById('overrideAC');
    if (overrideACCheckbox && overrideACCheckbox.checked) {
        const armorClassInput = document.getElementById('armorClass');
        if (armorClassInput) {
            armorClassInput.readOnly = false;
        }
    }
}

// Armor-related functions
function setupArmorEventListeners() {
    const armorTypeSelect = document.getElementById('armorType');
    const overrideACCheckbox = document.getElementById('overrideAC');
    const armorClassInput = document.getElementById('armorClass');
    
    if (armorTypeSelect) {
        armorTypeSelect.addEventListener('change', updateArmorSubtypes);
        armorTypeSelect.addEventListener('blur', autoSaveAndUpdate);
    }
    
    if (overrideACCheckbox) {
        overrideACCheckbox.addEventListener('change', toggleACOverride);
        overrideACCheckbox.addEventListener('blur', autoSaveAndUpdate);
    }
    
    if (armorClassInput) {
        armorClassInput.addEventListener('input', function() {
            // Only allow positive integers when in manual mode
            const overrideACCheckbox = document.getElementById('overrideAC');
            if (overrideACCheckbox && overrideACCheckbox.checked) {
                // Ensure only positive integers
                let value = parseInt(armorClassInput.value);
                if (isNaN(value) || value < 1) {
                    armorClassInput.value = 1;
                } else if (value > 1000) {
                    armorClassInput.value = 1000;
                }
                updateBasicStatsDisplay();
            }
        });
        armorClassInput.addEventListener('change', function() {
            const overrideACCheckbox = document.getElementById('overrideAC');
            if (overrideACCheckbox && overrideACCheckbox.checked) {
                updateBasicStatsDisplay();
            }
        });
        armorClassInput.addEventListener('blur', autoSaveAndUpdate);
    }
    
    // Populate initial subtypes (this will also set up the subtype event listeners)
    updateArmorSubtypes();
}

function updateArmorSubtypes() {
    const armorTypeSelect = document.getElementById('armorType');
    const armorSubtypeSelect = document.getElementById('armorSubtype');
    
    if (!armorTypeSelect || !armorSubtypeSelect || !window.armorData) {
        return;
    }
    
    const selectedType = armorTypeSelect.value;
    let subtypes = {};
    
    // Map dropdown values to armor data keys
    switch(selectedType) {
        case 'none':
            subtypes = window.armorData["None"] || {};
            break;
        case 'natural armor':
            subtypes = window.armorData["Natural Armor"] || {};
            break;
        case 'light armor':
            subtypes = window.armorData["Light Armor"] || {};
            break;
        case 'medium armor':
            subtypes = window.armorData["Medium Armor"] || {};
            break;
        case 'heavy armor':
            subtypes = window.armorData["Heavy Armor"] || {};
            break;
        default:
            subtypes = {};
    }
    
    armorSubtypeSelect.innerHTML = '';
    if (Object.keys(subtypes).length > 0) {
        Object.keys(subtypes).forEach(subtype => {
            const optionEl = document.createElement('option');
            optionEl.value = subtype.toLowerCase();
            optionEl.textContent = subtype;
            armorSubtypeSelect.appendChild(optionEl);
        });
    } else {
        // Fallback option
        const optionEl = document.createElement('option');
        optionEl.value = 'unarmored';
        optionEl.textContent = 'Unarmored';
        armorSubtypeSelect.appendChild(optionEl);
    }
    
    // Re-attach event listeners after updating the dropdown content
    // Remove any existing listeners first
    const newArmorSubtypeSelect = armorSubtypeSelect.cloneNode(true);
    armorSubtypeSelect.parentNode.replaceChild(newArmorSubtypeSelect, armorSubtypeSelect);
    
    // Add fresh event listeners
    newArmorSubtypeSelect.addEventListener('change', function() {
        console.log('Armor subtype changed to:', newArmorSubtypeSelect.value);
        calculateAndUpdateAC();
    });
    newArmorSubtypeSelect.addEventListener('blur', autoSaveAndUpdate);
    
    // Calculate AC after updating subtypes
    calculateAndUpdateAC();
}

function calculateAndUpdateAC() {
    const armorClassInput = document.getElementById('armorClass');
    const overrideACCheckbox = document.getElementById('overrideAC');
    
    if (!armorClassInput) return;
    
    // Check if AC override is enabled
    if (overrideACCheckbox && overrideACCheckbox.checked) {
        // When in manual mode, just ensure the field is editable and update display
        armorClassInput.readOnly = false;
        updateBasicStatsDisplay();
        return;
    }
    
    // Continue with calculated AC
    const armorTypeSelect = document.getElementById('armorType');
    const armorSubtypeSelect = document.getElementById('armorSubtype');
    const armorModifierSelect = document.getElementById('armorModifier');
    const hasShieldCheckbox = document.getElementById('hasShield');
    const shieldModifierSelect = document.getElementById('shieldModifier');
    const dexterityInput = document.getElementById('dexterity');
    
    if (!armorTypeSelect || !armorSubtypeSelect || !dexterityInput || !window.armorData) {
        return;
    }
    
    // Make sure AC field is read-only for calculated mode
    armorClassInput.readOnly = true;
    
    const selectedType = armorTypeSelect.value;
    const selectedSubtype = armorSubtypeSelect.value;
    const armorModifier = parseInt(armorModifierSelect?.value) || 0;
    const hasShield = hasShieldCheckbox?.checked || false;
    const shieldModifier = parseInt(shieldModifierSelect?.value) || 0;
    const dexScore = parseInt(dexterityInput.value) || 10;
    const dexModifier = getAbilityModifier(dexScore);
    
    let totalAC = 10; // Default unarmored AC
    let armorData = null;
    
    // Map dropdown values to armor data
    switch(selectedType) {
        case 'none':
            armorData = window.armorData["None"];
            break;
        case 'natural armor':
            armorData = window.armorData["Natural Armor"];
            break;
        case 'light armor':
            armorData = window.armorData["Light Armor"];
            break;
        case 'medium armor':
            armorData = window.armorData["Medium Armor"];
            break;
        case 'heavy armor':
            armorData = window.armorData["Heavy Armor"];
            break;
    }
    
    if (armorData) {
        // Find the subtype (check both exact match and case-insensitive)
        let armorInfo = null;
        for (const [key, value] of Object.entries(armorData)) {
            if (key.toLowerCase() === selectedSubtype) {
                armorInfo = value;
                break;
            }
        }
        
        if (armorInfo) {
            totalAC = armorInfo.baseAC;
            
            // Apply dexterity modifier based on armor type
            if (armorInfo.maxDex === null) {
                // Light armor or natural - full dex modifier
                totalAC += dexModifier;
            } else if (armorInfo.maxDex > 0) {
                // Medium armor - limited dex modifier
                totalAC += Math.min(dexModifier, armorInfo.maxDex);
            }
            // Heavy armor - no dex modifier (maxDex = 0)
        } else {
            // Fallback: if no specific armor subtype found, use basic calculations
            if (selectedType === 'none') {
                totalAC = 10 + dexModifier; // Unarmored
            } else if (selectedType === 'natural armor') {
                totalAC = 10 + dexModifier; // Natural armor base
            } else {
                // For other armor types without specific subtypes, use base + dex
                totalAC = 10 + dexModifier;
            }
        }
    } else {
        // No armor data available, fall back to unarmored
        totalAC = 10 + dexModifier;
    }
    
    // Add shield bonus (base +2 AC plus any shield modifier)
    if (hasShield) {
        totalAC += 2 + shieldModifier;
    }
    
    // Add armor modifier (for magical armor or special bonuses)
    totalAC += armorModifier;
    
    armorClassInput.value = totalAC;
    
    // Update the display
    updateBasicStatsDisplay();
}

function setupFallbackArmor() {
    console.log('Setting up fallback armor...');
    const armorSubtypeSelect = document.getElementById('armorSubtype');
    
    // Don't overwrite the armor type dropdown if it already has options
    // Only set up the subtype dropdown and fallback data
    if (armorSubtypeSelect) {
        armorSubtypeSelect.innerHTML = '<option value="unarmored">Unarmored</option>';
    }
    
    // Create comprehensive fallback data that matches the original file structure
    window.armorData = {
        "None": {
            "Unarmored": {
                "ac": "10 + Dex modifier",
                "baseAC": 10,
                "maxDex": null,
                "stealth": null
            }
        },
        "Natural Armor": {
            "Natural Armor": {
                "ac": "10 + Dex modifier",
                "baseAC": 10,
                "maxDex": null,
                "stealth": null
            }
        },
        "Light Armor": {
            "Padded": {
                "ac": "11 + Dex modifier",
                "baseAC": 11,
                "maxDex": null,
                "stealth": "Disadvantage"
            },
            "Leather": {
                "ac": "11 + Dex modifier",
                "baseAC": 11,
                "maxDex": null,
                "stealth": null
            },
            "Studded Leather": {
                "ac": "12 + Dex modifier",
                "baseAC": 12,
                "maxDex": null,
                "stealth": null
            }
        },
        "Medium Armor": {
            "Hide": {
                "ac": "12 + Dex modifier (max 2)",
                "baseAC": 12,
                "maxDex": 2,
                "stealth": null
            },
            "Chain Shirt": {
                "ac": "13 + Dex modifier (max 2)",
                "baseAC": 13,
                "maxDex": 2,
                "stealth": null
            },
            "Scale Mail": {
                "ac": "14 + Dex modifier (max 2)",
                "baseAC": 14,
                "maxDex": 2,
                "stealth": "Disadvantage"
            }
        },
        "Heavy Armor": {
            "Ring Mail": {
                "ac": "14",
                "baseAC": 14,
                "maxDex": 0,
                "stealth": "Disadvantage"
            },
            "Chain Mail": {
                "ac": "16",
                "baseAC": 16,
                "maxDex": 0,
                "stealth": "Disadvantage"
            },
            "Plate": {
                "ac": "18",
                "baseAC": 18,
                "maxDex": 0,
                "stealth": "Disadvantage"
            }
        }
    };
    
    console.log('Fallback armor data set:', Object.keys(window.armorData));
    setupArmorEventListeners();
}

// ...existing code...

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

// Update all display sections
function updateAllDisplays() {
    updateNameDisplay();
    updateBasicStatsDisplay();
    updateAbilityScoresDisplay();
    updateTraitsDisplay();
    updateSpecialAbilitiesDisplay();
    updateActionsDisplay();
    updateLegendaryActionsDisplay();
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
        const alignment = document.getElementById('creatureAlignment')?.value || 'neutral';
        
        // Get the correct type value (handle "Other" option)
        const typeSelect = document.getElementById('creatureType');
        const typeOther = document.getElementById('creatureTypeOther');
        let type;
        
        if (typeSelect?.value === 'other' && typeOther?.value) {
            type = typeOther.value;
        } else {
            type = typeSelect?.value || 'humanoid';
        }
        
        typeEl.innerHTML = `<em>${toTitleCase(size)} ${type}, ${toTitleCase(alignment)}</em>`;
    }
}

// Update basic stats display
function updateBasicStatsDisplay() {
    const acEl = document.getElementById('armorClassDisplay');
    const hpEl = document.getElementById('hitPointsDisplay');
    const speedEl = document.getElementById('speedDisplay');
    
    if (acEl) {
        const ac = document.getElementById('armorClass')?.value || '10';
        acEl.textContent = ac;
    }
    
    if (hpEl) {
        const hp = document.getElementById('hitPoints')?.value || '1';
        hpEl.textContent = hp;
    }
    
    if (speedEl) {
        const speed = document.getElementById('speed')?.value || '30 ft.';
        speedEl.textContent = speed;
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

// Save current state to localStorage
function saveCurrentState() {
    try {
        // Save current view
        const isMainEditorVisible = document.getElementById('mainEditor').style.display !== 'none';
        localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, isMainEditorVisible ? 'editor' : 'welcome');
        
        // Save current creature data
        if (currentCreature) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_CREATURE, JSON.stringify(currentCreature));
        }
        
        // Save current editing section
        if (currentEditingSection) {
            localStorage.setItem(STORAGE_KEYS.EDITING_SECTION, currentEditingSection);
        }
        
        // Save current form data
        const formData = collectFormData();
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
        
        console.log('State saved to localStorage');
    } catch (error) {
        console.error('Error saving state to localStorage:', error);
    }
}

// Restore state from localStorage
function restoreCurrentState() {
    try {
        // Restore current view
        const savedView = localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW);
        if (savedView === 'editor') {
            // Restore creature data first
            const savedCreature = localStorage.getItem(STORAGE_KEYS.CURRENT_CREATURE);
            if (savedCreature) {
                currentCreature = JSON.parse(savedCreature);
                
                // Restore form data
                const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
                if (savedFormData) {
                    const formData = JSON.parse(savedFormData);
                    loadFormData(formData);
                } else {
                    loadCreatureFromData(currentCreature);
                }
                
                // Show main editor
                showMainEditor();
                
                // Restore editing section if any
                const savedEditingSection = localStorage.getItem(STORAGE_KEYS.EDITING_SECTION);
                if (savedEditingSection) {
                    setTimeout(() => {
                        editSection(savedEditingSection);
                    }, 100);
                }
                
                console.log('State restored from localStorage');
            }
        }
    } catch (error) {
        console.error('Error restoring state from localStorage:', error);
        // Clear corrupted data
        clearSavedState();
    }
}

// Collect current form data
function collectFormData() {
    const formData = {};
    
    // Basic info
    formData.name = document.getElementById('creatureName')?.value || '';
    formData.size = document.getElementById('creatureSize')?.value || 'Medium';
    
    // Handle creature type (check for "other" option)
    const creatureTypeSelect = document.getElementById('creatureType');
    const creatureTypeOther = document.getElementById('creatureTypeOther');
    if (creatureTypeSelect?.value === 'other' && creatureTypeOther?.value) {
        formData.type = creatureTypeOther.value;
        formData.typeIsOther = true;
    } else {
        formData.type = creatureTypeSelect?.value || 'humanoid';
        formData.typeIsOther = false;
    }
    
    formData.alignment = document.getElementById('creatureAlignment')?.value || 'neutral';
    
    // Basic stats
    formData.armorClass = document.getElementById('armorClass')?.value || 10;
    formData.overrideAC = document.getElementById('overrideAC')?.checked || false;
    formData.armorType = document.getElementById('armorType')?.value || 'none';
    formData.armorSubtype = document.getElementById('armorSubtype')?.value || 'unarmored';
    formData.armorModifier = parseInt(document.getElementById('armorModifier')?.value) || 0;
    formData.hasShield = document.getElementById('hasShield')?.checked || false;
    formData.shieldModifier = parseInt(document.getElementById('shieldModifier')?.value) || 0;
    formData.hitPoints = document.getElementById('hitPoints')?.value || 1;
    formData.speed = document.getElementById('speed')?.value || '30 ft.';
    
    // Ability scores
    formData.abilities = {
        strength: document.getElementById('strength')?.value || 10,
        dexterity: document.getElementById('dexterity')?.value || 10,
        constitution: document.getElementById('constitution')?.value || 10,
        intelligence: document.getElementById('intelligence')?.value || 10,
        wisdom: document.getElementById('wisdom')?.value || 10,
        charisma: document.getElementById('charisma')?.value || 10
    };
    
    // Traits
    formData.savingThrows = document.getElementById('savingThrows')?.value || '';
    formData.skills = document.getElementById('skills')?.value || '';
    formData.vulnerabilities = document.getElementById('vulnerabilities')?.value || '';
    formData.resistances = document.getElementById('resistances')?.value || '';
    formData.immunities = document.getElementById('immunities')?.value || '';
    formData.conditionImmunities = document.getElementById('conditionImmunities')?.value || '';
    formData.senses = document.getElementById('senses')?.value || '';
    formData.languages = document.getElementById('languages')?.value || '';
    formData.challenge = document.getElementById('challenge')?.value || '0';
    formData.proficiencyBonus = document.getElementById('proficiencyBonus')?.value || '+2';
    
    // Special abilities
    formData.specialAbilities = collectSpecialAbilities();
    
    // Actions
    formData.actions = collectActions();
    
    // Legendary actions
    formData.legendaryActions = collectLegendaryActions();
    
    return formData;
}

// Collect special abilities from form
function collectSpecialAbilities() {
    const abilities = [];
    const container = document.getElementById('specialAbilities');
    if (container) {
        const items = container.querySelectorAll('.ability-item');
        items.forEach(item => {
            const name = item.querySelector('.ability-name')?.value || '';
            const uses = item.querySelector('.ability-use-count')?.value || '';
            const description = item.querySelector('.ability-description')?.value || '';
            if (name || description) {
                abilities.push({ name, uses, description });
            }
        });
    }
    return abilities;
}

// Collect actions from form
function collectActions() {
    const actions = [];
    const container = document.getElementById('actions');
    if (container) {
        const items = container.querySelectorAll('.action-item');
        items.forEach(item => {
            const name = item.querySelector('.action-name')?.value || '';
            const description = item.querySelector('.action-description')?.value || '';
            if (name || description) {
                actions.push({ name, description });
            }
        });
    }
    return actions;
}

// Collect legendary actions from form
function collectLegendaryActions() {
    const actions = [];
    const container = document.getElementById('legendaryActions');
    if (container) {
        const items = container.querySelectorAll('.legendary-action-item');
        items.forEach(item => {
            const name = item.querySelector('.legendary-action-name')?.value || '';
            const uses = item.querySelector('.legendary-action-use-count')?.value || '';
            const description = item.querySelector('.legendary-action-description')?.value || '';
            if (name || description) {
                actions.push({ name, uses, description });
            }
        });
    }
    return actions;
}

// Load form data
function loadFormData(formData) {
    // Basic info
    setElementValue('creatureName', formData.name);
    setElementValue('creatureSize', formData.size);
    
    // Handle creature type (check if it was "other")
    if (formData.typeIsOther) {
        setElementValue('creatureType', 'other');
        setElementValue('creatureTypeOther', formData.type);
        // Show the other input
        const otherInput = document.getElementById('creatureTypeOther');
        if (otherInput) otherInput.style.display = 'block';
    } else {
        setElementValue('creatureType', formData.type);
        // Hide the other input
        const otherInput = document.getElementById('creatureTypeOther');
        if (otherInput) {
            otherInput.style.display = 'none';
            otherInput.value = '';
        }
    }
    
    setElementValue('creatureAlignment', formData.alignment);
    
    // Basic stats
    setElementValue('armorClass', formData.armorClass);
    setElementChecked('overrideAC', formData.overrideAC || false);
    setElementValue('armorType', formData.armorType);
    setElementValue('armorSubtype', formData.armorSubtype);
    setElementValue('armorModifier', formData.armorModifier || 0);
    setElementChecked('hasShield', formData.hasShield);
    setElementValue('shieldModifier', formData.shieldModifier || 0);
    setElementValue('hitPoints', formData.hitPoints);
    setElementValue('speed', formData.speed);
    
    // Update armor subtypes after setting armor type
    setTimeout(() => {
        updateArmorSubtypes();
        setElementValue('armorSubtype', formData.armorSubtype);
        calculateAndUpdateAC();
    }, 100);
    
    // Ability scores
    if (formData.abilities) {
        setElementValue('strength', formData.abilities.strength);
        setElementValue('dexterity', formData.abilities.dexterity);
        setElementValue('constitution', formData.abilities.constitution);
        setElementValue('intelligence', formData.abilities.intelligence);
        setElementValue('wisdom', formData.abilities.wisdom);
        setElementValue('charisma', formData.abilities.charisma);
    }
    
    // Traits
    setElementValue('savingThrows', formData.savingThrows);
    setElementValue('skills', formData.skills);
    setElementValue('vulnerabilities', formData.vulnerabilities);
    setElementValue('resistances', formData.resistances);
    setElementValue('immunities', formData.immunities);
    setElementValue('conditionImmunities', formData.conditionImmunities);
    setElementValue('senses', formData.senses);
    setElementValue('languages', formData.languages);
    setElementValue('challenge', formData.challenge);
    setElementValue('proficiencyBonus', formData.proficiencyBonus);
    
    // Load dynamic sections
    loadSpecialAbilities(formData.specialAbilities || []);
    loadActions(formData.actions || []);
    loadLegendaryActions(formData.legendaryActions || []);
    
    // Set up AC override state after loading data
    setTimeout(() => {
        toggleACOverride();
        if (!formData.overrideAC) {
            calculateAndUpdateAC();
        }
    }, 50);
    
    // Update displays
    updateDisplay();
    updateAllDisplays();
}

// Clear saved state
function clearSavedState() {
    try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CREATURE);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_VIEW);
        localStorage.removeItem(STORAGE_KEYS.EDITING_SECTION);
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
        console.log('Saved state cleared');
    } catch (error) {
        console.error('Error clearing saved state:', error);
    }
}

// Auto-save functionality
function setupAutoSave() {
    // Save state when form changes
    const autoSaveElements = [
        'creatureName', 'creatureSize', 'creatureType', 'creatureTypeOther', 'creatureAlignment',
        'armorClass', 'overrideAC', 'armorType', 'armorSubtype', 'armorModifier', 'hasShield', 'shieldModifier', 'hitPoints', 'speed',
        'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
        'savingThrows', 'skills', 'vulnerabilities', 'resistances', 'immunities',
        'conditionImmunities', 'senses', 'languages', 'challenge', 'proficiencyBonus'
    ];
    
    autoSaveElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('input', debounce(saveCurrentState, 1000));
            element.addEventListener('change', saveCurrentState);
            element.addEventListener('blur', () => {
                // Auto-save and update display when clicking off field
                saveCurrentState();
                updateDisplay();
                updateAllDisplays();
            });
        }
    });
    
    // Special event listeners for AC calculation
    const dexterityInput = document.getElementById('dexterity');
    const hasShieldCheckbox = document.getElementById('hasShield');
    const armorModifierSelect = document.getElementById('armorModifier');
    const shieldModifierSelect = document.getElementById('shieldModifier');
    
    if (dexterityInput) {
        dexterityInput.addEventListener('input', calculateAndUpdateAC);
        dexterityInput.addEventListener('change', calculateAndUpdateAC);
    }
    
    if (hasShieldCheckbox) {
        hasShieldCheckbox.addEventListener('change', calculateAndUpdateAC);
    }
    
    if (armorModifierSelect) {
        armorModifierSelect.addEventListener('change', calculateAndUpdateAC);
    }
    
    if (shieldModifierSelect) {
        shieldModifierSelect.addEventListener('change', calculateAndUpdateAC);
    }
    
    // Save state when switching views
    document.getElementById('backToWelcome')?.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, 'welcome');
        saveCurrentState();
    });
}

// Debounce function to limit auto-save frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Edit section functionality
function editSection(sectionId) {
    console.log('Editing section:', sectionId);
    
    // If another section is already being edited, save it first
    if (currentEditingSection && currentEditingSection !== sectionId) {
        saveSection(currentEditingSection);
    }
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Hide display content and show edit content
    const displayContent = section.querySelector('.display-content');
    const editContent = section.querySelector('.edit-content');
    
    if (displayContent) displayContent.style.display = 'none';
    if (editContent) editContent.style.display = 'block';
    
    currentEditingSection = sectionId;
    
    // Save editing state
    localStorage.setItem(STORAGE_KEYS.EDITING_SECTION, sectionId);
    saveCurrentState();
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
    
    // Clear editing state and save current state
    localStorage.removeItem(STORAGE_KEYS.EDITING_SECTION);
    saveCurrentState();
    
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
    
    // Clear editing state
    localStorage.removeItem(STORAGE_KEYS.EDITING_SECTION);
}

// Toggle creature type other input
function toggleCreatureTypeOther() {
    const typeSelect = document.getElementById('creatureType');
    const otherInput = document.getElementById('creatureTypeOther');
    
    if (!typeSelect || !otherInput) return;
    
    if (typeSelect.value === 'other') {
        otherInput.style.display = 'block';
        otherInput.focus();
    } else {
        otherInput.style.display = 'none';
        otherInput.value = '';
    }
    
    // Update display and save state when toggling
    updateDisplay();
    saveCurrentState();
}

// Toggle AC override
function toggleACOverride() {
    console.log('toggleACOverride called');
    const overrideACCheckbox = document.getElementById('overrideAC');
    const armorClassInput = document.getElementById('armorClass');
    
    console.log('Override checkbox:', overrideACCheckbox?.checked);
    console.log('Armor class input:', armorClassInput);
    console.log('Current readOnly state:', armorClassInput?.readOnly);
    
    if (!overrideACCheckbox || !armorClassInput) return;
    
    if (overrideACCheckbox.checked) {
        console.log('Making AC field editable');
        // Make AC field editable
        armorClassInput.readOnly = false;
        console.log('After setting readOnly=false:', armorClassInput.readOnly);
        armorClassInput.focus();
        
        // Update the label to show it's manual
        const calculatedLabel = document.querySelector('.calculated-label');
        if (calculatedLabel) {
            calculatedLabel.textContent = '(Manual)';
        }
    } else {
        console.log('Making AC field read-only');
        // Make AC field read-only and recalculate
        armorClassInput.readOnly = true;
        
        // Update the label back to calculated
        const calculatedLabel = document.querySelector('.calculated-label');
        if (calculatedLabel) {
            calculatedLabel.textContent = '(Calculated)';
        }
        
        // Recalculate AC
        calculateAndUpdateAC();
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Main editor buttons
    const backBtn = document.getElementById('backToWelcome');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            saveCurrentState();
            showWelcomeScreen();
        });
    }
    
    const newBtn = document.getElementById('newCreature');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            clearSavedState(); // Clear previous state when creating new
            createBlankCreature();
        });
    }
    
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
    
    // Auto-save and exit edit mode when clicking outside of editable sections
    document.addEventListener('click', function(event) {
        // Check if click is outside any editable section
        const editableSection = event.target.closest('.editable-section');
        
        // If we're currently editing a section and clicked outside all editable sections
        if (currentEditingSection && !editableSection) {
            // Save the current editing section and exit edit mode
            saveSection(currentEditingSection);
        }
    });
    
    // Set up ability score listeners
    setupAbilityScoreListeners();
    
    // Set up other form listeners
    setupFormListeners();
    
    // Set up auto-save
    setupAutoSave();
    
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
