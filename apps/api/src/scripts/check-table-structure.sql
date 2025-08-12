-- 🔍 CHECK TABLE STRUCTURE
-- This script shows the actual column names in your tables

-- Check PremiumProfile table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'PremiumProfile'
ORDER BY ordinal_position;

-- Check User table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'User'
ORDER BY ordinal_position;

-- Check Preference table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'Preference'
ORDER BY ordinal_position;

-- Check if there are any wallet-related columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('PremiumProfile', 'User', 'Preference')
AND column_name LIKE '%wallet%'
ORDER BY table_name, column_name;

-- Check for user ID columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('PremiumProfile', 'User', 'Preference')
AND column_name LIKE '%id%'
ORDER BY table_name, column_name;
