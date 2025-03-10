// src/lib/image-generator.ts
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

/**
 * ImageGenerator - Generiert Spielassets mit DALL-E oder erzeugt SVG-Fallbacks
 * 
 * API-Limitierungen:
 * - DALL-E 3 hat ein Rate-Limit von ca. 5 Anfragen pro Minute
 * - Kosten: ~$0.04 pro Bild (1024x1024)
 * 
 * Diese Implementierung verwendet einen Hybrid-Ansatz:
 * 1. Lokales Caching zur Reduzierung wiederholter API-Aufrufe
 * 2. Rate Limiting zur Vermeidung von API-Blockierungen
 * 3. SVG-Fallbacks für den Fall, dass die API nicht verfügbar ist
 * 
 * Langfristige Kostenabschätzung:
 * - 100 generierte Assets pro Tag: ~$4/Tag oder ~$120/Monat
 * - Mit effizientem Caching und Wiederverwendung kann dies erheblich reduziert werden
 */

// Initialisiere OpenAI mit API-Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedImage {
  url: string;
  base64: string; // Base64-kodiertes Bild für direkte Verwendung
}

// Cache-Verzeichnis für generierte Bilder
const CACHE_DIR = path.join(process.cwd(), 'public', 'generated-assets');

// Stelle sicher, dass das Cache-Verzeichnis existiert
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Error creating cache directory:', error);
}

// Einfache Implementierung eines Rate Limiters
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });
      
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const task = this.queue.shift();
    if (task) {
      task();
    }
  }
}

// Erstelle eine Instanz des Rate Limiters
const openaiRateLimiter = new RateLimiter(2); // Maximal 2 gleichzeitige Anfragen

// Bildgenerator, der DALL-E oder SVG-Fallback verwendet
export class ImageGenerator {
  
  // Generiere Assets mit DALL-E basierend auf Beschreibung
  static async generateAsset(description: string, type: 'background' | 'track' | 'player' | 'obstacle' = 'player'): Promise<GeneratedImage> {
    try {
      // Erstelle einen Hash des Beschreibungs-Strings für den Dateinamen
      const hash = createHash('md5').update(`${type}-${description}`).digest('hex');
      const cacheFilePath = path.join(CACHE_DIR, `${hash}.png`);
      const cacheMetaPath = path.join(CACHE_DIR, `${hash}.json`);
      
      // Prüfe, ob das Bild bereits im Cache ist
      if (fs.existsSync(cacheFilePath) && fs.existsSync(cacheMetaPath)) {
        try {
          const metaData = JSON.parse(fs.readFileSync(cacheMetaPath, 'utf-8'));
          const base64Data = fs.readFileSync(cacheFilePath).toString('base64');
          return {
            url: metaData.url,
            base64: base64Data
          };
        } catch (cacheError) {
          console.error('Error reading from cache:', cacheError);
          // Cache fehlgeschlagen, generiere neu
        }
      }
      
      // Versuche, ein Bild mit DALL-E zu generieren
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a simple 2D game asset for a ${type}: ${description}. Make it pixel art style, suitable for a Phaser.js game. Only the object, no background, transparent if possible.`,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      });
      
      const base64Image = response.data[0]?.b64_json;
      
      if (base64Image) {
        const imageData = {
          url: `data:image/png;base64,${base64Image}`,
          base64: base64Image
        };
        
        // Speichere im Cache
        try {
          const buffer = Buffer.from(base64Image, 'base64');
          fs.writeFileSync(cacheFilePath, buffer as unknown as Uint8Array);
          fs.writeFileSync(cacheMetaPath, JSON.stringify({
            url: imageData.url,
            description,
            type,
            createdAt: new Date().toISOString()
          }));
        } catch (saveError) {
          console.error('Error saving to cache:', saveError);
        }
        
        return imageData;
      }
      
      // Fallback, wenn DALL-E fehlschlägt
      return this.generateFallbackSVG(type);
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      // Bei Fehler: Fallback auf einfaches SVG
      return this.generateFallbackSVG(type);
    }
  }
  
  // Generiere einfache SVG-Grafiken als Fallback
  private static generateFallbackSVG(type: 'background' | 'track' | 'player' | 'obstacle'): GeneratedImage {
    let svgContent = '';
    
    switch (type) {
      case 'background':
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#87CEEB"/></svg>`;
        break;
      case 'track':
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
          <rect width="800" height="600" fill="#888"/>
          <path fill="none" stroke="#fff" stroke-width="20" stroke-dasharray="20,20" d="M100 300c0 0 150-200 600 0"/>
        </svg>`;
        break;
      case 'player':
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <circle fill="red" cx="32" cy="32" r="30"/>
          <circle fill="#fff" cx="20" cy="20" r="8"/>
          <circle fill="#fff" cx="44" cy="20" r="8"/>
          <path fill="#000" d="M24 40c0 0 8 14 16 0"/>
        </svg>`;
        break;
      case 'obstacle':
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <rect fill="#666" x="8" y="8" width="48" height="48"/>
        </svg>`;
        break;
    }
    
    // Konvertiere SVG zu Base64
    const base64 = Buffer.from(svgContent).toString('base64');
    
    return {
      url: `data:image/svg+xml;base64,${base64}`,
      base64: base64
    };
  }
  
  // Generiere alle benötigten Assets für ein Spiel
  static async generateGameAssets(gameType: 'marioKart' | 'platformer', description: string): Promise<{
    background: GeneratedImage;
    player: GeneratedImage;
    track?: GeneratedImage;
    obstacles: GeneratedImage[];
  }> {
    try {
      // Verwende den Rate Limiter für parallele Anfragen
      const [background, player, obstacle] = await Promise.all([
        openaiRateLimiter.add(() => this.generateAsset(`${gameType} game background: ${description}`, 'background')),
        openaiRateLimiter.add(() => this.generateAsset(`${gameType} player character: ${description}`, 'player')),
        openaiRateLimiter.add(() => this.generateAsset(`${gameType} obstacle: ${description}`, 'obstacle'))
      ]);
      
      // Spezifische Assets je nach Spieltyp
      let track: GeneratedImage | undefined;
      if (gameType === 'marioKart') {
        track = await openaiRateLimiter.add(() => 
          this.generateAsset(`racing track for ${description}`, 'track')
        );
      }
      
      return {
        background,
        player,
        track,
        obstacles: [obstacle]
      };
    } catch (error) {
      console.error('Error generating game assets:', error);
      
      // Fallback zu einfachen SVGs
      return {
        background: this.generateFallbackSVG('background'),
        player: this.generateFallbackSVG('player'),
        track: gameType === 'marioKart' ? this.generateFallbackSVG('track') : undefined,
        obstacles: [this.generateFallbackSVG('obstacle')]
      };
    }
  }
}