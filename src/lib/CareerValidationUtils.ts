import DOMPurify from "isomorphic-dompurify";

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

// Sanitize HTML content to prevent XSS
export function sanitizeHTML(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
    ],
    ALLOWED_ATTR: ["href", "target"],
  });
}

// Sanitize text inputs using DOMPurify (strips all HTML)
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  return DOMPurify.sanitize(text.trim(), { ALLOWED_TAGS: [] });
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
