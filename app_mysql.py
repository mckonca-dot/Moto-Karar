#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flask Backend API - Motosiklet Veritabanı Yönetimi (MySQL/XAMPP)
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime
import os
from dotenv import load_dotenv

# .env dosyasındaki değişkenleri yükle
load_dotenv()

app = Flask(__name__)
CORS(app)

# MySQL Bağlantı Ayarları (Artık .env dosyasından okunuyor)
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'motosiklet_topsis'),
    'charset': 'utf8mb4'
}

def get_db_connection():
    """MySQL veritabanı bağlantısı oluştur"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"MySQL bağlantı hatası: {e}")
        return None

def motorcycle_to_dict(row):
    """Veritabanı satırını JSON formatına dönüştür"""
    return {
        'id': row[0],
        'name': row[1],
        'type': row[2] if len(row) > 2 else 'Naked',  # Yeni type kolonu
        'image_url': row[3] if len(row) > 3 else None,
        'values': {
            'price': float(row[4]) if len(row) > 4 else 0,
            'power': float(row[5]) if len(row) > 5 else 0,
            'fuel': float(row[6]) if len(row) > 6 else 0,
            'weight': float(row[7]) if len(row) > 7 else 0
        },
        'url': row[8] if len(row) > 8 else None
    }

@app.route('/api/motorcycles', methods=['GET'])
def get_motorcycles():
    """Tüm motosikletleri getir"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Veritabanı bağlantısı kurulamadı'}), 500
        
        cursor = conn.cursor()
        
        # Tüm motosikletleri getir
        cursor.execute('''
            SELECT id, name, type, image_url, price, power, fuel, weight, url
            FROM motorcycles
            ORDER BY name
        ''')
        
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        motorcycles = [motorcycle_to_dict(row) for row in rows]
        
        return jsonify(motorcycles), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/motorcycles/<int:motorcycle_id>', methods=['GET'])
