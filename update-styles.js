const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');

// Find the styles section and add backgroundImage and update header
const stylesPattern = /const styles = StyleSheet\.create\(\{/;

// Add backgroundImage style and make header transparent
const newStyles = `const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },`;

content = content.replace(stylesPattern, newStyles);

// Update header style to be transparent
content = content.replace(
    /header: \{[\s\S]*?flexDirection: 'row',[\s\S]*?\},/,
    `header: {
    backgroundColor: 'transparent',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },`
);

fs.writeFileSync('App.js', content, 'utf8');
console.log('Styles updated successfully!');
