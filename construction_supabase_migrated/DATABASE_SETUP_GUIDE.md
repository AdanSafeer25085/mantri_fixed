# Construction Management System - Database Setup Guide

## SQL Files Execution Order

Run these SQL files in your Supabase SQL Editor in the following sequence:

### Core Database Setup (01-07)
1. `01_*.sql` - Initial database schema
2. `02_*.sql` - Core tables setup
3. `03_*.sql` - Project and activity tables
4. `04_*.sql` - Materials and inventory
5. `05_*.sql` - Financial and reporting
6. `06_*.sql` - User management tables
7. `07_*.sql` - Additional features

### Authentication Setup (08-10)
8. **`08_authentication_setup.sql`** - Authentication function and security policies
9. **`09_default_admin_users.sql`** - Creates default admin users
10. **`10_security_and_permissions.sql`** - Final security configuration

## Default Login Credentials

After running all setup files, you can login with:

- **Main Administrator**
  - Username: `admin`
  - Password: `admin123`
  - Full permissions

- **Project Manager**
  - Username: `manager`
  - Password: `manager123`
  - Limited permissions

## Important Notes

- Always run SQL files in the specified order
- Files marked as "DEPRECATED" should not be used
- The authentication system uses the `admins.plain_password` field for login
- All passwords are stored in plain text for development (change in production)

## Troubleshooting

If login fails:
1. Verify all SQL files 08-10 have been executed
2. Check that users exist in both `users` and `admins` tables
3. Ensure Row Level Security policies allow access
4. Verify the frontend is using the correct authentication method

## File Structure

```
├── 08_authentication_setup.sql      ← Authentication function
├── 09_default_admin_users.sql       ← Default users creation
├── 10_security_and_permissions.sql  ← Security configuration
├── simple_admin_setup.sql           ← DEPRECATED
├── complete_auth_setup.sql          ← DEPRECATED
└── DATABASE_SETUP_GUIDE.md          ← This file
```