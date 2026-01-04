/**
 * AHP (Analytic Hierarchy Process) Algoritması
 * Kriter ağırlıklarını pairwise comparison ile belirler
 */

class AHP {
    /**
     * Saaty ölçeği değerleri
     */
    static SAATY_SCALE = {
    1: 'Eşit derecede önemli',
    2: 'Eşit ile orta derecede önemli arası',
    3: 'Orta derecede önemli',
    4: 'Orta ile kuvvetli derecede önemli arası',
    5: 'Kuvvetli derecede önemli',
    6: 'Kuvvetli ile çok kuvvetli önemli arası',
    7: 'Çok kuvvetli derecede önemli',
    8: 'Çok kuvvetli ile aşırı derecede önemli arası',
    9: 'Aşırı derecede önemli'
};

    /**
     * Pairwise comparison matrisinden ağırlıkları hesaplar
     * @param {Array<Array<number>>} comparisonMatrix - Pairwise comparison matrisi
     * @returns {Object} Ağırlıklar, consistency ratio ve diğer metrikler
     */
    static calculateWeights(comparisonMatrix) {
        const n = comparisonMatrix.length;
        
        // Matrisin geçerliliğini kontrol et
        if (!this.isValidMatrix(comparisonMatrix)) {
            throw new Error('Geçersiz pairwise comparison matrisi');
        }

        // 1. Normalize et (her sütunu toplamına böl)
        const normalized = this.normalizeMatrix(comparisonMatrix);
        
        // 2. Her satırın ortalamasını al (ağırlıklar)
        const weights = normalized.map(row => 
            row.reduce((sum, val) => sum + val, 0) / n
        );

        // 3. Consistency Ratio hesapla
        const consistency = this.calculateConsistency(comparisonMatrix, weights);

        return {
            weights: weights,
            consistencyRatio: consistency.cr,
            consistencyIndex: consistency.ci,
            lambdaMax: consistency.lambdaMax,
            isConsistent: consistency.cr < 0.1,
            normalizedMatrix: normalized
        };
    }

    /**
     * Matrisin geçerliliğini kontrol eder
     */
    static isValidMatrix(matrix) {
        const n = matrix.length;
        
        // Kare matris olmalı
        if (!matrix.every(row => row.length === n)) {
            return false;
        }

        // Köşegen elemanları 1 olmalı
        for (let i = 0; i < n; i++) {
            if (Math.abs(matrix[i][i] - 1) > 0.001) {
                return false;
            }
        }

        // Karşılıklılık kontrolü: a[i][j] * a[j][i] ≈ 1
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const product = matrix[i][j] * matrix[j][i];
                if (Math.abs(product - 1) > 0.1) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Matrisi normalize eder (her sütunu toplamına böler)
     */
    static normalizeMatrix(matrix) {
        const n = matrix.length;
        const normalized = matrix.map(row => [...row]);
        
        // Her sütunun toplamını hesapla
        const columnSums = [];
        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let i = 0; i < n; i++) {
                sum += matrix[i][j];
            }
            columnSums[j] = sum;
        }

        // Normalize et
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                normalized[i][j] = columnSums[j] !== 0 ? matrix[i][j] / columnSums[j] : 0;
            }
        }

        return normalized;
    }

    /**
     * Consistency Ratio (CR) hesaplar
     */
    static calculateConsistency(comparisonMatrix, weights) {
        const n = comparisonMatrix.length;
        
        // Weighted sum vector hesapla
        const weightedSum = [];
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                sum += comparisonMatrix[i][j] * weights[j];
            }
            weightedSum[i] = sum;
        }

        // Lambda max hesapla
        let lambdaMax = 0;
        for (let i = 0; i < n; i++) {
            if (weights[i] !== 0) {
                lambdaMax += weightedSum[i] / weights[i];
            }
        }
        lambdaMax = lambdaMax / n;

        // Consistency Index (CI) hesapla
        const ci = (lambdaMax - n) / (n - 1);

        // Random Index (RI) - Saaty tablosundan
        const ri = this.getRandomIndex(n);

        // Consistency Ratio (CR) hesapla
        const cr = ri !== 0 ? ci / ri : 0;

        return {
            lambdaMax: lambdaMax,
            ci: ci,
            cr: cr
        };
    }

    /**
     * Random Index (RI) değerlerini döndürür (Saaty tablosu)
     */
    static getRandomIndex(n) {
        const riTable = {
            1: 0,
            2: 0,
            3: 0.58,
            4: 0.90,
            5: 1.12,
            6: 1.24,
            7: 1.32,
            8: 1.41,
            9: 1.45,
            10: 1.49,
            11: 1.51,
            12: 1.48,
            13: 1.56,
            14: 1.57,
            15: 1.59
        };
        return riTable[n] || 1.6;
    }

    /**
     * Boş bir pairwise comparison matrisi oluşturur
     */
    static createEmptyMatrix(n) {
        const matrix = [];
        for (let i = 0; i < n; i++) {
            matrix[i] = [];
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    matrix[i][j] = 1; // Köşegen elemanlar 1
                } else {
                    matrix[i][j] = null; // Henüz doldurulmamış
                }
            }
        }
        return matrix;
    }

    /**
     * Karşılıklı değeri otomatik doldurur
     * Eğer a[i][j] = x ise, a[j][i] = 1/x olmalı
     */
    static fillReciprocal(matrix, row, col, value) {
        const n = matrix.length;
        matrix[row][col] = value;
        
        // Karşılıklı değeri otomatik doldur
        if (row !== col && value !== null && value !== 0) {
            matrix[col][row] = 1 / value;
        }
        
        return matrix;
    }

    /**
     * Matrisin tamamlanıp tamamlanmadığını kontrol eder
     */
    static isMatrixComplete(matrix) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === null || matrix[i][j] === undefined) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Saaty ölçeği açıklamasını döndürür
     */
    static getScaleDescription(value) {
    if (value === 1) return 'Eşit derecede önemli';
    if (value === 2) return 'Eşit ile orta derecede önemli arası';
    if (value === 3) return 'Orta derecede önemli';
    if (value === 4) return 'Orta ile kuvvetli derecede önemli arası';
    if (value === 5) return 'Kuvvetli derecede önemli';
    if (value === 6) return 'Kuvvetli ile çok kuvvetli önemli arası';
    if (value === 7) return 'Çok kuvvetli derecede önemli';
    if (value === 8) return 'Çok kuvvetli ile aşırı derecede önemli arası';
    if (value === 9) return 'Aşırı derecede önemli';
    
    // Ters oranlar için (Örn: 1/3)
    if (value > 0 && value < 1) {
        const reciprocal = Math.round(1 / value);
        return `Ters oran (1/${reciprocal} - Diğer kriter daha önemli)`;
    }
    return '';
}
}

