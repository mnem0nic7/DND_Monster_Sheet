// Global variables and initialization
let currentCreature = {};
let allCreatures = []; // Will store the list of all available creatures

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show welcome screen initially
    showWelcomeScreen();
    loadAllCreatures();
    // Populate creature dropdowns from JSON
    loadDropdown('creatureSize', 'dropdowns/creatureSizes.json');
    loadDropdown('creatureType', 'dropdowns/creatureTypes.json').then(toggleCreatureTypeOther);
    loadDropdown('creatureAlignment', 'dropdowns/creatureAlignments.json');
    // Load armor AC formulas
    loadArmorConfig().then(() => {
        // Wire up AC dropdowns & calculate
        document.getElementById('armorCategory').addEventListener('change', populateArmorKinds);
        document.getElementById('armorKind').addEventListener('change', () => { toggleArmorKindOther(); updateArmorClassField(); });
        document.getElementById('armorBonus').addEventListener('change', updateArmorClassField);
        updateArmorClassField();
    });
    setupEventListeners();
});
// Toggle 'Other' free-form field for creature type
function toggleCreatureTypeOther() {
    const sel = document.getElementById('creatureType');
    const other = document.getElementById('creatureTypeOther');
    if (sel.value === 'Other') other.style.display = 'inline-block';
    else other.style.display = 'none';
}
// Toggle 'Other' free-form field for armor type
function toggleArmorTypeOther() {
    const sel = document.getElementById('armorType');
    const other = document.getElementById('armorTypeOther');
    if (sel.value === 'Other') other.style.display = 'inline-block';
    else other.style.display = 'none';
}
// Store armor AC formulas by category
// Store armor types and AC formulas by category
let armorConfig = {};
// Load armor formulas from equipment.json
async function loadArmorConfig() {
    try {
        const resp = await fetch('json/equipment.json');
        const data = await resp.json();
        const list = data.Equipment.Armor['Armor List'];
        // Build config: each category has kinds[] and formulas[]
        for (const category in list) {
            const tbl = list[category].table;
            armorConfig[category] = {
                kinds: tbl['Armor'],
                formulas: tbl['Armor Class (AC)']
            };
        }
        // Populate category dropdown
        const catSelect = document.getElementById('armorCategory');
        Object.keys(armorConfig).forEach(cat => {
            const opt = document.createElement('option'); opt.value = cat; opt.text = cat;
            catSelect.add(opt);
        });
        // Add 'Other' option
        const otherOpt = document.createElement('option'); otherOpt.value='Other'; otherOpt.text='Other'; catSelect.add(otherOpt);
        // Trigger kinds population
        populateArmorKinds();
    } catch (e) {
        console.error('Failed to load armor config:', e);
    }
}
// Populate 'kind' dropdown when category changes
function populateArmorKinds() {
    const cat = document.getElementById('armorCategory').value;
    const kindSel = document.getElementById('armorKind');
    kindSel.innerHTML = '';
    if (cat !== 'Other' && armorConfig[cat]) {
        armorConfig[cat].kinds.forEach(kind => {
            const opt = document.createElement('option'); opt.value = kind; opt.text = kind;
            kindSel.add(opt);
        });
        const otherOpt = document.createElement('option'); otherOpt.value='Other'; otherOpt.text='Other'; kindSel.add(otherOpt);
    } else {
        const otherOpt = document.createElement('option'); otherOpt.value='Other'; otherOpt.text='Other'; kindSel.add(otherOpt);
    }
    toggleArmorKindOther();
    updateArmorClassField();
}
// Toggle freeform for armor kind
function toggleArmorKindOther() {
    const sel = document.getElementById('armorKind');
    const other = document.getElementById('armorKindOther');
    other.style.display = sel.value === 'Other' ? 'inline-block' : 'none';
}
// Calculate and update AC field based on selected armor and Dex mod
function updateArmorClassField() {
    const override = document.getElementById('overrideAC');
    const acInput = document.getElementById('armorClass');
    if (override.checked) return;
    const cat = document.getElementById('armorCategory').value;
    const kindSelect = document.getElementById('armorKind');
    let formula = '';
    if (cat !== 'Other' && armorConfig[cat] && kindSelect.selectedIndex >= 0) {
        formula = armorConfig[cat].formulas[kindSelect.selectedIndex] || '';
    }
    if (!formula) return;
    // parse base number
    const base = parseInt((formula.match(/^(\d+)/)||['0',])[1],10);
    let dexMod = calculateModifier(parseInt(document.getElementById('dexterity').value,10));
    // apply max cap
    const maxCap = formula.match(/max (\d+)/);
    if (maxCap) dexMod = Math.min(dexMod, parseInt(maxCap[1],10));
    const bonus = parseInt(document.getElementById('armorBonus').value,10) || 0;
    const finalAC = (formula.includes('Dex') ? base + dexMod : base) + bonus;
    acInput.value = finalAC;
}

