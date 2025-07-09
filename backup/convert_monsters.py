import json
import re
import os
from html import unescape

def clean_html(html_text):
    """Remove HTML tags and convert HTML entities to plain text."""
    if not html_text:
        return ""
    
    # Remove HTML tags
    clean = re.sub('<.*?>', '', html_text)
    # Convert HTML entities
    clean = unescape(clean)
    # Clean up extra whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def parse_meta(meta_string):
    """Parse the meta string to extract size, type, and alignment."""
    parts = meta_string.split(', ')
    if len(parts) >= 2:
        size_type = parts[0].strip()
        alignment = ', '.join(parts[1:]).strip()
        
        # Split size and type
        size_type_parts = size_type.split(' ', 1)
        if len(size_type_parts) == 2:
            size = size_type_parts[0].strip()
            type_name = size_type_parts[1].strip()
        else:
            size = "Medium"
            type_name = size_type_parts[0].strip()
    else:
        size = "Medium"
        type_name = "humanoid"
        alignment = "neutral"
    
    return size, type_name, alignment

def parse_armor_class(ac_string):
    """Parse armor class string to extract AC number and type."""
    ac_match = re.search(r'(\d+)', ac_string)
    ac_number = int(ac_match.group(1)) if ac_match else 10
    
    # Extract armor type from parentheses
    armor_type_match = re.search(r'\(([^)]+)\)', ac_string)
    armor_type = armor_type_match.group(1) if armor_type_match else ""
    
    return ac_number, armor_type

def parse_hit_points(hp_string):
    """Parse hit points string to extract HP number and dice formula."""
    hp_match = re.search(r'(\d+)', hp_string)
    hp_number = int(hp_match.group(1)) if hp_match else 1
    
    # Extract dice formula from parentheses
    dice_match = re.search(r'\(([^)]+)\)', hp_string)
    dice_formula = dice_match.group(1) if dice_match else "1d8"
    
    return hp_number, dice_formula

def parse_challenge(challenge_string):
    """Parse challenge rating string."""
    return challenge_string.strip()

def extract_proficiency_bonus(challenge_string):
    """Extract proficiency bonus from challenge rating."""
    cr_match = re.search(r'(\d+(?:/\d+)?)', challenge_string)
    if cr_match:
        cr = cr_match.group(1)
        if '/' in cr:
            cr_num = eval(cr)  # Convert fraction to decimal
        else:
            cr_num = int(cr)
        
        # Calculate proficiency bonus based on CR
        if cr_num >= 17:
            return "+6"
        elif cr_num >= 13:
            return "+5"
        elif cr_num >= 9:
            return "+4"
        elif cr_num >= 5:
            return "+3"
        else:
            return "+2"
    return "+2"

def parse_abilities_and_actions(html_text):
    """Parse HTML text to extract abilities and actions."""
    if not html_text:
        return []
    
    items = []
    # Split by paragraphs
    paragraphs = re.split(r'</p>\s*<p>', html_text)
    
    for paragraph in paragraphs:
        # Clean HTML
        clean_text = clean_html(paragraph)
        if not clean_text:
            continue
        
        # Look for ability/action name in bold/italic
        name_match = re.search(r'^([^.]+?)\.', clean_text)
        if name_match:
            name = name_match.group(1).strip()
            description = clean_text[len(name_match.group(0)):].strip()
            
            # Extract usage information
            usage_match = re.search(r'\(([^)]*(?:\d+[^)]*Day|Recharge[^)]*|at will[^)]*|Costs[^)]*Actions?)[^)]*)\)', name)
            usage = usage_match.group(1) if usage_match else ""
            
            # Clean the name
            name = re.sub(r'\([^)]*\)', '', name).strip()
            
            items.append({
                "name": name,
                "uses": usage,
                "description": description
            })
    
    return items

def sanitize_filename(name):
    """Create a safe filename from monster name."""
    # Remove/replace problematic characters
    filename = re.sub(r'[<>:"/\\|?*]', '', name)
    filename = re.sub(r'\s+', '_', filename)
    filename = filename.lower()
    return filename

