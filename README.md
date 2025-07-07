# D&D Creature Sheet Editor

A web-based D&D creature sheet editor that allows you to create, edit, and save creature stat blocks in JSON format. The application features a beautiful, authentic D&D-style design that mimics official creature stat blocks.

## Features

- **Complete Creature Stat Block Editor**: Edit all aspects of a D&D creature including:
  - Basic information (name, size, type, alignment)
  - Combat stats (AC, HP, speed)
  - Ability scores with automatic modifier calculation
  - Skills, saves, resistances, immunities, and senses
  - Special abilities with usage tracking
  - Actions and legendary actions
  - Challenge rating and proficiency bonus

- **Automatic Calculations**: 
  - Ability modifiers are calculated automatically from ability scores
  - Clean, intuitive interface for all stat management

- **Save & Load Functionality**:
  - Save creatures as JSON files for easy sharing and backup
  - Load previously saved creatures from JSON files
  - Create new creatures with default templates

- **Responsive Design**: 
  - Works on desktop, tablet, and mobile devices
  - Authentic D&D styling with parchment-like appearance
  - Professional typography using Cinzel and Open Sans fonts

- **Dynamic Content Management**:
  - Add/remove special abilities as needed
  - Add/remove actions and legendary actions
  - Flexible form that adapts to your creature's complexity

## How to Use

1. **Getting Started**: Open `index.html` in your web browser
2. **Edit Creature**: Modify any field to customize your creature
3. **Add Abilities/Actions**: Use the "+" buttons to add new special abilities, actions, or legendary actions
4. **Save Your Work**: Click "Save JSON" to download your creature as a JSON file
5. **Load Previous Work**: Click "Load JSON" to import a previously saved creature
6. **Start Fresh**: Click "New Creature" to create a blank creature template

## Technical Details

The application is built with:
- **HTML5**: Semantic structure and form elements
- **CSS3**: Modern styling with flexbox/grid layouts and responsive design
- **Vanilla JavaScript**: No external dependencies, pure JavaScript functionality
- **JSON**: Standard format for saving/loading creature data

## File Structure

```
├── index.html          # Main application HTML
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md          # This documentation file
```

## JSON Creature Format

The application saves creatures in a structured JSON format that includes:

```json
{
  "name": "Creature Name",
  "size": "Medium",
  "type": "humanoid",
  "alignment": "neutral",
  "armorClass": 15,
  "armorType": "chain mail",
  "hitPoints": 58,
  "hitDice": "9d8 + 18",
  "speed": "30 ft.",
  "abilities": {
    "strength": 16,
    "dexterity": 13,
    "constitution": 14,
    "intelligence": 10,
    "wisdom": 11,
    "charisma": 10
  },
  "specialAbilities": [...],
  "actions": [...],
  "legendaryActions": [...]
}
```

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Getting Started

Simply open `index.html` in your web browser - no installation or setup required!

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is licensed under the terms specified in the LICENSE file.