// Show welcome screen
function showWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('mainEditor').style.display = 'none';
}

// Show main editor
function showMainEditor() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainEditor').style.display = 'block';
    
    // Initialize editor if not already done
    if (!document.getElementById('mainEditor').hasAttribute('data-initialized')) {
        initializeApp();
        document.getElementById('mainEditor').setAttribute('data-initialized', 'true');
    }
}

// Welcome screen functions
function showCreateOptions() {
    document.getElementById('createModal').style.display = 'flex';
}

function showImportOptions() {
    document.getElementById('importModal').style.display = 'flex';
}

function closeModals() {
    document.getElementById('createModal').style.display = 'none';
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('templateLibrary').style.display = 'none';
    document.getElementById('creatureLibraryFull').style.display = 'none';
}

// Create a blank creature once configs loaded
// Create a blank creature and show the editor immediately
function createBlankCreature() {
    // Close any modals before creating new creature
    closeModals();
    createNewCreature();
    // Show editor
    showMainEditor();
}

function showTemplateLibrary() {
    closeModals();
    // Show full creature library as template options
    document.getElementById('creatureLibraryFull').style.display = 'flex';
    if (allCreatures.length === 0) {
        loadAllCreatures();
    }
}

function showCreatureLibrary() {
    closeModals();
    document.getElementById('creatureLibraryFull').style.display = 'flex';
    if (allCreatures.length === 0) {
        loadAllCreatures();
    }
}

function loadTemplateAndStart(templateName) {
    closeModals();
    loadTemplate(templateName);
    showMainEditor();
}

// Load all creatures, prioritizing creature-list.json over directory scan
async function loadAllCreatures() {
    try {
        // First, try to load from creature-list.json
        const response = await fetch('creature-list.json');
        if (!response.ok) throw new Error('Failed to fetch creature-list.json');
        
        const creatures = await response.json();
        allCreatures = creatures;
        renderCreatureGrid(creatures);
        
    } catch (error) {
        console.error('Error loading creature-list.json, attempting to scan creatures folder:', error);
        // Fallback to scanning creatures folder
        await loadCreaturesFromFolder();
    }
}

// Load creatures by scanning the creatures folder
async function loadCreaturesFromFolder() {
    try {
        // Try to fetch the creatures directory to get a list of files
        // Note: This approach has limited browser support and may not work in all environments
        const response = await fetch('creatures/');
        if (!response.ok) throw new Error('Cannot access creatures folder');
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href$=".json"]');
        
        if (links.length === 0) {
            throw new Error('No creature files found in directory');
        }
        
        const creatures = Array.from(links).map(link => {
            const filename = link.getAttribute('href');
            const base = filename.replace('.json', '');
            const parts = base.split('_cr');
            const name = parts[0].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // Parse CR value properly
            let cr = '';
            if (parts[1]) {
                if (parts[1] === '025') cr = '1/4';
                else if (parts[1] === '18') cr = '1/8';
                else if (parts[1] === '14') cr = '1/4';
                else if (parts[1] === '12') cr = '1/2';
                else cr = parts[1];
            }
            
            // Determine creature type from name
            let type = 'unknown';
            if (name.includes('Dragon')) type = 'dragon';
            else if (name.includes('Giant') || name.includes('Ogre') || name.includes('Troll')) type = 'giant';
            else if (name.includes('Devil') || name.includes('Demon') || name.includes('Fiend')) type = 'fiend';
            else if (name.includes('Elemental')) type = 'elemental';
            else if (name.includes('Undead') || name.includes('Zombie') || name.includes('Skeleton') || name.includes('Ghost') || name.includes('Wraith') || name.includes('Vampire') || name.includes('Lich') || name.includes('Mummy')) type = 'undead';
            else if (name.includes('Bear') || name.includes('Wolf') || name.includes('Tiger') || name.includes('Lion') || name.includes('Eagle') || name.includes('Hawk') || name.includes('Snake') || name.includes('Spider') || name.includes('Rat') || name.includes('Cat') || name.includes('Dog') || name.includes('Horse') || name.includes('Elephant') || name.includes('Shark') || name.includes('Whale')) type = 'beast';
            else if (name.includes('Goblin') || name.includes('Orc') || name.includes('Human') || name.includes('Elf') || name.includes('Dwarf') || name.includes('Guard') || name.includes('Knight') || name.includes('Commoner') || name.includes('Noble') || name.includes('Bandit') || name.includes('Cultist') || name.includes('Acolyte') || name.includes('Priest')) type = 'humanoid';
            
            return { name, cr, type, filename };
        });
        
        allCreatures = creatures;
        renderCreatureGrid(creatures);
        
    } catch (error) {
        console.error('Error loading creatures from folder:', error);
        // Show error message if both methods fail
        const grid = document.getElementById('creatureLibraryGrid');
        if (grid) {
            grid.innerHTML = '<p class="loading-text">Error loading creature library. Please ensure creature-list.json exists or creatures folder is accessible.</p>';
        }
    }
}

