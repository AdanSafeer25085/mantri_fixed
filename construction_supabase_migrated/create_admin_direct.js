// Direct admin user creation using raw SQL
const { exec } = require('child_process');
const path = require('path');

// Function to execute SQL commands directly
function executeSQLFile() {
    const sqlFile = path.join(__dirname, '..', '07_create_admin_users.sql');

    console.log('🔄 Executing SQL file to create admin users...');
    console.log('📄 SQL File:', sqlFile);

    // Use the SQL file content directly by copying it to clipboard and running in Supabase SQL editor
    const fs = require('fs');

    try {
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        console.log('\n📋 COPY THIS SQL AND RUN IT IN YOUR SUPABASE SQL EDITOR:');
        console.log('=' * 60);
        console.log(sqlContent);
        console.log('=' * 60);
        console.log('\n🚀 Steps:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy the above SQL and paste it');
        console.log('4. Click "Run" to execute');
        console.log('5. Then test login with credentials:');
        console.log('   - Admin: username=admin, password=admin123');
        console.log('   - Manager: username=manager, password=manager123');
    } catch (error) {
        console.error('❌ Error reading SQL file:', error.message);
    }
}

// Try using environment variables for direct connection
function createUsersDirectly() {
    console.log('🔄 Creating admin users directly...');

    // Manual user creation using direct API calls
    const users = [
        {
            email: 'admin@construction.com',
            username: 'admin',
            full_name: 'System Administrator',
            password_hash: 'admin123',
            status: 'Active'
        },
        {
            email: 'manager@construction.com',
            username: 'manager',
            full_name: 'Project Manager',
            password_hash: 'manager123',
            status: 'Active'
        }
    ];

    console.log('👥 Users to create:', users);
    console.log('\n⚠️  Note: Direct API creation may be limited by RLS policies.');
    console.log('📋 Recommended: Use the SQL approach above.');
}

console.log('🏗️  Construction Management - Admin User Setup');
console.log('================================================\n');

executeSQLFile();
createUsersDirectly();