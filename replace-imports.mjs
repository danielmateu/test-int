import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('c:/Users/Daniel/Desktop/test/app/[locale]', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace next/link
    if (content.includes('import Link from "next/link"')) {
      content = content.replace('import Link from "next/link"', 'import { Link } from "@/i18n/routing"');
      changed = true;
    } else if (content.includes("import Link from 'next/link'")) {
      content = content.replace("import Link from 'next/link'", 'import { Link } from "@/i18n/routing"');
      changed = true;
    }
    
    // Replace useRouter, redirect, usePathname from next/navigation
    if (content.match(/import\s+{([^}]*)}\s+from\s+["']next\/navigation["']/)) {
      let match = content.match(/import\s+{([^}]*)}\s+from\s+["']next\/navigation["']/);
      let imports = match[1];
      let newNavigationImports = [];
      let newI18nImports = [];
      
      imports.split(',').forEach(imp => {
        let name = imp.trim();
        if (['useRouter', 'redirect', 'usePathname'].includes(name)) {
          newI18nImports.push(name);
        } else if (name) {
          newNavigationImports.push(name);
        }
      });
      
      let replacement = '';
      if (newNavigationImports.length > 0) {
        replacement += `import { ${newNavigationImports.join(', ')} } from "next/navigation";\n`;
      }
      if (newI18nImports.length > 0) {
        replacement += `import { ${newI18nImports.join(', ')} } from "@/i18n/routing";\n`;
      }
      
      content = content.replace(/import\s+{([^}]*)}\s+from\s+["']next\/navigation["'];?/, replacement.trim());
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log('Updated:', filePath);
    }
  }
});
