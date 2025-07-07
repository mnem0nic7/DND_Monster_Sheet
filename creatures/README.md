# Creature JSON Files

This folder contains 327 saved creature JSON files created from the official D&D 5e Monster Manual, converted to work with the D&D Creature Sheet Editor.

## Complete Creature Library

This collection includes all classic D&D creatures from CR 0 to CR 30, including:

- **Dragons**: All chromatic and metallic dragons from wyrmlings to ancient
- **Fiends**: Devils, demons, and other infernal creatures
- **Undead**: Skeletons, zombies, vampires, liches, and more
- **Beasts**: Natural animals and giant versions
- **Humanoids**: NPCs, guards, cultists, and tribal creatures
- **Aberrations**: Mind flayers, beholders, and alien horrors
- **Elementals**: Fire, water, earth, and air elementals
- **Fey**: Sprites, dryads, and other magical creatures
- **Giants**: Hill, stone, frost, fire, cloud, and storm giants
- **Monstrosities**: Owlbears, manticores, and other magical beasts
- **Constructs**: Golems, animated objects, and magical guardians

## File Organization

Creature files are saved with the following naming convention:
- `{creature_name}_cr{challenge_rating}.json`
- Examples: `goblin_cr025.json`, `adult_red_dragon_cr17.json`, `tarrasque_cr30.json`
- Spaces in names are replaced with underscores
- Special characters are removed for file system compatibility

## Creature Data Format

Each JSON file contains the complete creature stat block including:

- Basic information (name, size, type, alignment)
- Combat stats (AC, HP, speed, abilities)
- Ability scores with calculated modifiers
- Skills, saves, resistances, immunities, and senses
- Special abilities, actions, and legendary actions
- Challenge rating and experience points
- Proper formatting for the D&D Creature Sheet Editor

## Usage

To load a creature from this library:
1. Open the D&D Creature Sheet Editor (`index.html`)
2. Click "Load JSON" button
3. Navigate to this folder and select any creature file
4. The creature will be loaded and ready for editing

## Popular Creatures

Some of the most commonly used creatures in this collection:
- `goblin_cr025.json` - Classic low-level enemy
- `orc_cr12.json` - Common humanoid threat
- `owlbear_cr3.json` - Iconic D&D creature
- `adult_red_dragon_cr17.json` - Classic high-level boss
- `tarrasque_cr30.json` - The ultimate challenge

## Sharing Creatures

These JSON files can be easily shared with other DMs and players. The format is compatible with the D&D Creature Sheet Editor and can be loaded into any instance of the application.

## Converting from Other Sources

The creatures in this library were converted from the official D&D 5e sources using the `convert_monsters.py` script. The conversion process:
1. Parses HTML-formatted creature data
2. Extracts and cleans ability descriptions
3. Converts to the Creature Sheet Editor format
4. Saves individual JSON files with consistent naming

Total creatures: **327** creatures from CR 0 to CR 30
