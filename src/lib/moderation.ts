/**
 * Content moderation utilities
 * Validates content for inappropriate language and patterns
 */

const INAPPROPRIATE_WORDS = [
  "spam",
  "porn",
  "xxx",
  "drugs",
  "cocaine",
  "heroin",
  "illegal",
  "fraud",
  "scam",
  "hack",
  "malware",
];

const SUSPICIOUS_PATTERNS = [
  /(\w)\1{4,}/i,
  /(http|https|ftp):\/\/[^\s]+/i,
];

export interface ModerationResult {
  isClean: boolean;
  issues: string[];
  severity: "none" | "low" | "medium" | "high";
}

function containsWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function moderateContent(
  text: string,
  options?: { minLength?: number }
): ModerationResult {
  const issues: string[] = [];
  const minLength = options?.minLength ?? 10;

  for (const word of INAPPROPRIATE_WORDS) {
    if (containsWord(text, word)) {
      issues.push(`Contiene lenguaje inapropiado: "${word}"`);
    }
  }

  if (SUSPICIOUS_PATTERNS[0].test(text)) {
    issues.push("Contiene caracteres repetidos excesivamente");
  }

  if (SUSPICIOUS_PATTERNS[1].test(text)) {
    issues.push("Contiene URLs - por favor verifica que sean legítimas");
  }

  if (text.trim().length < minLength) {
    issues.push(`El texto es muy corto (mínimo ${minLength} caracteres)`);
  }

  let severity: "none" | "low" | "medium" | "high" = "none";
  if (issues.length === 0) {
    severity = "none";
  } else if (issues.some((i) => i.includes("inapropiado"))) {
    severity = "high";
  } else if (issues.length > 2) {
    severity = "medium";
  } else {
    severity = "low";
  }

  return {
    isClean: issues.length === 0,
    issues,
    severity,
  };
}

export function validateServiceTitle(title: string): ModerationResult {
  if (title.trim().length < 5) {
    return {
      isClean: false,
      issues: ["El título debe tener al menos 5 caracteres"],
      severity: "low",
    };
  }

  if (title.trim().length > 100) {
    return {
      isClean: false,
      issues: ["El título no debe exceder 100 caracteres"],
      severity: "low",
    };
  }

  return moderateContent(title, { minLength: 5 });
}

export function validateServiceDescription(description: string): ModerationResult {
  if (description.trim().length < 20) {
    return {
      isClean: false,
      issues: ["La descripción debe tener al menos 20 caracteres"],
      severity: "low",
    };
  }

  if (description.trim().length > 2000) {
    return {
      isClean: false,
      issues: ["La descripción no debe exceder 2000 caracteres"],
      severity: "low",
    };
  }

  return moderateContent(description, { minLength: 20 });
}

export function validateCustomCategory(category: string): ModerationResult {
  if (category.trim().length < 3) {
    return {
      isClean: false,
      issues: ["La categoría debe tener al menos 3 caracteres"],
      severity: "low",
    };
  }

  if (category.trim().length > 50) {
    return {
      isClean: false,
      issues: ["La categoría no debe exceder 50 caracteres"],
      severity: "low",
    };
  }

  if (!/[a-zA-Z]/.test(category)) {
    return {
      isClean: false,
      issues: ["La categoría debe contener letras"],
      severity: "low",
    };
  }

  return moderateContent(category, { minLength: 3 });
}
