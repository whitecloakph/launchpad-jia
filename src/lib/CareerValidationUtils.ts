// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface PrescreeningQuestion {
  id: string;
  question: string;
  type: "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range";
  options?: string[];
  rangeMin?: number;
  rangeMax?: number;
  currency?: string;
}

export interface InterviewQuestionCategory {
  id: number;
  category: string;
  questionCountToAsk: number | null;
  questions: string[];
}

// ============================================================================
// Validation Constants
// ============================================================================

export const ALLOWED_WORK_SETUPS = ["Fully Remote", "Onsite", "Hybrid"];
export const ALLOWED_EMPLOYMENT_TYPES = ["Full-Time", "Part-Time"];
export const ALLOWED_SCREENING_SETTINGS = [
  "Good Fit and above",
  "Only Strong Fit",
  "No Automatic Promotion",
];
export const ALLOWED_STATUSES = ["active", "inactive"];

export const MAX_LENGTHS = {
  jobTitle: 200,
  description: 20000,
  location: 200,
  workSetupRemarks: 500,
  country: 100,
  province: 100,
  questionText: 1000,
  prescreeningQuestion: 500,
  prescreeningOption: 200,
  currency: 50,
};

export const MIN_INTERVIEW_QUESTIONS = 5;
export const MAX_INTERVIEW_QUESTIONS = 100;
export const MAX_PRESCREENING_QUESTIONS = 50;

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
function escapeHTML(text: string): string {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Sanitize HTML content to prevent XSS while allowing specific safe tags
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== "string") return "";

  // List of allowed tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'];
  const allowedAttrs: { [key: string]: string[] } = {
    'a': ['href', 'target']
  };

  // Remove any script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol in URLs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');

  // Strip tags that are not in the allowed list
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.includes(tag)) {
      return '';
    }

    // For allowed tags, clean their attributes
    if (tag === 'a') {
      // Extract and validate href attribute
      const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i);
      const targetMatch = match.match(/target\s*=\s*["']([^"']*)["']/i);

      let cleanTag = `<${match.startsWith('</') ? '/' : ''}${tag}`;
      if (hrefMatch && hrefMatch[1]) {
        const href = hrefMatch[1].trim();
        // Only allow http, https, and relative URLs
        if (href.match(/^(https?:\/\/|\/|\.\/|#)/i)) {
          cleanTag += ` href="${escapeHTML(href)}"`;
        }
      }
      if (targetMatch && targetMatch[1]) {
        cleanTag += ` target="${escapeHTML(targetMatch[1])}"`;
      }
      cleanTag += '>';
      return cleanTag;
    }

    // For other allowed tags, just return the tag without attributes
    return `<${match.startsWith('</') ? '/' : ''}${tag}>`;
  });

  return sanitized;
}

