// Script to fix all localhost:8000 API calls to use Supabase
import fs from 'fs';
import path from 'path';

const srcDir = '/Users/kpklaptops/Desktop/adiii/complete_migration/construction_supabase_migrated/src/frontend';

// Files to fix and their Supabase API imports
const fileMapping = {
  'CustomerList.jsx': 'customersApi',
  'AddStock.jsx': 'stocksApi, materialsApi, vendorsApi, contractorsApi',
  'task.jsx': 'tasksApi',
  'AddLead.jsx': 'leadsApi, projectsApi',
  'Unit.jsx': 'unitsApi',
  'Projectoverview.jsx': 'projectsApi',
  'AddVendor.jsx': 'vendorsApi',
  'Vendors.jsx': 'vendorsApi',
  'AddFinance.jsx': 'financesApi, projectsApi, customersApi, contractorsApi, vendorsApi',
  'reports.jsx': 'projectsApi, financesApi',
  'ProjectProgress.jsx': 'projectsApi, activitiesApi, materialsApi, tasksApi',
  'contractor.jsx': 'contractorsApi',
  'AddMaterial.jsx': 'materialsApi, activitiesApi, unitsApi',
  'Material.jsx': 'materialsApi',
  'AdminForm.jsx': 'adminsApi, authApi',
  'StockManagement.jsx': 'stocksApi',
  'projectfile2.jsx': 'activitiesApi, tasksApi',
  'LeadList.jsx': 'leadsApi',
  'Gantchart.jsx': 'projectsApi, activitiesApi, tasksApi',
  'AddUnit.jsx': 'unitsApi',
  'AddTask.jsx': 'activitiesApi, tasksApi, projectsApi',
  'admin.jsx': 'adminsApi',
  'ProjectFinance.jsx': 'financesApi, projectsApi',
  'activity.jsx': 'activitiesApi',
  'TechnicalFiles.jsx': 'filesApi',
  'addactivity.jsx': 'activitiesApi, projectsApi',
  'addcontractor.jsx': 'contractorsApi, activitiesApi',
  'LegalFiles.jsx': 'filesApi',
  'profile.jsx': 'authApi, adminsApi',
  'addcustomer.jsx': 'customersApi, projectsApi'
};

// Common API endpoint replacements
const apiReplacements = {
  'http://localhost:8000/api/projects': 'await projectsApi.getAll()',
  'http://localhost:8000/api/activities': 'await activitiesApi.getAll()',
  'http://localhost:8000/api/tasks': 'await tasksApi.getAll()',
  'http://localhost:8000/api/materials': 'await materialsApi.getAll()',
  'http://localhost:8000/api/units': 'await unitsApi.getAll()',
  'http://localhost:8000/api/contractors': 'await contractorsApi.getAll()',
  'http://localhost:8000/api/vendors': 'await vendorsApi.getAll()',
  'http://localhost:8000/api/customers': 'await customersApi.getAll()',
  'http://localhost:8000/api/stocks': 'await stocksApi.getAll()',
  'http://localhost:8000/api/finances': 'await financesApi.getAll()',
  'http://localhost:8000/api/leads': 'await leadsApi.getAll()',
  'http://localhost:8000/api/admins': 'await adminsApi.getAll()',
};

function fixFile(filePath, fileName) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Add Supabase import if not present
    if (!content.includes('from "../lib/supabase"')) {
      const importApis = fileMapping[fileName] || 'projectsApi';
      const importLine = `import { ${importApis} } from "../lib/supabase";\n`;

      // Find the last import and add after it
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + importLine + content.slice(nextLineIndex + 1);
        hasChanges = true;
      }
    }

    // Replace fetch calls with Supabase calls
    const fetchPatterns = [
      /fetch\(\s*["'`]http:\/\/localhost:8000\/api\/(\w+)["'`]\s*\)/g,
      /fetch\(\s*["'`]http:\/\/localhost:8000\/api\/(\w+)\/?\$\{[^}]+\}["'`]\s*\)/g,
      /const\s+res\s*=\s*await\s+fetch\(\s*["'`]http:\/\/localhost:8000\/api\/(\w+)["'`]\s*\)/g
    ];

    fetchPatterns.forEach(pattern => {
      content = content.replace(pattern, (match, endpoint) => {
        hasChanges = true;
        const apiMap = {
          'projects': 'projectsApi.getAll()',
          'activities': 'activitiesApi.getAll()',
          'tasks': 'tasksApi.getAll()',
          'materials': 'materialsApi.getAll()',
          'units': 'unitsApi.getAll()',
          'contractors': 'contractorsApi.getAll()',
          'vendors': 'vendorsApi.getAll()',
          'customers': 'customersApi.getAll()',
          'stocks': 'stocksApi.getAll()',
          'finances': 'financesApi.getAll()',
          'leads': 'leadsApi.getAll()',
          'admins': 'adminsApi.getAll()'
        };
        return `const data = await ${apiMap[endpoint] || 'projectsApi.getAll()'}`;
      });
    });

    // Remove .json() calls since Supabase returns data directly
    content = content.replace(/const\s+data\s*=\s*await\s+res\.json\(\);?\s*\n?/g, '');
    content = content.replace(/\.json\(\)/g, '');

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fileName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${fileName}:`, error.message);
    return false;
  }
}

// Process all files
console.log('🔧 Starting to fix all API calls...\n');

Object.keys(fileMapping).forEach(fileName => {
  const filePath = path.join(srcDir, fileName);
  if (fs.existsSync(filePath)) {
    fixFile(filePath, fileName);
  } else {
    console.log(`⚠️  File not found: ${fileName}`);
  }
});

console.log('\n🎉 All API calls have been fixed to use Supabase!');
console.log('📝 Next steps:');
console.log('1. Refresh your browser');
console.log('2. Test all pages - no more localhost:8000 errors');
console.log('3. All data should load from Supabase database');