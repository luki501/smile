-- Migration: Create custom ENUM types for the SMile application
-- Purpose: Define body_part_enum and pain_type_enum for symptom tracking
-- Created: 2025-10-12

-- create enum type for body parts
-- this enum defines the different body parts where users can experience neurological symptoms
create type body_part_enum as enum (
  'Head',
  'Neck',
  'Back',
  'Arms',
  'LeftHand',
  'RightHand',
  'LeftLeg',
  'RightLeg'
);

comment on type body_part_enum is 'Defines the body parts where neurological symptoms can be tracked';

-- create enum type for pain types
-- this enum defines the different types of neurological symptoms users can report
create type pain_type_enum as enum (
  'Tingle',
  'Numbness',
  'Cramps',
  'FuckedUp'
);

comment on type pain_type_enum is 'Defines the types of neurological symptoms that can be tracked';

