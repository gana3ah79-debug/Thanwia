from pathlib import Path
import sys
p=Path(sys.argv[1]);s=p.read_text()
if '</Tabs>' in s and 'name="engagement"' not in s:
    p.write_text(s.replace('</Tabs>','  <Tabs.Screen name="engagement" options={{ title: "مركز اللعب", headerShown: false }} />\n</Tabs>',1))