function renderCreatureGrid(creatures) {
    const grid = document.getElementById('creatureLibraryGrid');
    grid.innerHTML = '';
    
    creatures.forEach(creature => {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.onclick = () => loadCreatureFromLibrary(creature.filename);
        
        item.innerHTML = `
            <strong>${creature.name}</strong>
            <span class="cr">CR ${creature.cr}</span>
            <small>${creature.type}</small>
        `;
        
        grid.appendChild(item);
    });
}

function filterCreatures() {
    const searchTerm = document.getElementById('creatureSearch').value.toLowerCase();
    const filtered = allCreatures.filter(creature => 
        creature.name.toLowerCase().includes(searchTerm) ||
        creature.type.toLowerCase().includes(searchTerm)
    );
    renderCreatureGrid(filtered);
}

function filterByCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let filtered = allCreatures;
    if (category !== 'all') {
        filtered = allCreatures.filter(creature => creature.type.toLowerCase().includes(category));
    }
    renderCreatureGrid(filtered);
}

async function loadCreatureFromLibrary(filename) {
    try {
        const response = await fetch(`creatures/${filename}`);
        if (!response.ok) throw new Error('Creature file not found');
        
        const creature = await response.json();
        loadCreatureFromData(creature);
        closeModals();
        showMainEditor();
        showNotification(`${creature.name} loaded successfully!`, 'success');
    } catch (error) {
        console.error('Error loading creature:', error);
        showNotification('Error loading creature file', 'error');
    }
}

// Initialize the application
function initializeApp() {
    updateAbilityModifiers();
    loadCreatureData();
    
    // Add event listeners for ability score changes
    const abilityInputs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    abilityInputs.forEach(ability => {
        document.getElementById(ability).addEventListener('input', updateAbilityModifiers);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Main editor buttons
    document.getElementById('backToWelcome').addEventListener('click', showWelcomeScreen);
    // 'New Creature' should act like Blank: reset sheet and stay in editor
    document.getElementById('newCreature').addEventListener('click', function() {
        createBlankCreature();
    });
    document.getElementById('saveJson').addEventListener('click', saveCreatureAsJson);
    document.getElementById('loadJsonBtn').addEventListener('click', () => {
        document.getElementById('loadJson').click();
    });
    document.getElementById('loadJson').addEventListener('change', loadCreatureFromJson);
    document.getElementById('toggleLibrary').addEventListener('click', toggleCreatureLibrary);
    
    // After ability and other listeners, add AC update hooks
    // Listen on armorCategory instead of old armorType ID (legacy armorType removed)
    const armorCatEl = document.getElementById('armorCategory');
    if (armorCatEl) armorCatEl.addEventListener('change', updateArmorClassField);
    document.getElementById('dexterity').addEventListener('input', updateArmorClassField);
    document.getElementById('overrideAC').addEventListener('change', function(e) {
        const acInput = document.getElementById('armorClass');
        acInput.readOnly = !e.target.checked;
        if (!e.target.checked) updateArmorClassField();
    });

    // Click-to-edit functionality
    const editableSections = ['nameSection', 'basicStatsSection', 'abilityScoresSection', 'traitsSection', 'specialAbilitiesSection', 'actionsSection', 'legendaryActionsSection'];
    editableSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        
        // Click to edit
        section.addEventListener('click', function(event) {
            editSection(sectionId, event);
        });
        
        // Save on input blur
        const inputs = section.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                saveSection(sectionId);
            });
        });
        
        // Cancel on Esc key
        section.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                cancelEdit(sectionId);
            }
        });
    });
}

// Click-to-edit functionality
let currentEditingSection = null;
let originalData = {};

// Edit section function
function editSection(sectionId, event) {
    // Prevent editing if already editing another section
    if (currentEditingSection && currentEditingSection !== sectionId) {
        return;
    }
    
    // Don't edit if clicking on input elements or buttons
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'BUTTON') {
        return;
    }
    
    const section = document.getElementById(sectionId);
    if (!section.classList.contains('editing')) {
        // Store original data before editing
        storeOriginalData(sectionId);
        
        // Enter edit mode
        section.classList.add('editing');
        // Show edit fields, hide display fields explicitly
        const disp = section.querySelector('.display-content');
        const edit = section.querySelector('.edit-content');
        if (disp) disp.style.display = 'none';
        if (edit) edit.style.display = 'block';
        currentEditingSection = sectionId;
        
        // Update display if needed
        if (sectionId === 'abilityScoresSection') {
            updateAbilityModifiers();
        }
    }
}

