-- ============================================================
-- Palika Map — one-shot setup: create table (if needed) + demo data
-- Run this whole file in one go in the Neon SQL Editor.
-- ============================================================

-- 1. Create the table if it doesn't exist yet.
--    name/contributor/category/address/points are the columns shown
--    in the Contributor Records table on the dashboard.
--    lat/lng/ward/province/district/municipality are needed behind
--    the scenes so the map pins and the Province/District/Municipality/
--    Ward filters keep working.
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contributor TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT,
  points INTEGER DEFAULT 0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  ward INTEGER,
  province TEXT,
  district TEXT,
  municipality TEXT
);

-- In case the table already existed without these columns, add them safely.
ALTER TABLE places ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS municipality TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS ward INTEGER;

-- 2. Demo data: 5 rows each across Dhulikhel, Banepa, Panauti
--    (all in Kavrepalanchok district, Bagmati Province)
INSERT INTO places (name, contributor, category, address, points, lat, lng, ward, province, district, municipality)
VALUES
-- Dhulikhel
('Dhulikhel Heritage Cafe', 'Sita Gurung', 'Food and Drinks', 'Dhulikhel-3, Kavre', 2, 27.6206, 85.5477, 3, 'Bagmati Province', 'Kavrepalanchok', 'Dhulikhel'),
('Kavre Organic Farm', 'Ram Shrestha', 'Agriculture', 'Dhulikhel-6, Kavre', 3, 27.6188, 85.5512, 6, 'Bagmati Province', 'Kavrepalanchok', 'Dhulikhel'),
('Dhulikhel General Store', 'Anita Tamang', 'Commercial', 'Dhulikhel-1, Kavre', 2, 27.6221, 85.5461, 1, 'Bagmati Province', 'Kavrepalanchok', 'Dhulikhel'),
('Namobuddha View Lodge', 'Bikash Rai', 'Stay and Travel', 'Dhulikhel-9, Kavre', 4, 27.6172, 85.5539, 9, 'Bagmati Province', 'Kavrepalanchok', 'Dhulikhel'),
('Dhulikhel Health Post', 'Sunita Lama', 'Health', 'Dhulikhel-5, Kavre', 3, 27.6199, 85.5495, 5, 'Bagmati Province', 'Kavrepalanchok', 'Dhulikhel'),

-- Banepa
('Banepa Trade Center', 'Prakash KC', 'Commercial', 'Banepa-4, Kavre', 3, 27.6296, 85.5215, 4, 'Bagmati Province', 'Kavrepalanchok', 'Banepa'),
('Panchkhal Road Fuel Stop', 'Deepa Magar', 'Fuel', 'Banepa-7, Kavre', 2, 27.6271, 85.5233, 7, 'Bagmati Province', 'Kavrepalanchok', 'Banepa'),
('Banepa Secondary School', 'Hari Adhikari', 'Education', 'Banepa-2, Kavre', 4, 27.6312, 85.5198, 2, 'Bagmati Province', 'Kavrepalanchok', 'Banepa'),
('Banepa Municipal Office', 'Kamala Thapa', 'Government', 'Banepa-1, Kavre', 3, 27.6320, 85.5187, 1, 'Bagmati Province', 'Kavrepalanchok', 'Banepa'),
('Sanga Highway Diner', 'Rajesh Bhattarai', 'Food and Drinks', 'Banepa-10, Kavre', 2, 27.6255, 85.5262, 10, 'Bagmati Province', 'Kavrepalanchok', 'Banepa'),

-- Panauti
('Panauti Heritage Temple Area', 'Nabin Shrestha', 'Tourism', 'Panauti-1, Kavre', 4, 27.5921, 85.5140, 1, 'Bagmati Province', 'Kavrepalanchok', 'Panauti'),
('Roshi Khola Riverside Farm', 'Gita Poudel', 'Agriculture', 'Panauti-6, Kavre', 3, 27.5898, 85.5162, 6, 'Bagmati Province', 'Kavrepalanchok', 'Panauti'),
('Panauti Handicraft Shop', 'Suresh Karki', 'Shopping', 'Panauti-3, Kavre', 2, 27.5934, 85.5121, 3, 'Bagmati Province', 'Kavrepalanchok', 'Panauti'),
('Panauti Community Hospital', 'Manju Rana', 'Health', 'Panauti-9, Kavre', 3, 27.5885, 85.5178, 9, 'Bagmati Province', 'Kavrepalanchok', 'Panauti'),
('Panauti Guest House', 'Dipesh Basnet', 'Stay and Travel', 'Panauti-4, Kavre', 4, 27.5912, 85.5108, 4, 'Bagmati Province', 'Kavrepalanchok', 'Panauti');

-- 3. Quick check
SELECT name, contributor, category, address, points, municipality FROM places ORDER BY municipality;
