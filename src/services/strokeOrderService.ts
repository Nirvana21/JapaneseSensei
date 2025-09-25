/**
 * Service pour récupérer et traiter les données d'ordre des traits (stroke order)
 * Utilise l'API KanjiVG pour les données SVG
 */

export interface StrokeOrderData {
  kanji: string;
  svgData: string;
  strokeCount: number;
  hasAnimation: boolean;
}

export class StrokeOrderService {
  private static readonly KANJIVG_CDN_BASE = 'https://kanjivg.tagaini.net/kanjivg/kanji';

  /**
   * Convertit un caractère japonais en code hexadécimal pour KanjiVG
   * Exemple: '日' -> '065e5'
   */
  private static kanjiToKanjiVGFilename(kanji: string): string {
    const codePoint = kanji.codePointAt(0);
    if (!codePoint) return '';
    
    // Convertir en hexadécimal avec padding à 5 chiffres
    return codePoint.toString(16).padStart(5, '0');
  }

  /**
   * Récupère les données SVG d'un kanji depuis KanjiVG
   */
  static async fetchStrokeOrderData(kanji: string): Promise<StrokeOrderData | null> {
    try {
      // Pour les mots composés, prendre seulement le premier caractère
      const firstChar = kanji.charAt(0);
      
      if (!this.isKanji(firstChar)) {
        console.warn(`${firstChar} n'est pas un kanji valide`);
        return null;
      }

      const filename = this.kanjiToKanjiVGFilename(firstChar);
      const svgUrl = `${this.KANJIVG_CDN_BASE}/${filename}.svg`;

      console.log(`Récupération stroke order pour ${firstChar} depuis: ${svgUrl}`);

      const response = await fetch(svgUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Stroke order non disponible pour ${firstChar} (404)`);
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const svgData = await response.text();
      
      // Analyser le nombre de traits depuis le SVG
      const strokeCount = this.extractStrokeCount(svgData);

      return {
        kanji: firstChar,
        svgData,
        strokeCount,
        hasAnimation: true
      };

    } catch (error) {
      console.error('Erreur récupération stroke order:', error);
      return null;
    }
  }

  /**
   * Vérifie si un caractère est un kanji
   */
  private static isKanji(char: string): boolean {
    const code = char.codePointAt(0);
    if (!code) return false;

    // Plages Unicode pour les kanjis
    return (
      (code >= 0x4E00 && code <= 0x9FAF) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
      (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
      (code >= 0xF900 && code <= 0xFAFF)    // CJK Compatibility Ideographs
    );
  }

  /**
   * Extrait le nombre de traits depuis les données SVG
   */
  private static extractStrokeCount(svgData: string): number {
    // Compter les éléments <path> qui représentent les traits
    const pathMatches = svgData.match(/<path[^>]*>/g);
    return pathMatches ? pathMatches.length : 0;
  }

  /**
   * Optimise les données SVG pour l'affichage web
   */
  static optimizeSVGForDisplay(svgData: string): string {
    return svgData
      // Nettoyer les commentaires et espaces inutiles
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      // S'assurer que les styles de base sont présents
      .replace(
        /<g([^>]*)>/,
        '<g$1 style="fill:none;stroke:#000000;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;">'
      );
  }

  /**
   * Génère un SVG de fallback basique si KanjiVG n'est pas disponible
   */
  static generateFallbackSVG(kanji: string): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
        <rect x="2" y="2" width="105" height="105" fill="none" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>
        <text x="54.5" y="65" text-anchor="middle" font-size="48" font-family="serif">${kanji}</text>
        <text x="54.5" y="90" text-anchor="middle" font-size="10" fill="#666">Ordre des traits non disponible</text>
      </svg>
    `.trim();
  }

  /**
   * Prépare les données pour l'animation avec KanjivgAnimate
   */
  static prepareForAnimation(svgData: string, targetId: string): string {
    return svgData.replace(
      /<svg([^>]*)>/,
      `<svg$1 id="${targetId}" class="kanjivg-stroke-order">`
    );
  }
}