// Save section function
function saveSection(sectionId) {
    const section = document.getElementById(sectionId);
    
    // Update display content based on section
    updateDisplayContent(sectionId);
    
    // Exit edit mode
    // Restore display and hide edit inline
    const dispSave = section.querySelector('.display-content');
    const editSave = section.querySelector('.edit-content');
    if (dispSave) dispSave.style.display = 'block';
    if (editSave) editSave.style.display = 'none';
    section.classList.remove('editing');
    currentEditingSection = null;
    
    // Clear original data
    delete originalData[sectionId];
    
    // Update current creature data
    currentCreature = getCreatureFromForm();
    
    showNotification('Section saved successfully!', 'success');
}

// Cancel edit function
function cancelEdit(sectionId) {
    const section = document.getElementById(sectionId);
    
    // Restore original data
    restoreOriginalData(sectionId);
    
    // Exit edit mode
    // Restore display and hide edit inline
    const dispCancel = section.querySelector('.display-content');
    const editCancel = section.querySelector('.edit-content');
    if (dispCancel) dispCancel.style.display = 'block';
    if (editCancel) editCancel.style.display = 'none';
    section.classList.remove('editing');
    currentEditingSection = null;
    
    // Clear original data
    delete originalData[sectionId];
}

// Store original data before editing
function storeOriginalData(sectionId) {
    originalData[sectionId] = {};
    
    switch (sectionId) {
        case 'nameSection':
            originalData[sectionId] = {
                name: document.getElementById('creatureName').value,
                size: document.getElementById('creatureSize').value,
                type: document.getElementById('creatureType').value,
                alignment: document.getElementById('creatureAlignment').value
            };
            break;
        case 'basicStatsSection':
            originalData[sectionId] = {
                armorClass: document.getElementById('armorClass').value,
                armorType: document.getElementById('armorType').value,
                hitPoints: document.getElementById('hitPoints').value,
                hitDice: document.getElementById('hitDice').value,
                speed: document.getElementById('speed').value
            };
            break;
        case 'abilityScoresSection':
            originalData[sectionId] = {
                strength: document.getElementById('strength').value,
                dexterity: document.getElementById('dexterity').value,
                constitution: document.getElementById('constitution').value,
                intelligence: document.getElementById('intelligence').value,
                wisdom: document.getElementById('wisdom').value,
                charisma: document.getElementById('charisma').value
            };
            break;
        case 'traitsSection':
            originalData[sectionId] = {
                savingThrows: document.getElementById('savingThrows').value,
                skills: document.getElementById('skills').value,
                vulnerabilities: document.getElementById('vulnerabilities').value,
                resistances: document.getElementById('resistances').value,
                immunities: document.getElementById('immunities').value,
                conditionImmunities: document.getElementById('conditionImmunities').value,
                senses: document.getElementById('senses').value,
                languages: document.getElementById('languages').value,
                challenge: document.getElementById('challenge').value,
                proficiencyBonus: document.getElementById('proficiencyBonus').value
            };
            break;
        case 'specialAbilitiesSection':
            originalData[sectionId] = {
                abilities: getSpecialAbilities()
            };
            break;
        case 'actionsSection':
            originalData[sectionId] = {
                actions: getActions()
            };
            break;
        case 'legendaryActionsSection':
            originalData[sectionId] = {
                legendaryActions: getLegendaryActions()
            };
            break;
    }
}

// Restore original data if cancelled
function restoreOriginalData(sectionId) {
    if (!originalData[sectionId]) return;
    
    const data = originalData[sectionId];
    
    switch (sectionId) {
        case 'nameSection':
            document.getElementById('creatureName').value = data.name;
            document.getElementById('creatureSize').value = data.size;
            document.getElementById('creatureType').value = data.type;
            document.getElementById('creatureAlignment').value = data.alignment;
            break;
        case 'basicStatsSection':
            document.getElementById('armorClass').value = data.armorClass;
            document.getElementById('armorType').value = data.armorType;
            document.getElementById('hitPoints').value = data.hitPoints;
            document.getElementById('hitDice').value = data.hitDice;
            document.getElementById('speed').value = data.speed;
            break;
        case 'abilityScoresSection':
            document.getElementById('strength').value = data.strength;
            document.getElementById('dexterity').value = data.dexterity;
            document.getElementById('constitution').value = data.constitution;
            document.getElementById('intelligence').value = data.intelligence;
            document.getElementById('wisdom').value = data.wisdom;
            document.getElementById('charisma').value = data.charisma;
            updateAbilityModifiers();
            break;
        case 'traitsSection':
            document.getElementById('savingThrows').value = data.savingThrows;
            document.getElementById('skills').value = data.skills;
            document.getElementById('vulnerabilities').value = data.vulnerabilities;
            document.getElementById('resistances').value = data.resistances;
            document.getElementById('immunities').value = data.immunities;
            document.getElementById('conditionImmunities').value = data.conditionImmunities;
            document.getElementById('senses').value = data.senses;
            document.getElementById('languages').value = data.languages;
            document.getElementById('challenge').value = data.challenge;
            document.getElementById('proficiencyBonus').value = data.proficiencyBonus;
            break;
        case 'specialAbilitiesSection':
            loadSpecialAbilities(data.abilities);
            break;
        case 'actionsSection':
            loadActions(data.actions);
            break;
        case 'legendaryActionsSection':
            loadLegendaryActions(data.legendaryActions);
            break;
    }
}

