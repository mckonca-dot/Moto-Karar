# Motosiklet Türü Filtreleme - Kurulum Kılavuzu

## 1. Frontend Tarafı (HTML/JavaScript)

✅ **Zaten yapılmış:**
- `catalog.html`'ye "Motosiklet Türü" dropdown filtresi eklendi
- `getMotorcycleType()` fonksiyonu motosiklet isimlerinden türü otomatik algılıyor
- Katalog kartında türü gösteriyor (🏍️ Naked, vb.)

## 2. Veritabanı Tarafı (MySQL)

### Adım 1: Türü Taşıyan Kolonu Ekleme

MySQL'de veya phpMyAdmin'de aşağıdaki SQL'i çalıştırın:

```sql
ALTER TABLE motorcycles ADD COLUMN type VARCHAR(50) DEFAULT 'Naked' AFTER name;
```

### Adım 2: Mevcut Motosikletlere Tür Atama

`DATABASE_MIGRATION.sql` dosyasındaki hazır sorguları kullanın ya da elle veri girin:

**MySQL/phpMyAdmin'de:**
```bash
source DATABASE_MIGRATION.sql;
```

**Veya phpMyAdmin GUI'den:** Sorgular sekmesinde yapıştırıp çalıştırın.

### Adım 3: Yeni Motosiklet Eklerken Type Belirtme

**İngiltere örneği:**
```sql
INSERT INTO motorcycles (name, type, image_url, price, power, fuel, weight, url)
VALUES ('Honda CB500F', 'Naked', 'cb500f.png', 350000, 47, 5.5, 189, 'https://...');
```

## 3. Python API Tarafı (Flask)

✅ **Zaten yapılmış:**
- `app_mysql.py`'de `motorcycle_to_dict()` fonksiyonu `type` kolonunu dahil ediyor
- API response'unda `type` alanı geri dönecek

### Veritabanında Değişikliklerden Sonra API'yi Yeniden Başlatın

```bash
python app_mysql.py
```

## 4. JSON Dosyasına Türü Eklemek (motorcycles-example.json)

Eğer JSON fallback verisi kullanıyorsanız, aşağıdaki gibi güncelle:

```json
[
  {
    "name": "Honda CB500F",
    "type": "Naked",
    "values": {
      "price": 350000,
      "power": 47,
      "fuel": 5.5,
      "weight": 189
    }
  },
  {
    "name": "Yamaha YZF-R3",
    "type": "Süper Sport",
    "values": {
      "price": 300000,
      "power": 42,
      "fuel": 6.2,
      "weight": 202
    }
  }
]
```

## 5. Admin Panelinden Motosiklet Eklemek

Admin mode'da `Yeni Motosiklet Ekle` butonuna basarsanız, formu aşağıdaki gibi genişletin:

**Script.js'de (addMotorcycle fonksiyonunda):**

```javascript
// Type alanı için input ekle
const typeInput = document.createElement('input');
typeInput.type = 'text';
typeInput.placeholder = 'Türü (Naked, Süper Sport, Scooter, vb.)';
typeInput.id = 'motorcycleType';
addMotorcycleForm.insertBefore(typeInput, document.getElementById('motorcycleCriteriaInputs'));
```

## 6. API'den Türe Göre Filtrele

Eğer backend'de filtreleme yapmak istiyorsanız:

```python
@app.route('/api/motorcycles/type/<type_name>', methods=['GET'])
def get_motorcycles_by_type(type_name):
    """Belirli bir türdeki motosikletleri getir"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, type, image_url, price, power, fuel, weight, url
            FROM motorcycles
            WHERE type = %s
            ORDER BY name
        ''', (type_name,))
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        motorcycles = [motorcycle_to_dict(row) for row in rows]
        return jsonify(motorcycles), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500
```

## 7. Motosiklet Türlerinin Listesi

`catalog.html`'de kullanılan standart türler:

- **Naked**: MT-07, CB500F, Z9, vb.
- **Süper Sport**: YZF-R3, CBR650R, Ninja ZX-6R, vb.
- **Sport Touring**: Ninja H2 SX, Versys 650, vb.
- **Touring**: Goldwing, Harley-Davidson, vb.
- **Cruiser**: Shadow, Rebel, Vulcan, vb.
- **Scooter**: PCX, Forza, XMAX, NMAX, vb.
- **Dual Sport**: CRF250L, XR-V, vb.
- **Adventure**: Tiger 1200, Africa Twin, Multistrada, vb.
- **Enduro**: CRF250, CRW, vb.

## 8. TOPSIS Analizine Türü Dahil Etme (İsteğe Bağlı)

Eğer TOPSIS'te türe göre ağırlıklandırma yapmak istiyorsanız:

```javascript
// script.js'de
function calculateTOPSIS() {
    // Seçili motosikletlerin türlerini kontrol et
    const selectedMotorcycles = motorcycles.filter((m, idx) => 
        document.querySelector(`[data-motorcycle-index="${idx}"]`)?.checked
    );
    
    const types = new Set(selectedMotorcycles.map(m => getMotorcycleType(m)));
    console.log('Seçili türler:', Array.from(types));
    
    // Sonradan tür-spesifik ağırlıklandırma yapılabilir
}
```

## Sorun Giderme

**Q: Katalogda türler gösterilmiyorsa?**
A: Tarayıcı konsolunu açın (F12) ve `console.log()` kontrolü yapın. `getMotorcycleType()` fonksiyonu düzgün çalıştığı kontrol edin.

**Q: Veritabanında tür kolonu yoksa?**
A: `DATABASE_MIGRATION.sql` dosyasındaki ilk satırı MySQL'de çalıştırın.

**Q: API `type` alanı döndermiyorsa?**
A: `app_mysql.py`'yi güncelledim, Flask'ı yeniden başlatın.

**Q: Yeni türler eklemek istiyorum?**
A: `catalog.html`'deki `typeFilter` dropdown'una option ekleyin ve `getMotorcycleType()` fonksiyonunu güncelleyin.

**Q: TOPSIS analizinde türler görünmüyorsa?**
A: `calculateTOPSIS()` fonksiyonunda `getMotorcycleType()` çağrısı ekledim. Konsolda "Seçili türler" ve "Tür dağılımı" loglarını kontrol edin.

**Q: JavaScript syntax hatası alıyorum?**
A: Tüm fonksiyonların doğru kapanış parantezine sahip olduğunu kontrol edin. Özellikle `loadMotorcyclesFromJSON` ve `startDataAutoRefresh` fonksiyonlarını kontrol edin.
