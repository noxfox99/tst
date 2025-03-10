export function checkForDangerousCode(code: string): { hasDanger: boolean; warnings: string[] } {
    const dangerousPatterns = [
      /eval\(/i,
      /Function\.constructor/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /unsafe\s/i,
    ];
    const warnings: string[] = [];
    let hasDanger = false;
  
    dangerousPatterns.forEach((pattern) => {
      if (pattern.test(code)) {
        hasDanger = true;
        warnings.push(`Potenziell gefährliches Muster gefunden: ${pattern.source}`);
      }
    });
  
    return { hasDanger, warnings };
  }
  
  export function sanitizeCode(code: string): string {
    return code
      .replace(/eval\s*\(/gi, '/* eval entfernt */')
      .replace(/Function\.constructor/gi, '/* Function.constructor entfernt */')
      .replace(/setTimeout\s*\(/gi, '/* setTimeout entfernt */')
      .replace(/setInterval\s*\(/gi, '/* setInterval entfernt */')
      .replace(/unsafe/gi, 'safe');
  }