// Update display content after saving
function updateDisplayContent(sectionId) {
    switch (sectionId) {
        case 'nameSection': {
            const name = document.getElementById('creatureName').value;
            const size = document.getElementById('creatureSize').value;
            // Use freeform if 'Other' selected
            const typeSelect = document.getElementById('creatureType').value;
            const type = typeSelect === 'Other'
                ? (document.getElementById('creatureTypeOther').value.trim() || 'Other')
                : typeSelect;
            const alignment = document.getElementById('creatureAlignment').value;
            document.getElementById('creatureNameDisplay').textContent = name;
            document.getElementById('creatureTypeDisplay').innerHTML = `<em>${size} ${type}, ${alignment}</em>`;
            break;
        }
            
        case 'basicStatsSection':
            const ac = document.getElementById('armorClass').value;
            const acType = document.getElementById('armorType').value;
            const hp = document.getElementById('hitPoints').value;
            const hd = document.getElementById('hitDice').value;
            const speed = document.getElementById('speed').value;
            
            document.getElementById('armorClassDisplay').textContent = `${ac}${acType ? ` (${acType})` : ''}`;
            document.getElementById('hitPointsDisplay').textContent = `${hp}${hd ? ` (${hd})` : ''}`;
            document.getElementById('speedDisplay').textContent = speed;
            break;
            
        case 'abilityScoresSection':
            const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            const displayIds = ['strDisplay', 'dexDisplay', 'conDisplay', 'intDisplay', 'wisDisplay', 'chaDisplay'];
            
            abilities.forEach((ability, index) => {
                const score = document.getElementById(ability).value;
                const modifier = calculateModifier(parseInt(score));
                const modifierText = modifier >= 0 ? `(+${modifier})` : `(${modifier})`;
                document.getElementById(displayIds[index]).textContent = `${score} ${modifierText}`;
            });
            break;
            
        case 'traitsSection':
            updateTraitDisplay('savingThrows', 'savingThrowsDisplay', 'savingThrowsLine');
            updateTraitDisplay('skills', 'skillsDisplay', 'skillsLine');
            updateTraitDisplay('vulnerabilities', 'vulnerabilitiesDisplay', 'vulnerabilitiesLine');
            updateTraitDisplay('resistances', 'resistancesDisplay', 'resistancesLine');
            updateTraitDisplay('immunities', 'immunitiesDisplay', 'immunitiesLine');
            updateTraitDisplay('conditionImmunities', 'conditionImmunitiesDisplay', 'conditionImmunitiesLine');
            updateTraitDisplay('senses', 'sensesDisplay', 'sensesLine');
            updateTraitDisplay('languages', 'languagesDisplay', 'languagesLine');
            
            const challenge = document.getElementById('challenge').value;
            const profBonus = document.getElementById('proficiencyBonus').value;
            document.getElementById('challengeDisplay').textContent = challenge;
            document.getElementById('proficiencyBonusDisplay').textContent = profBonus;
            break;
            
        case 'specialAbilitiesSection':
            updateSpecialAbilitiesDisplay();
            break;
            
        case 'actionsSection':
            updateActionsDisplay();
            break;
            
        case 'legendaryActionsSection':
            updateLegendaryActionsDisplay();
            break;
    }
}

// Helper function to update trait display
function updateTraitDisplay(inputId, displayId, lineId) {
    const value = document.getElementById(inputId).value;
    const displayElement = document.getElementById(displayId);
    const lineElement = document.getElementById(lineId);
    
    if (value.trim()) {
        displayElement.textContent = value;
        lineElement.style.display = 'block';
    } else {
        lineElement.style.display = 'none';
    }
}

// Update special abilities display
function updateSpecialAbilitiesDisplay() {
    const abilities = getSpecialAbilities();
    const displayContainer = document.getElementById('specialAbilitiesDisplay');
    
    displayContainer.innerHTML = '';
    
    abilities.forEach(ability => {
        if (ability.name || ability.description) {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability-display';
            
            const nameDisplay = document.createElement('div');
            nameDisplay.className = 'ability-name-display';
            nameDisplay.innerHTML = `<strong>${ability.name}${ability.uses ? ` (${ability.uses})` : ''}.</strong>`;
            
            const descDisplay = document.createElement('div');
            descDisplay.className = 'ability-description-display';
            descDisplay.textContent = ability.description;
            
            abilityDiv.appendChild(nameDisplay);
            abilityDiv.appendChild(descDisplay);
            displayContainer.appendChild(abilityDiv);
        }
    });
}