def convert_monster(monster_data):
    """Convert a monster from the source format to our editor format."""
    
    # Parse meta information
    size, type_name, alignment = parse_meta(monster_data.get('meta', ''))
    
    # Parse armor class
    ac_number, armor_type = parse_armor_class(monster_data.get('Armor Class', '10'))
    
    # Parse hit points
    hp_number, dice_formula = parse_hit_points(monster_data.get('Hit Points', '1'))
    
    # Parse challenge rating
    challenge = parse_challenge(monster_data.get('Challenge', '1/8 (25 XP)'))
    proficiency_bonus = extract_proficiency_bonus(challenge)
    
    # Parse special abilities from Traits
    special_abilities = parse_abilities_and_actions(monster_data.get('Traits', ''))
    
    # Parse actions
    actions = parse_abilities_and_actions(monster_data.get('Actions', ''))
    
    # Parse legendary actions
    legendary_actions = parse_abilities_and_actions(monster_data.get('Legendary Actions', ''))
    
    # Create the converted monster
    converted_monster = {
        "name": monster_data.get('name', 'Unknown Monster'),
        "size": size,
        "type": type_name,
        "alignment": alignment,
        "armorClass": ac_number,
        "armorType": armor_type,
        "hitPoints": hp_number,
        "hitDice": dice_formula,
        "speed": monster_data.get('Speed', '30 ft.').strip(),
        "abilities": {
            "strength": int(monster_data.get('STR', '10')),
            "dexterity": int(monster_data.get('DEX', '10')),
            "constitution": int(monster_data.get('CON', '10')),
            "intelligence": int(monster_data.get('INT', '10')),
            "wisdom": int(monster_data.get('WIS', '10')),
            "charisma": int(monster_data.get('CHA', '10'))
        },
        "savingThrows": monster_data.get('Saving Throws', ''),
        "skills": monster_data.get('Skills', ''),
        "vulnerabilities": monster_data.get('Damage Vulnerabilities', ''),
        "resistances": monster_data.get('Damage Resistances', ''),
        "immunities": monster_data.get('Damage Immunities', ''),
        "conditionImmunities": monster_data.get('Condition Immunities', ''),
        "senses": monster_data.get('Senses', ''),
        "languages": monster_data.get('Languages', ''),
        "challenge": challenge,
        "proficiencyBonus": proficiency_bonus,
        "specialAbilities": special_abilities,
        "actions": actions,
        "legendaryActions": legendary_actions
    }
    
    return converted_monster

def main():
    # Load the monsters.json file
    input_file = r'c:\git\DND_Character_Gen\tests\monsters.json'
    output_dir = r'c:\git\DND_Monster_Sheet\monsters'
    
    print("Loading monsters from:", input_file)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        monsters_data = json.load(f)
    
    print(f"Found {len(monsters_data)} monsters to convert.")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert each monster
    converted_count = 0
    for monster_data in monsters_data:
        try:
            # Convert the monster
            converted_monster = convert_monster(monster_data)
            
            # Create filename
            monster_name = converted_monster['name']
            safe_name = sanitize_filename(monster_name)
            
            # Extract CR for filename
            cr_match = re.search(r'(\d+(?:/\d+)?)', converted_monster['challenge'])
            cr = cr_match.group(1).replace('/', '') if cr_match else 'unknown'
            
            filename = f"{safe_name}_cr{cr}.json"
            filepath = os.path.join(output_dir, filename)
            
            # Write the converted monster to file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(converted_monster, f, indent=2, ensure_ascii=False)
            
            converted_count += 1
            print(f"Converted: {monster_name} -> {filename}")
            
        except Exception as e:
            print(f"Error converting {monster_data.get('name', 'Unknown')}: {str(e)}")
    
    print(f"\nConversion complete! {converted_count} monsters converted.")
    print(f"Files saved to: {output_dir}")

if __name__ == "__main__":
    main()
