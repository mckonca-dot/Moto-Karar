# 🏍️ Moto Karar - Motosiklet Karar Destek Sistemi

**Moto Karar**, kullanıcıların kriterlerine göre kendileri için en uygun motosikleti bilimsel yöntemlerle seçmelerine yardımcı olan web tabanlı bir karar destek sistemidir. Sistem, Çok Kriterli Karar Verme (ÇKKV) tekniklerinden olan **AHP (Analitik Hiyerarşi Süreci)** ve **TOPSIS** algoritmalarını hibrit bir yapıda kullanır.

📷 Ekran Görüntüleri
<img width="1919" height="910" alt="Moto karar" src="https://github.com/user-attachments/assets/f87e1371-8e0f-4220-b604-049b0e7a2587" />

## 🚀 Özellikler

* **Çift Yöntemli Ağırlıklandırma:** Kullanıcılar kriter önem derecelerini ister basit sürgülerle (Slider) ister ikili karşılaştırma (AHP) yaparak belirleyebilirler.
* **AHP Tutarlılık Analizi:** AHP yöntemi kullanıldığında, kararların mantıksal tutarlılığı (CR - Consistency Ratio) otomatik olarak hesaplanır ve kullanıcıya %10 eşiği üzerinden geri bildirim verilir.
* **TOPSIS Algoritması:** Belirlenen ağırlıklara göre motosiklet seçeneklerini ideal çözüme yakınlıklarına göre bilimsel olarak sıralar.
* **Geniş Veri Yelpazesi:** Fiyat, güç, yakıt tüketimi ve ağırlık gibi teknik verileri içeren zengin bir katalog sunar.
* **Modern Katalog ve Filtreleme:** Motosikletleri markaya veya türe (Naked, Süper Sport, Adventure vb.) göre filtreleme imkanı sağlar.

## 🛠️ Kullanılan Teknolojiler

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS), Chart.js.
* **Backend:** Python 3, Flask, Flask-CORS.
* **Veritabanı:** MySQL (XAMPP uyumlu).
* **Kütüphaneler:** `mysql-connector-python`, `python-dotenv`.

## 📋 Kurulum ve Çalıştırma

### 1. Veritabanı Hazırlığı
1.  XAMPP Control Panel üzerinden MySQL servisini başlatın.
2.  `database_schema_mysql.sql` dosyasındaki sorguları phpMyAdmin üzerinden çalıştırarak `motosiklet_topsis` veritabanını oluşturun.
3.  `DATABASE_MIGRATION.sql` dosyasını çalıştırarak `type` kolonunu ekleyin ve örnek verileri güncelleyin.

### 2. Backend (API) Kurulumu
1.  Gerekli kütüphaneleri yükleyin:
    ```bash
    pip install -r requirements.txt
    ```
2.  Ana dizinde bir `.env` dosyası oluşturun ve MySQL bilgilerinizi girin:
    ```text
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=motosiklet_topsis
    ```
3.  API sunucusunu başlatın:
    ```bash
    python app_mysql.py
    ```

### 3. Frontend Kullanımı
`index.html` dosyasını herhangi bir modern tarayıcıda açarak analize başlayabilirsiniz.

## 📊 Karar Verme Süreci



Sistem şu bilimsel adımları izler:
1.  **Kriter Ağırlıklandırma:** Fiyat, Güç, Yakıt ve Ağırlık kriterleri arasındaki önem dengesi kurulur.
2.  **Normalizasyon:** Farklı birimlerdeki (TL, HP, KG vb.) veriler TOPSIS yöntemiyle standartlaştırılır.
3.  **İdeal Çözüm Analizi:** Her bir motosikletin "en iyi" ve "en kötü" değerlere olan uzaklığı hesaplanarak 0 ile 1 arasında bir başarı skoru üretilir.

---

*Geliştirici: Muhammet KONCA
