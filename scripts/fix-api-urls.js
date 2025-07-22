#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all .js and .jsx files
function findFiles(dir, extension = ['.js', '.jsx']) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (file !== 'node_modules' && file !== 'build' && file !== 'dist') {
        results = results.concat(findFiles(filePath, extension));
      }
    } else if (extension.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to replace localhost URLs in a file
function replaceLocalhostUrls(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if file needs API_BASE_URL import
    const hasLocalhostApi = content.includes('http://localhost:5001/api/');
    const hasApiImport = content.includes('API_BASE_URL');
    
    if (hasLocalhostApi && !hasApiImport) {
      // Add import at the top (after other imports)
      const importLines = content.split('\n');
      let insertIndex = 0;
      
      // Find the last import line
      for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].startsWith('import ')) {
          insertIndex = i + 1;
        }
      }
      
      // Insert the API import
      importLines.splice(insertIndex, 0, "import { API_BASE_URL } from '../config/api';");
      content = importLines.join('\n');
      modified = true;
    }
    
    // Replace all localhost API URLs
    const originalContent = content;
    content = content.replace(/http:\/\/localhost:5001\/api/g, '${API_BASE_URL}');
    
    // If we used template literals, we need to convert to template strings
    if (content !== originalContent) {
      // Convert fetch('${API_BASE_URL}/...') to fetch(`${API_BASE_URL}/...`)
      content = content.replace(/fetch\('(\$\{API_BASE_URL\}[^']+)'\)/g, 'fetch(`$1`)');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('Updating localhost URLs to use API_BASE_URL...');

const clientSrcDir = path.join(__dirname, '..', 'client', 'src');
const files = findFiles(clientSrcDir);

let updatedCount = 0;
files.forEach(file => {
  if (replaceLocalhostUrls(file)) {
    updatedCount++;
  }
});

console.log(`\nCompleted! Updated ${updatedCount} files.`);