// Update actions display
function updateActionsDisplay() {
    const actions = getActions();
    const displayContainer = document.getElementById('actionsDisplay');
    
    displayContainer.innerHTML = '';
    
    actions.forEach(action => {
        if (action.name || action.description) {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'action-display';
            
            const nameDisplay = document.createElement('div');
            nameDisplay.className = 'action-name-display';
            nameDisplay.innerHTML = `<strong>${action.name}.</strong>`;
            
            const descDisplay = document.createElement('div');
            descDisplay.className = 'action-description-display';
            descDisplay.textContent = action.description;
            
            actionDiv.appendChild(nameDisplay);
            actionDiv.appendChild(descDisplay);
            displayContainer.appendChild(actionDiv);
        }
    });
}

// Update legendary actions display
function updateLegendaryActionsDisplay() {
    const legendaryActions = getLegendaryActions();
    const displayContainer = document.getElementById('legendaryActionsDisplay');
    
    displayContainer.innerHTML = '';
    
    legendaryActions.forEach(action => {
        if (action.name || action.description) {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'legendary-action-display';
            
            const nameDisplay = document.createElement('div');
            nameDisplay.className = 'legendary-action-name-display';
            nameDisplay.innerHTML = `<strong>${action.name}.</strong>`;
            
            const descDisplay = document.createElement('div');
            descDisplay.className = 'legendary-action-description-display';
            descDisplay.textContent = action.description;
            
            actionDiv.appendChild(nameDisplay);
            actionDiv.appendChild(descDisplay);
            displayContainer.appendChild(actionDiv);
        }
    });
}

// Initialize display content when creature is loaded
function initializeDisplayContent() {
    updateDisplayContent('nameSection');
    updateDisplayContent('basicStatsSection');
    updateDisplayContent('abilityScoresSection');
    updateDisplayContent('traitsSection');
    updateDisplayContent('specialAbilitiesSection');
    updateDisplayContent('actionsSection');
    updateDisplayContent('legendaryActionsSection');
}

// Load creature data from object
function loadCreatureFromData(creature) {
    // Update form fields with creature data
    document.getElementById('creatureName').value = creature.name || '';
    document.getElementById('creatureSize').value = creature.size || '';
    document.getElementById('creatureType').value = creature.type || '';
    document.getElementById('creatureAlignment').value = creature.alignment || '';
    
    document.getElementById('armorClass').value = creature.armor_class || '';
    // Set armor category and kind based on armor_type
    const catSelect = document.getElementById('armorCategory');
    const kindSelect = document.getElementById('armorKind');
    const otherInput = document.getElementById('armorKindOther');
    const armorType = creature.armor_type || '';
    let found = false;
    for (const cat in armorConfig) {
        if (armorConfig[cat].kinds.includes(armorType)) {
            catSelect.value = cat;
            populateArmorKinds();
            kindSelect.value = armorType;
            found = true;
            break;
        }
    }
    if (!found) {
        catSelect.value = 'Other';
        populateArmorKinds();
        kindSelect.value = 'Other';
        otherInput.value = armorType;
        otherInput.style.display = 'inline-block';
    }
    // Set bonus if available
    document.getElementById('armorBonus').value = creature.armor_bonus || '0';
    updateArmorClassField();
    document.getElementById('hitPoints').value = creature.hit_points || '';
    document.getElementById('hitDice').value = creature.hit_dice || '';
    document.getElementById('speed').value = creature.speed || '';
    
    // Ability scores
    document.getElementById('strength').value = creature.strength || 10;
    document.getElementById('dexterity').value = creature.dexterity || 10;
    document.getElementById('constitution').value = creature.constitution || 10;
    document.getElementById('intelligence').value = creature.intelligence || 10;
    document.getElementById('wisdom').value = creature.wisdom || 10;
    document.getElementById('charisma').value = creature.charisma || 10;
    
    // Traits
    document.getElementById('savingThrows').value = creature.saving_throws || '';
    document.getElementById('skills').value = creature.skills || '';
    document.getElementById('vulnerabilities').value = creature.vulnerabilities || '';
    document.getElementById('resistances').value = creature.resistances || '';
    document.getElementById('immunities').value = creature.immunities || '';
    document.getElementById('conditionImmunities').value = creature.condition_immunities || '';
    document.getElementById('senses').value = creature.senses || '';
    document.getElementById('languages').value = creature.languages || '';
    document.getElementById('challenge').value = creature.challenge || '';
    document.getElementById('proficiencyBonus').value = creature.proficiency_bonus || '';
    
    // Load special abilities
    loadSpecialAbilities(creature.special_abilities || []);
    
    // Load actions
    loadActions(creature.actions || []);
    
    // Load legendary actions
    loadLegendaryActions(creature.legendary_actions || []);
    
    // Update display content
    updateAbilityModifiers();
    initializeDisplayContent();
    
    // Store current creature
    currentCreature = creature;
}

