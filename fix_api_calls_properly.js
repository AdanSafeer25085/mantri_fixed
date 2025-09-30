import fs from 'fs';
import path from 'path';

const srcDir = '/Users/kpklaptops/Desktop/adiii/complete_migration/construction_supabase_migrated/src/frontend';

// Files to fix and their required Supabase API imports
const fileMapping = {
  'CustomerList.jsx': ['customersApi'],
  'AddStock.jsx': ['stocksApi', 'materialsApi', 'vendorsApi', 'contractorsApi'],
  'task.jsx': ['tasksApi'],
  'AddLead.jsx': ['leadsApi', 'projectsApi'],
  'Unit.jsx': ['unitsApi'],
  'Projectoverview.jsx': ['projectsApi'],
  'AddVendor.jsx': ['vendorsApi'],
  'Vendors.jsx': ['vendorsApi'],
  'AddFinance.jsx': ['financesApi', 'projectsApi', 'customersApi', 'contractorsApi', 'vendorsApi'],
  'reports.jsx': ['projectsApi', 'financesApi'],
  'ProjectProgress.jsx': ['projectsApi', 'activitiesApi', 'materialsApi', 'tasksApi'],
  'contractor.jsx': ['contractorsApi'],
  'AddMaterial.jsx': ['materialsApi', 'activitiesApi', 'unitsApi'],
  'Material.jsx': ['materialsApi'],
  'AdminForm.jsx': ['adminsApi', 'authApi'],
  'StockManagement.jsx': ['stocksApi'],
  'projectfile2.jsx': ['activitiesApi', 'tasksApi'],
  'LeadList.jsx': ['leadsApi'],
  'Gantchart.jsx': ['projectsApi', 'activitiesApi', 'tasksApi'],
  'AddUnit.jsx': ['unitsApi'],
  'AddTask.jsx': ['activitiesApi', 'tasksApi', 'projectsApi'],
  'admin.jsx': ['adminsApi'],
  'ProjectFinance.jsx': ['financesApi', 'projectsApi'],
  'activity.jsx': ['activitiesApi'],
  'TechnicalFiles.jsx': ['filesApi'],
  'addactivity.jsx': ['activitiesApi', 'projectsApi'],
  'addcontractor.jsx': ['contractorsApi', 'activitiesApi'],
  'LegalFiles.jsx': ['filesApi'],
  'profile.jsx': ['authApi', 'adminsApi'],
  'addcustomer.jsx': ['customersApi', 'projectsApi']
};

