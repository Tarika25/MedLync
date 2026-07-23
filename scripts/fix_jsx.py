 import re

path = 'c:/Users/Tarika/Downloads/rx-guardian-main/rx-guardian-main/src/pages/Signup.tsx'

with open(path, 'r') as f:
    lines = f.readlines()

# Find the problematic section - the closing div for space-y-2 is missing
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == '</>' and i > 0:
        prev = lines[i-1].strip()
        if prev == '</div>':
            lines.insert(i, '                  </div>\n')
            with open(path, 'w') as f:
                f.writelines(lines)
            print(f'Fixed: added missing </div> at line {i+1}')
            break
else:
    print('Pattern not found. Showing relevant section:')
    for i, line in enumerate(lines):
        if 220 <= i <= 250:
            print(f'{i+1}: {line}', end='')
</｜｜DSML｜｜parameter>
</create_file>