// Calculate ability modifier
function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}

// Update ability modifiers
function updateAbilityModifiers() {
    const abilities = [
        { id: 'strength', modId: 'strMod' },
        { id: 'dexterity', modId: 'dexMod' },
        { id: 'constitution', modId: 'conMod' },
        { id: 'intelligence', modId: 'intMod' },
        { id: 'wisdom', modId: 'wisMod' },
        { id: 'charisma', modId: 'chaMod' }
    ];
    
    abilities.forEach(ability => {
        const scoreElement = document.getElementById(ability.id);
        const modElement = document.getElementById(ability.modId);
        
        if (scoreElement && modElement) {
            const score = parseInt(scoreElement.value) || 10;
            const modifier = calculateModifier(score);
            const modifierText = modifier >= 0 ? `(+${modifier})` : `(${modifier})`;
            modElement.textContent = modifierText;
        }
    });
}

// Get special abilities from form
function getSpecialAbilities() {
    const abilities = [];
    const abilityItems = document.querySelectorAll('#specialAbilities .ability-item');
    
    abilityItems.forEach(item => {
        const name = item.querySelector('.ability-name')?.value || '';
        const uses = item.querySelector('.ability-use-count')?.value || '';
        const description = item.querySelector('.ability-description')?.value || '';
        
        if (name || description) {
            abilities.push({ name, uses, description });
        }
    });
    
    return abilities;
}

// Get actions from form
function getActions() {
    const actions = [];
    const actionItems = document.querySelectorAll('#actions .action-item');
    
    actionItems.forEach(item => {
        const name = item.querySelector('.action-name')?.value || '';
        const description = item.querySelector('.action-description')?.value || '';
        
        if (name || description) {
            actions.push({ name, description });
        }
    });
    
    return actions;
}

// Get legendary actions from form
function getLegendaryActions() {
    const legendaryActions = [];
    const actionItems = document.querySelectorAll('#legendaryActions .legendary-action-item');
    
    actionItems.forEach(item => {
        const name = item.querySelector('.legendary-action-name')?.value || '';
        const description = item.querySelector('.legendary-action-description')?.value || '';
        
        if (name || description) {
            legendaryActions.push({ name, description });
        }
    });
    
    return legendaryActions;
}

// Load special abilities into form
function loadSpecialAbilities(abilities) {
    const container = document.getElementById('specialAbilities');
    container.innerHTML = '';
    
    abilities.forEach(ability => {
        addSpecialAbility(ability);
    });
    
    if (abilities.length === 0) {
        addSpecialAbility();
    }
}

// Load actions into form
function loadActions(actions) {
    const container = document.getElementById('actions');
    container.innerHTML = '';
    
    actions.forEach(action => {
        addAction(action);
    });
    
    if (actions.length === 0) {
        addAction();
    }
}

// Load legendary actions into form
function loadLegendaryActions(legendaryActions) {
    const container = document.getElementById('legendaryActions');
    container.innerHTML = '';
    
    legendaryActions.forEach(action => {
        addLegendaryAction(action);
    });
    
    if (legendaryActions.length === 0) {
        addLegendaryAction();
    }
}

// Add special ability
function addSpecialAbility(ability = {}) {
    const container = document.getElementById('specialAbilities');
    const div = document.createElement('div');
    div.className = 'ability-item';
    div.innerHTML = `
        <input type="text" class="ability-name" placeholder="Ability Name" value="${ability.name || ''}">
        <span class="ability-uses">(<input type="text" class="ability-use-count" placeholder="uses" value="${ability.uses || ''}">)</span>
        <button class="btn btn-small" onclick="removeElement(this.parentElement)" style="float: right; background: #dc3545; color: white;">Remove</button>
        <textarea class="ability-description" placeholder="Ability description">${ability.description || ''}</textarea>
    `;
    container.appendChild(div);
}

// Add action
function addAction(action = {}) {
    const container = document.getElementById('actions');
    const div = document.createElement('div');
    div.className = 'action-item';
    div.innerHTML = `
        <input type="text" class="action-name" placeholder="Action Name" value="${action.name || ''}">
        <button class="btn btn-small" onclick="removeElement(this.parentElement)" style="float: right; background: #dc3545; color: white;">Remove</button>
        <textarea class="action-description" placeholder="Action description">${action.description || ''}</textarea>
    `;
    container.appendChild(div);
}