/**
 * Sanitize text inputs by removing all HTML tags and escaping special characters
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";

  // Remove all HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Decode common HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');

  return sanitized;
}

// Sanitize interview questions array
export function sanitizeInterviewQuestions(
  categories: any[]
): InterviewQuestionCategory[] {
  if (!Array.isArray(categories)) return [];

  return categories.map((category) => {
    // Process questions - handle both object and string formats
    let sanitizedQuestions: string[] = [];

    if (Array.isArray(category.questions)) {
      sanitizedQuestions = category.questions
        .map((q: any) => {
          // Handle object format: {id: "abc", question: "text"}
          if (typeof q === "object" && q !== null && q.question) {
            return sanitizeText(q.question);
          }
          // Handle string format (legacy)
          if (typeof q === "string") {
            return sanitizeText(q);
          }
          return "";
        })
        // Filter out empty questions
        .filter((q: string) => q.trim().length > 0);
    }

    return {
      id: Number(category.id) || 0,
      category: sanitizeText(category.category || ""),
      questionCountToAsk:
        category.questionCountToAsk !== null &&
        category.questionCountToAsk !== undefined
          ? Number(category.questionCountToAsk)
          : null,
      questions: sanitizedQuestions,
    };
  });
}

// Sanitize pre-screening questions
export function sanitizePrescreeningQuestions(
  questions: any[]
): PrescreeningQuestion[] {
  if (!Array.isArray(questions)) return [];

  return questions.map((q) => ({
    id: String(q.id || ""),
    question: sanitizeText(q.question || ""),
    type: q.type || "short-answer",
    options: Array.isArray(q.options)
      ? q.options.map((opt: string) => sanitizeText(opt))
      : undefined,
    rangeMin: q.rangeMin !== undefined ? Number(q.rangeMin) : undefined,
    rangeMax: q.rangeMax !== undefined ? Number(q.rangeMax) : undefined,
    currency: q.currency ? sanitizeText(q.currency) : undefined,
  }));
}

// Sanitize user info object (lastEditedBy, createdBy)
export function sanitizeUserInfo(userInfo: any): any {
  if (!userInfo || typeof userInfo !== "object") return userInfo;

  return {
    name: sanitizeText(userInfo.name || ""),
    email: sanitizeText(userInfo.email || ""),
    image: sanitizeText(userInfo.image || ""),
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateObjectId(id: string): boolean {
  if (!id) return false;
  return /^[a-f\d]{24}$/i.test(id);
}

export function validateEnum(value: string, allowedValues: string[]): boolean {
  return allowedValues.includes(value);
}

export function validateStringLength(
  value: string,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (!value) return { valid: true };
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} exceeds maximum length of ${maxLength} characters`,
    };
  }
  return { valid: true };
}

export function validateSalaryRange(
  minimumSalary: any,
  maximumSalary: any
): { valid: boolean; error?: string } {
  if (minimumSalary !== undefined && minimumSalary !== null) {
    const min = Number(minimumSalary);
    if (isNaN(min) || min < 0) {
      return { valid: false, error: "Minimum salary must be a positive number" };
    }
  }

  if (maximumSalary !== undefined && maximumSalary !== null) {
    const max = Number(maximumSalary);
    if (isNaN(max) || max < 0) {
      return { valid: false, error: "Maximum salary must be a positive number" };
    }
  }

  if (
    minimumSalary !== undefined &&
    minimumSalary !== null &&
    maximumSalary !== undefined &&
    maximumSalary !== null
  ) {
    const min = Number(minimumSalary);
    const max = Number(maximumSalary);
    if (min > max) {
      return {
        valid: false,
        error: "Minimum salary cannot exceed maximum salary",
      };
    }
  }

  return { valid: true };
}

export function validateInterviewQuestions(
  categories: InterviewQuestionCategory[]
): { valid: boolean; error?: string } {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { valid: false, error: "Interview questions are required" };
  }

  // Count total questions
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + (cat.questions?.length || 0),
    0
  );

  if (totalQuestions < MIN_INTERVIEW_QUESTIONS) {
    return {
      valid: false,
      error: `At least ${MIN_INTERVIEW_QUESTIONS} interview questions are required`,
    };
  }

  if (totalQuestions > MAX_INTERVIEW_QUESTIONS) {
    return {
      valid: false,
      error: `Cannot exceed ${MAX_INTERVIEW_QUESTIONS} interview questions`,
    };
  }

  // Validate each category
  for (const category of categories) {
    if (!category.category) {
      return { valid: false, error: "Interview category name is required" };
    }

    if (!Array.isArray(category.questions)) {
      return {
        valid: false,
        error: `Category "${category.category}" must have a questions array`,
      };
    }

    // Validate question text lengths
    for (const question of category.questions) {
      if (!question || question.trim().length === 0) {
        return {
          valid: false,
          error: `Empty question found in category "${category.category}"`,
        };
      }

      if (question.length > MAX_LENGTHS.questionText) {
        return {
          valid: false,
          error: `Question in category "${category.category}" exceeds maximum length of ${MAX_LENGTHS.questionText} characters`,
        };
      }
    }
  }

  return { valid: true };
}

export function validatePrescreeningQuestions(
  questions: PrescreeningQuestion[]
): { valid: boolean; error?: string } {
  if (!Array.isArray(questions)) {
    return { valid: false, error: "Prescreening questions must be an array" };
  }

  if (questions.length > MAX_PRESCREENING_QUESTIONS) {
    return {
      valid: false,
      error: `Cannot exceed ${MAX_PRESCREENING_QUESTIONS} prescreening questions`,
    };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    if (!q.question || q.question.trim().length === 0) {
      return {
        valid: false,
        error: `Prescreening question ${i + 1} is empty`,
      };
    }

    if (q.question.length > MAX_LENGTHS.prescreeningQuestion) {
      return {
        valid: false,
        error: `Prescreening question ${i + 1} exceeds maximum length of ${MAX_LENGTHS.prescreeningQuestion} characters`,
      };
    }

    const validTypes = [
      "short-answer",
      "long-answer",
      "dropdown",
      "checkboxes",
      "range",
    ];
    if (!validTypes.includes(q.type)) {
      return {
        valid: false,
        error: `Prescreening question ${i + 1} has invalid type: ${q.type}`,
      };
    }

    // Validate dropdown and checkboxes must have options
    if (q.type === "dropdown" || q.type === "checkboxes") {
      if (!Array.isArray(q.options) || q.options.length === 0) {
        return {
          valid: false,
          error: `Prescreening question ${i + 1} (${q.type}) must have options`,
        };
      }

      for (const option of q.options) {
        if (option.length > MAX_LENGTHS.prescreeningOption) {
          return {
            valid: false,
            error: `Option in prescreening question ${i + 1} exceeds maximum length of ${MAX_LENGTHS.prescreeningOption} characters`,
          };
        }
      }
    }

    // Validate range type must have rangeMin, rangeMax, currency
    if (q.type === "range") {
      if (
        q.rangeMin === undefined ||
        q.rangeMax === undefined ||
        !q.currency
      ) {
        return {
          valid: false,
          error: `Prescreening question ${i + 1} (range type) must have rangeMin, rangeMax, and currency`,
        };
      }

      if (q.rangeMin >= q.rangeMax) {
        return {
          valid: false,
          error: `Prescreening question ${i + 1}: rangeMin must be less than rangeMax`,
        };
      }
    }
  }

  return { valid: true };
}
