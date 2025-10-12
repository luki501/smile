-- Migration: Disable all RLS policies for weight_records, blood_pressure_records, and symptom_records
-- Purpose: Remove all row level security policies from the three tables
-- Affected tables: weight_records, blood_pressure_records, symptom_records
-- Created: 2025-10-12

-- =====================================================
-- Drop all policies from weight_records
-- =====================================================

drop policy if exists "anon_weight_records_select_policy" on weight_records;
drop policy if exists "authenticated_weight_records_select_policy" on weight_records;
drop policy if exists "anon_weight_records_insert_policy" on weight_records;
drop policy if exists "authenticated_weight_records_insert_policy" on weight_records;
drop policy if exists "anon_weight_records_update_policy" on weight_records;
drop policy if exists "authenticated_weight_records_update_policy" on weight_records;
drop policy if exists "anon_weight_records_delete_policy" on weight_records;
drop policy if exists "authenticated_weight_records_delete_policy" on weight_records;

-- =====================================================
-- Drop all policies from blood_pressure_records
-- =====================================================

drop policy if exists "anon_blood_pressure_records_select_policy" on blood_pressure_records;
drop policy if exists "authenticated_blood_pressure_records_select_policy" on blood_pressure_records;
drop policy if exists "anon_blood_pressure_records_insert_policy" on blood_pressure_records;
drop policy if exists "authenticated_blood_pressure_records_insert_policy" on blood_pressure_records;
drop policy if exists "anon_blood_pressure_records_update_policy" on blood_pressure_records;
drop policy if exists "authenticated_blood_pressure_records_update_policy" on blood_pressure_records;
drop policy if exists "anon_blood_pressure_records_delete_policy" on blood_pressure_records;
drop policy if exists "authenticated_blood_pressure_records_delete_policy" on blood_pressure_records;

-- =====================================================
-- Drop all policies from symptom_records
-- =====================================================

drop policy if exists "anon_symptom_records_select_policy" on symptom_records;
drop policy if exists "authenticated_symptom_records_select_policy" on symptom_records;
drop policy if exists "anon_symptom_records_insert_policy" on symptom_records;
drop policy if exists "authenticated_symptom_records_insert_policy" on symptom_records;
drop policy if exists "anon_symptom_records_update_policy" on symptom_records;
drop policy if exists "authenticated_symptom_records_update_policy" on symptom_records;
drop policy if exists "anon_symptom_records_delete_policy" on symptom_records;
drop policy if exists "authenticated_symptom_records_delete_policy" on symptom_records;

