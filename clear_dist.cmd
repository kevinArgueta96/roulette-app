if not exist dist mkdir dist
attrib +h dist
del /q dist\*
for /d %%x in (dist\*) do @rd /s /q "%%x"

if not exist dist_electron mkdir dist_electron
attrib +h dist_electron
del /q dist_electron\*
for /d %%x in (dist_electron\*) do @rd /s /q "%%x"