def get_motorcycle(motorcycle_id):
    """Belirli bir motosikleti getir"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Veritabanı bağlantısı kurulamadı'}), 500
        
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, image_url, price, power, fuel, weight, url
            FROM motorcycles
            WHERE id = %s
        ''', (motorcycle_id,))
        
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if row:
            return jsonify(motorcycle_to_dict(row)), 200
        else:
            return jsonify({'error': 'Motosiklet bulunamadı'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/motorcycles', methods=['POST'])
def add_motorcycle():
    """Yeni motosiklet ekle"""
    try:
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        if not data or not data.get('name') or not data.get('values'):
            return jsonify({'error': 'Eksik veri: name ve values gerekli'}), 400
        
        values = data['values']
        required_fields = ['price', 'power', 'fuel', 'weight']
        if not all(field in values for field in required_fields):
            return jsonify({'error': f'Eksik kriter değerleri: {required_fields}'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Veritabanı bağlantısı kurulamadı'}), 500
        
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO motorcycles (name, image_url, price, power, fuel, weight, url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['name'],
            data.get('image_url'),
            values['price'],
            values['power'],
            values['fuel'],
            values['weight'],
            data.get('url')
        ))
        
        conn.commit()
        motorcycle_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({'id': motorcycle_id, 'message': 'Motosiklet başarıyla eklendi'}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/motorcycles/<int:motorcycle_id>', methods=['PUT'])
def update_motorcycle(motorcycle_id):
    """Motosiklet bilgilerini güncelle"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Veri gerekli'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Veritabanı bağlantısı kurulamadı'}), 500
        
        cursor = conn.cursor()
        
        # Önce motosikletin var olup olmadığını kontrol et
        cursor.execute('SELECT id FROM motorcycles WHERE id = %s', (motorcycle_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Motosiklet bulunamadı'}), 404
        
        # Güncelleme sorgusu oluştur
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append('name = %s')
            update_values.append(data['name'])
        
        if 'image_url' in data:
            update_fields.append('image_url = %s')
            update_values.append(data['image_url'])
        
        if 'url' in data:
            update_fields.append('url = %s')
            update_values.append(data['url'])
        
        if 'values' in data:
            values = data['values']
            if 'price' in values:
                update_fields.append('price = %s')
                update_values.append(values['price'])
            if 'power' in values:
                update_fields.append('power = %s')
                update_values.append(values['power'])
            if 'fuel' in values:
                update_fields.append('fuel = %s')
                update_values.append(values['fuel'])
            if 'weight' in values:
                update_fields.append('weight = %s')
                update_values.append(values['weight'])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Güncellenecek alan yok'}), 400
        
        update_values.append(motorcycle_id)
        
        cursor.execute(f'''
            UPDATE motorcycles
            SET {', '.join(update_fields)}
            WHERE id = %s
        ''', update_values)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Motosiklet başarıyla güncellendi'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/motorcycles/<int:motorcycle_id>', methods=['DELETE'])
def delete_motorcycle(motorcycle_id):
    """Motosiklet sil"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Veritabanı bağlantısı kurulamadı'}), 500
        
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM motorcycles WHERE id = %s', (motorcycle_id,))
        conn.commit()
        deleted = cursor.rowcount
        cursor.close()
        conn.close()
        
        if deleted:
            return jsonify({'message': 'Motosiklet başarıyla silindi'}), 200
        else:
            return jsonify({'error': 'Motosiklet bulunamadı'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """İstatistikleri getir"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Veritabanı bağlantısı kurulamadı'}), 500
        
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM motorcycles')
        total = cursor.fetchone()[0]
        
        cursor.execute('SELECT AVG(price), MIN(price), MAX(price) FROM motorcycles')
        price_stats = cursor.fetchone()
        
        cursor.execute('SELECT AVG(power), MIN(power), MAX(power) FROM motorcycles')
        power_stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'total_motorcycles': total,
            'price': {
                'average': float(price_stats[0]) if price_stats[0] else 0,
                'min': float(price_stats[1]) if price_stats[1] else 0,
                'max': float(price_stats[2]) if price_stats[2] else 0
            },
            'power': {
                'average': float(power_stats[0]) if power_stats[0] else 0,
                'min': float(power_stats[1]) if power_stats[1] else 0,
                'max': float(power_stats[2]) if power_stats[2] else 0
            }
        }), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Sağlık kontrolü"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({
                'status': 'error',
                'message': 'MySQL bağlantısı kurulamadı',
                'tips': [
                    'XAMPP Control Panel\'de MySQL servisinin çalıştığından emin olun',
                    'phpMyAdmin\'den bağlantıyı test edin: http://localhost/phpmyadmin',
                    'Şifre değiştirdiyseniz, app_mysql.py dosyasındaki DB_CONFIG\'i güncelleyin'
                ]
            }), 500
        
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM motorcycles')
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'database_type': 'MySQL',
            'total_motorcycles': count,
            'phpmyadmin': 'http://localhost/phpmyadmin'
        }), 200
    except Error as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'database_type': 'MySQL'
        }), 500

if __name__ == '__main__':
    # Bağlantıyı test et
    print("🔌 MySQL bağlantısı test ediliyor...")
    conn = get_db_connection()
    if not conn:
        print("⚠️  Uyarı: MySQL'e bağlanılamadı!")
        print("   XAMPP Control Panel'de MySQL servisinin çalıştığından emin olun")
        print("   phpMyAdmin: http://localhost/phpmyadmin")
    else:
        print("✅ MySQL bağlantısı başarılı!")
        conn.close()
    
    print("🚀 Flask API sunucusu başlatılıyor...")
    print("📡 API Endpoint: http://localhost:5000/api/motorcycles")
    print("💡 Health Check: http://localhost:5000/api/health")
    print("🌐 phpMyAdmin: http://localhost/phpmyadmin")
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)

