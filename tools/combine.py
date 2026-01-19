import os
import json

folder_path = './src/characters'
all_characters = []

for filename in os.listdir(folder_path):
    if filename.endswith('.json'):
        filepath = os.path.join(folder_path, filename)

        with open(filepath, 'r') as file:
            try:
                data = json.load(file)
                if isinstance(data, list):
                    all_characters.extend(data)
                else:
                    all_characters.append(data)

                print(f"✅ Loaded: {filename}")
            except json.JSONDecodeError:
                print(f"❌ Error in file: {filename}")

all_characters.sort(key=lambda x: x.get('id', 999))

with open('src/characters.json', 'w') as outfile:
    json.dump(all_characters, outfile, indent=2)

print(f"🎉 Success! Sorted and combined {len(all_characters)} characters.")