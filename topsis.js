/**
 * TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) Algoritması
 * Çok kriterli karar verme yöntemi
 */

class TOPSIS {
    /**
     * TOPSIS analizini gerçekleştirir
     * @param {Array} alternatives - Alternatifler matrisi (her satır bir alternatif, her sütun bir kriter)
     * @param {Array} weights - Kriter ağırlıkları
     * @param {Array} criteriaTypes - Her kriterin tipi ('max' veya 'min')
     * @returns {Object} Sıralama sonuçları ve skorlar
     */
    static calculate(alternatives, weights, criteriaTypes) {
        // 1. Normalizasyon
        const normalized = this.normalizeMatrix(alternatives);
        
        // 2. Ağırlıklandırılmış normalizasyon
        const weighted = this.applyWeights(normalized, weights);
        
        // 3. Pozitif ve negatif ideal çözümleri bul
        const positiveIdeal = this.findPositiveIdeal(weighted, criteriaTypes);
        const negativeIdeal = this.findNegativeIdeal(weighted, criteriaTypes);
        
        // 4. Her alternatifin ideal çözümlere uzaklıklarını hesapla
        const distances = this.calculateDistances(weighted, positiveIdeal, negativeIdeal);
        
        // 5. Göreceli yakınlık skorlarını hesapla
        const scores = distances.map(d => d.negative / (d.positive + d.negative));
        
        // 6. Sıralama
        const rankings = this.rankAlternatives(scores);
        
        return {
            scores: scores,
            rankings: rankings,
            distances: distances,
            positiveIdeal: positiveIdeal,
            negativeIdeal: negativeIdeal
        };
    }
    
    /**
     * Matrisi normalize eder (her sütunun karelerinin toplamının kareköküne böler)
     */
    static normalizeMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const normalized = [];
        
        // Her sütun için norm hesapla
        const norms = [];
        for (let j = 0; j < cols; j++) {
            let sumSquares = 0;
            for (let i = 0; i < rows; i++) {
                sumSquares += matrix[i][j] * matrix[i][j];
            }
            norms[j] = Math.sqrt(sumSquares);
        }
        
        // Normalize et
        for (let i = 0; i < rows; i++) {
            normalized[i] = [];
            for (let j = 0; j < cols; j++) {
                normalized[i][j] = norms[j] !== 0 ? matrix[i][j] / norms[j] : 0;
            }
        }
        
        return normalized;
    }
    
    /**
     * Normalize edilmiş matrise ağırlıkları uygular
     */
    static applyWeights(normalizedMatrix, weights) {
        const weighted = [];
        for (let i = 0; i < normalizedMatrix.length; i++) {
            weighted[i] = [];
            for (let j = 0; j < normalizedMatrix[i].length; j++) {
                weighted[i][j] = normalizedMatrix[i][j] * weights[j];
            }
        }
        return weighted;
    }
    
    /**
     * Pozitif ideal çözümü bulur (her kriter için en iyi değer)
     */
    static findPositiveIdeal(weightedMatrix, criteriaTypes) {
        const cols = weightedMatrix[0].length;
        const positiveIdeal = [];
        
        for (let j = 0; j < cols; j++) {
            const columnValues = weightedMatrix.map(row => row[j]);
            if (criteriaTypes[j] === 'max') {
                positiveIdeal[j] = Math.max(...columnValues);
            } else {
                positiveIdeal[j] = Math.min(...columnValues);
            }
        }
        
        return positiveIdeal;
    }
    
    /**
     * Negatif ideal çözümü bulur (her kriter için en kötü değer)
     */
    static findNegativeIdeal(weightedMatrix, criteriaTypes) {
        const cols = weightedMatrix[0].length;
        const negativeIdeal = [];
        
        for (let j = 0; j < cols; j++) {
            const columnValues = weightedMatrix.map(row => row[j]);
            if (criteriaTypes[j] === 'max') {
                negativeIdeal[j] = Math.min(...columnValues);
            } else {
                negativeIdeal[j] = Math.max(...columnValues);
            }
        }
        
        return negativeIdeal;
    }
    
    /**
     * Her alternatifin pozitif ve negatif ideal çözümlere uzaklıklarını hesaplar
     */
    static calculateDistances(weightedMatrix, positiveIdeal, negativeIdeal) {
        const distances = [];
        
        for (let i = 0; i < weightedMatrix.length; i++) {
            let positiveDist = 0;
            let negativeDist = 0;
            
            for (let j = 0; j < weightedMatrix[i].length; j++) {
                positiveDist += Math.pow(weightedMatrix[i][j] - positiveIdeal[j], 2);
                negativeDist += Math.pow(weightedMatrix[i][j] - negativeIdeal[j], 2);
            }
            
            distances.push({
                positive: Math.sqrt(positiveDist),
                negative: Math.sqrt(negativeDist)
            });
        }
        
        return distances;
    }
    
    /**
     * Alternatifleri skorlarına göre sıralar
     */
    static rankAlternatives(scores) {
        const indexed = scores.map((score, index) => ({ index, score }));
        indexed.sort((a, b) => b.score - a.score);
        return indexed.map(item => item.index);
    }
}