function fixFile(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const apis = fileMapping[fileName] || [];

    // Check if Supabase import already exists
    const hasSupabaseImport = content.includes('from "../lib/supabase"');

    // Add Supabase import if not present
    if (!hasSupabaseImport && apis.length > 0) {
      const importLine = `import { ${apis.join(', ')} } from "../lib/supabase";\n`;

      // Find the last import statement
      const importRegex = /import\s+.*?from\s+['"].*?['"];?\s*$/gm;
      const matches = [...content.matchAll(importRegex)];

      if (matches.length > 0) {
        const lastImport = matches[matches.length - 1];
        const insertPos = lastImport.index + lastImport[0].length;
        content = content.slice(0, insertPos) + '\n' + importLine + content.slice(insertPos);
        hasChanges = true;
      } else {
        // If no imports found, add at the beginning
        content = importLine + '\n' + content;
        hasChanges = true;
      }
    }

    // Fix fetch calls - GET requests
    const apiMap = {
      'projects': 'projectsApi',
      'activities': 'activitiesApi',
      'tasks': 'tasksApi',
      'materials': 'materialsApi',
      'units': 'unitsApi',
      'contractors': 'contractorsApi',
      'vendors': 'vendorsApi',
      'customers': 'customersApi',
      'stocks': 'stocksApi',
      'finances': 'financesApi',
      'leads': 'leadsApi',
      'admins': 'adminsApi'
    };

    // Pattern 1: Simple fetch with response variable
    content = content.replace(
      /const\s+response\s*=\s*await\s+fetch\(\s*['"`]http:\/\/localhost:8000\/api\/(\w+)['"`]\s*\)/g,
      (match, endpoint) => {
        hasChanges = true;
        return `const data = await ${apiMap[endpoint] || 'projectsApi'}.getAll()`;
      }
    );

    // Pattern 2: Fetch with specific ID
    content = content.replace(
      /const\s+response\s*=\s*await\s+fetch\(\s*`http:\/\/localhost:8000\/api\/(\w+)\/\$\{([^}]+)\}`\s*\)/g,
      (match, endpoint, idVar) => {
        hasChanges = true;
        return `const data = await ${apiMap[endpoint] || 'projectsApi'}.getById(${idVar})`;
      }
    );

    // Pattern 3: DELETE requests
    content = content.replace(
      /await\s+fetch\(\s*`http:\/\/localhost:8000\/api\/(\w+)\/\$\{([^}]+)\}`\s*,\s*\{\s*method:\s*["']DELETE["']\s*\}\s*\)/g,
      (match, endpoint, idVar) => {
        hasChanges = true;
        return `await ${apiMap[endpoint] || 'projectsApi'}.delete(${idVar})`;
      }
    );

    // Pattern 4: POST requests
    content = content.replace(
      /const\s+response\s*=\s*await\s+fetch\(\s*['"`]http:\/\/localhost:8000\/api\/(\w+)['"`]\s*,\s*\{[^}]*method:\s*["']POST["'][^}]*body:\s*JSON\.stringify\(([^)]+)\)[^}]*\}\s*\)/g,
      (match, endpoint, dataVar) => {
        hasChanges = true;
        return `const data = await ${apiMap[endpoint] || 'projectsApi'}.create(${dataVar})`;
      }
    );

    // Pattern 5: PUT/PATCH requests
    content = content.replace(
      /const\s+response\s*=\s*await\s+fetch\(\s*`http:\/\/localhost:8000\/api\/(\w+)\/\$\{([^}]+)\}`\s*,\s*\{[^}]*method:\s*["'](PUT|PATCH)["'][^}]*body:\s*JSON\.stringify\(([^)]+)\)[^}]*\}\s*\)/g,
      (match, endpoint, idVar, method, dataVar) => {
        hasChanges = true;
        return `const data = await ${apiMap[endpoint] || 'projectsApi'}.update(${idVar}, ${dataVar})`;
      }
    );

    // Fix response handling
    // Remove response.ok checks when using Supabase
    content = content.replace(
      /if\s*\(\s*!response\.ok\s*\)\s*throw\s*new\s*Error\([^)]+\);?/g,
      ''
    );

    // Replace response.json() with just using data directly
    content = content.replace(
      /const\s+data\s*=\s*await\s+response\.json\(\);?/g,
      '// Data already available from Supabase call'
    );

    // Replace await response with just data
    content = content.replace(
      /const\s+data\s*=\s*await\s+response;?/g,
      '// Data already available from Supabase call'
    );

    // Fix setters that use response instead of data
    content = content.replace(
      /set(\w+)\(response\)/g,
      'set$1(data)'
    );

    // Clean up any remaining localhost:8000 references in the file
    content = content.replace(
      /http:\/\/localhost:8000\/api\/(\w+)/g,
      (match, endpoint) => {
        hasChanges = true;
        console.log(`Found remaining localhost reference for ${endpoint} in ${fileName}`);
        return '${supabaseUrl}/rest/v1/' + endpoint;
      }
    );

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fileName}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${fileName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fileName}:`, error.message);
    return false;
  }
}

// Process all files
console.log('🔧 Starting to properly fix all API calls...\n');

let fixedCount = 0;
let errorCount = 0;

Object.keys(fileMapping).forEach(fileName => {
  const filePath = path.join(srcDir, fileName);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath, fileName)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${fileName}`);
    errorCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`⚠️  Not found: ${errorCount} files`);
console.log('\n🎉 API migration complete!');
console.log('📝 Next steps:');
console.log('1. Restart your development server');
console.log('2. Clear browser cache');
console.log('3. Test all pages');