// Add legendary action
function addLegendaryAction(action = {}) {
    const container = document.getElementById('legendaryActions');
    const div = document.createElement('div');
    div.className = 'legendary-action-item';
    div.innerHTML = `
        <input type="text" class="legendary-action-name" placeholder="Action Name" value="${action.name || ''}">
        <button class="btn btn-small" onclick="removeElement(this.parentElement)" style="float: right; background: #dc3545; color: white;">Remove</button>
        <textarea class="legendary-action-description" placeholder="Action description">${action.description || ''}</textarea>
    `;
    container.appendChild(div);
}

// Remove element
function removeElement(element) {
    element.remove();
}

// Get creature data from form
function getCreatureFromForm() {
    return {
        name: document.getElementById('creatureName').value,
        size: document.getElementById('creatureSize').value,
        type: (function() {
            const sel = document.getElementById('creatureType');
            return sel.value === 'Other' ? document.getElementById('creatureTypeOther').value : sel.value;
        })(),
        alignment: document.getElementById('creatureAlignment').value,
        armor_class: document.getElementById('armorClass').value,
        armor_type: (function() {
            const kindSel = document.getElementById('armorKind');
            const other = document.getElementById('armorKindOther');
            if (!kindSel) return '';
            return kindSel.value === 'Other' ? (other.value || '') : kindSel.value;
        })(),
        hit_points: document.getElementById('hitPoints').value,
        hit_dice: document.getElementById('hitDice').value,
        speed: document.getElementById('speed').value,
        strength: parseInt(document.getElementById('strength').value) || 10,
        dexterity: parseInt(document.getElementById('dexterity').value) || 10,
        constitution: parseInt(document.getElementById('constitution').value) || 10,
        intelligence: parseInt(document.getElementById('intelligence').value) || 10,
        wisdom: parseInt(document.getElementById('wisdom').value) || 10,
        charisma: parseInt(document.getElementById('charisma').value) || 10,
        saving_throws: document.getElementById('savingThrows').value,
        skills: document.getElementById('skills').value,
        vulnerabilities: document.getElementById('vulnerabilities').value,
        resistances: document.getElementById('resistances').value,
        immunities: document.getElementById('immunities').value,
        condition_immunities: document.getElementById('conditionImmunities').value,
        senses: document.getElementById('senses').value,
        languages: document.getElementById('languages').value,
        challenge: document.getElementById('challenge').value,
        proficiency_bonus: document.getElementById('proficiencyBonus').value,
        special_abilities: getSpecialAbilities(),
        actions: getActions(),
        legendary_actions: getLegendaryActions()
    };
}

// Create new creature
function createNewCreature() {
    const blankCreature = {
        name: 'New Creature',
        size: 'Medium',
        type: 'humanoid',
        alignment: 'neutral',
        armor_class: 10,
        armor_type: '',
        hit_points: 1,
        hit_dice: '1d8',
        speed: '30 ft.',
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        saving_throws: '',
        skills: '',
        vulnerabilities: '',
        resistances: '',
        immunities: '',
        condition_immunities: '',
        senses: 'passive Perception 10',
        languages: 'Common',
        challenge: '1/4 (50 XP)',
        proficiency_bonus: '+2',
        special_abilities: [],
        actions: [],
        legendary_actions: []
    };
    
    loadCreatureFromData(blankCreature);
}

// Load creature data (for initialization)
function loadCreatureData() {
    // Initialize with a default creature if none exists
    if (!currentCreature.name) {
        createNewCreature();
    }
}

// Save creature as JSON
function saveCreatureAsJson() {
    const creature = getCreatureFromForm();
    const dataStr = JSON.stringify(creature, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${creature.name.toLowerCase().replace(/\s+/g, '_')}_cr${creature.challenge.split(' ')[0].replace('/', '')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Load creature from JSON file
function loadCreatureFromJson(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const creature = JSON.parse(e.target.result);
                loadCreatureFromData(creature);
                showNotification(`${creature.name} loaded successfully!`, 'success');
            } catch (error) {
                showNotification('Error loading JSON file', 'error');
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Toggle creature library
function toggleCreatureLibrary() {
    const library = document.getElementById('creatureLibrary');
    library.style.display = library.style.display === 'none' ? 'block' : 'none';
}

// Load template
function loadTemplate(templateName) {
    // This would typically load from a template file
    console.log('Loading template:', templateName);
    showNotification(`Loading ${templateName} template...`, 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
// Helper to load dropdown options from JSON
async function loadDropdown(selectId, jsonPath) {
    try {
        const resp = await fetch(jsonPath);
        const items = await resp.json();
        const sel = document.getElementById(selectId);
        sel.innerHTML = '';
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.text = item;
            sel.add(opt);
        });
    } catch (e) {
        console.error(`Failed to load dropdown ${selectId} from ${jsonPath}:`, e);
    }
}
