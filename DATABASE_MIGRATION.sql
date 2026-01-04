-- MySQL Veritabanı Migration: Motosiklet Türü Eklemek

-- 1. Motorcycles tablosuna type kolonu ekleme
ALTER TABLE motorcycles ADD COLUMN type VARCHAR(50) DEFAULT 'Naked' AFTER name;

-- 2. Mevcut motosikletlere tür eklemek (örnek SQL sorguları)
-- NOT: Aşağıdaki sorgular örnek vermek için yazılmıştır. İsimlerinize göre düzenleyin.

UPDATE motorcycles SET type = 'Süper Sport' WHERE name LIKE '%CBR%' OR name LIKE '%R1%' OR name LIKE '%ZX%' OR name LIKE '%Ninja ZX%' OR name LIKE '%YZF R%' OR name LIKE '%GSX-R%';

UPDATE motorcycles SET type = 'Naked' WHERE name LIKE '%MT-%' OR name LIKE '%MT %' OR name LIKE '%FZ %' OR name LIKE '%Z9%' OR name LIKE '%Z 9%' OR name LIKE '%XSR%';

UPDATE motorcycles SET type = 'Sport Touring' WHERE name LIKE '%Ninja H2%' OR name LIKE '%Versys%' OR name LIKE '%C650F%' OR name LIKE '%Tracer%';

UPDATE motorcycles SET type = 'Adventure' WHERE name LIKE '%F 900%' OR name LIKE '%F900%' OR name LIKE '%Multistrada%' OR name LIKE '%Tiger%' OR name LIKE '%Africa Twin%';

UPDATE motorcycles SET type = 'Cruiser' WHERE name LIKE '%Cruiser%' OR name LIKE '%Shadow%' OR name LIKE '%Rebel%' OR name LIKE '%Vulcan%';

UPDATE motorcycles SET type = 'Scooter' WHERE name LIKE '%PCX%' OR name LIKE '%Forza%' OR name LIKE '%XMAX%' OR name LIKE '%NMAX%' OR name LIKE '%SH %' OR name LIKE '%Vespa%';

UPDATE motorcycles SET type = 'Enduro' WHERE name LIKE '%XR%' OR name LIKE '%CRF%' OR name LIKE '%Enduro%' OR name LIKE '%CRW%';

UPDATE motorcycles SET type = 'Touring' WHERE name LIKE '%Goldwing%' OR name LIKE '%Harley%' OR name LIKE '%Dresser%' OR name LIKE '%GL1%';

-- 3. Tablo yapısını kontrol edin
DESCRIBE motorcycles;

-- 4. Örnek: Tüm motosikletleri türüne göre listele
SELECT name, type, price, power FROM motorcycles ORDER BY type, name;

-- 5. Örnek: Türe göre motosiklet sayısı
SELECT type, COUNT(*) as total FROM motorcycles GROUP BY type ORDER BY total DESC;

-- Python/Flask ile API'de kullanmak için:
-- 
-- app.py'de query:
-- motorcycles = Motorcycle.query.filter_by(type='Naked').all()
-- 
-- Veya:
-- motorcycles = Motorcycle.query.filter(Motorcycle.type.in_(['Naked', 'Süper Sport'])).all()
