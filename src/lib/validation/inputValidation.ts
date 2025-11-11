/**
 * Input Validation and Sanitization Utilities for Career API
 * Protects against XSS attacks and malicious input
 */

import DOMPurify from 'isomorphic-dompurify';

// Allowed HTML tags for rich text content (job description)
const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div'
];

// Allowed HTML attributes
const ALLOWED_HTML_ATTRS = ['href', 'target', 'rel', 'class', 'style'];

// Configure DOMPurify
const configureDOMPurify = () => {
  return {
    ALLOWED_TAGS: ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: ALLOWED_HTML_ATTRS,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  };
};

/**
 * Sanitize plain text input (removes all HTML)
 */
export function sanitizePlainText(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove all HTML tags and entities
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Sanitize rich text content (allows safe HTML tags)
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return DOMPurify.sanitize(input, configureDOMPurify()).trim();
}

/**
 * Validate and sanitize job title
 */
export function validateJobTitle(jobTitle: string): string {
  const sanitized = sanitizePlainText(jobTitle);
  
  if (sanitized.length === 0) {
    throw new Error('Job title cannot be empty');
  }
  
  if (sanitized.length > 200) {
    throw new Error('Job title must be less than 200 characters');
  }
  
  // Check for suspicious patterns
  if (/[<>{}[\]\\]/.test(sanitized)) {
    throw new Error('Job title contains invalid characters');
  }
  
  return sanitized;
}

/**
 * Validate and sanitize job description (allows rich text)
 */
export function validateDescription(description: string): string {
  const sanitized = sanitizeRichText(description);
  
  if (sanitized.length === 0) {
    throw new Error('Description cannot be empty');
  }
  
  if (sanitized.length > 50000) {
    throw new Error('Description must be less than 50,000 characters');
  }
  
  return sanitized;
}

/**
 * Validate work setup
 */
export function validateWorkSetup(workSetup: string): string {
  const sanitized = sanitizePlainText(workSetup);
  const validOptions = ['Fully Remote', 'Onsite', 'Hybrid'];
  
  if (!validOptions.includes(sanitized)) {
    throw new Error('Invalid work setup option');
  }
  
  return sanitized;
}

/**
 * Validate employment type
 */
export function validateEmploymentType(employmentType: string): string {
  const sanitized = sanitizePlainText(employmentType);
  const validOptions = ['Full-Time', 'Part-Time'];
  
  if (!validOptions.includes(sanitized)) {
    throw new Error('Invalid employment type');
  }
  
  return sanitized;
}

/**
 * Validate screening setting
 */
export function validateScreeningSetting(screeningSetting: string): string {
  const sanitized = sanitizePlainText(screeningSetting);
  const validOptions = [
    'Good Fit and above',
    'Only Strong Fit',
    'No Automatic Promotion',
  ];
  
  if (!validOptions.includes(sanitized)) {
    throw new Error('Invalid screening setting');
  }
  
  return sanitized;
}

/**
 * Validate location fields
 */
export function validateLocation(location: string): string {
  const sanitized = sanitizePlainText(location);
  
  if (sanitized.length === 0) {
    throw new Error('Location cannot be empty');
  }
  
  if (sanitized.length > 100) {
    throw new Error('Location must be less than 100 characters');
  }
  
  // Check for suspicious patterns
  if (/[<>{}[\]\\]/.test(sanitized)) {
    throw new Error('Location contains invalid characters');
  }
  
  return sanitized;
}

/**
 * Validate salary value
 */
export function validateSalary(salary: number | null): number | null {
  if (salary === null || salary === undefined) {
    return null;
  }
  
  const numValue = Number(salary);
  
  if (isNaN(numValue)) {
    throw new Error('Salary must be a valid number');
  }
  
  if (numValue < 0) {
    throw new Error('Salary cannot be negative');
  }
  
  if (numValue > 10000000) {
    throw new Error('Salary value is too large');
  }
  
  return numValue;
}

/**
 * Validate and sanitize interview question
 */
export function validateInterviewQuestion(question: string): string {
  const sanitized = sanitizePlainText(question);
  
  if (sanitized.length === 0) {
    throw new Error('Question cannot be empty');
  }
  
  if (sanitized.length > 2000) {
    throw new Error('Question must be less than 2,000 characters');
  }
  
  return sanitized;
}

/**
 * Validate interview question category
 */
export function validateQuestionCategory(category: string): string {
  const sanitized = sanitizePlainText(category);
  const validCategories = [
    'CV Validation / Experience',
    'Technical',
    'Behavioral',
    'Analytical',
    'Others',
  ];
  
  if (!validCategories.includes(sanitized)) {
    throw new Error('Invalid question category');
  }
  
  return sanitized;
}

/**
 * Validate and sanitize questions array
 */
export function validateQuestions(questions: any[]): any[] {
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  if (questions.length === 0) {
    throw new Error('At least one question category is required');
  }
  
  return questions.map((group) => {
    if (typeof group !== 'object' || group === null) {
      throw new Error('Invalid question group format');
    }
    
    return {
      id: Number(group.id),
      category: validateQuestionCategory(group.category),
      questionCountToAsk: group.questionCountToAsk === null 
        ? null 
        : Number(group.questionCountToAsk),
      questions: (group.questions || []).map((q: any) => ({
        id: sanitizePlainText(String(q.id)),
        question: validateInterviewQuestion(q.question),
      })),
    };
  });
}

/**
 * Validate pre-screening answer type
 */
export function validateAnswerType(answerType: string): string {
  const sanitized = sanitizePlainText(answerType);
  const validTypes = ['short_answer', 'long_answer', 'dropdown', 'checkboxes', 'range'];
  
  if (!validTypes.includes(sanitized)) {
    throw new Error('Invalid answer type');
  }
  
  return sanitized;
}

/**
 * Validate pre-screening question option
 */
export function validateOption(option: string): string {
  const sanitized = sanitizePlainText(option);
  
  if (sanitized.length > 500) {
    throw new Error('Option must be less than 500 characters');
  }
  
  return sanitized;
}

/**
 * Validate range configuration
 */
export function validateRangeConfig(config: any): any {
  if (!config) return undefined;
  
  return {
    min: Number(config.min),
    max: Number(config.max),
    step: Number(config.step),
    minLabel: config.minLabel ? sanitizePlainText(config.minLabel) : undefined,
    maxLabel: config.maxLabel ? sanitizePlainText(config.maxLabel) : undefined,
  };
}

/**
 * Validate and sanitize pre-screening questions
 */
export function validatePreScreeningQuestions(questionsJson: string): string {
  try {
    const questions = JSON.parse(questionsJson);
    
    if (!Array.isArray(questions)) {
      throw new Error('Pre-screening questions must be an array');
    }
    
    const sanitizedQuestions = questions.map((q) => {
      if (typeof q !== 'object' || q === null) {
        throw new Error('Invalid pre-screening question format');
      }
      
      const sanitized: any = {
        id: sanitizePlainText(String(q.id)),
        question: validateInterviewQuestion(q.question),
        answerType: validateAnswerType(q.answerType),
        required: Boolean(q.required),
      };
      
      // Validate options for dropdown and checkboxes
      if (q.answerType === 'dropdown' || q.answerType === 'checkboxes') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error('Dropdown and checkboxes must have at least 2 options');
        }
        sanitized.options = q.options.map(validateOption);
      }
      
      // Validate range config
      if (q.answerType === 'range') {
        if (!q.rangeConfig) {
          throw new Error('Range questions must have rangeConfig');
        }
        sanitized.rangeConfig = validateRangeConfig(q.rangeConfig);
      }
      
      return sanitized;
    });
    
    return JSON.stringify(sanitizedQuestions);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format for pre-screening questions');
    }
    throw error;
  }
}

/**
 * Validate complete career data object
 */
export function validateCareerData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid career data format');
  }
  
  return {
    jobTitle: validateJobTitle(data.jobTitle),
    description: validateDescription(data.description),
    workSetup: validateWorkSetup(data.workSetup),
    employmentType: data.employmentType 
      ? validateEmploymentType(data.employmentType) 
      : 'Full-Time',
    location: validateLocation(data.location),
    country: validateLocation(data.country || 'Philippines'),
    province: validateLocation(data.province || ''),
    screeningSetting: validateScreeningSetting(data.screeningSetting),
    questions: validateQuestions(data.questions),
    preScreeningQuestions: data.preScreeningQuestions 
      ? validatePreScreeningQuestions(data.preScreeningQuestions)
      : JSON.stringify([]),
    salaryNegotiable: Boolean(data.salaryNegotiable),
    minimumSalary: validateSalary(data.minimumSalary),
    maximumSalary: validateSalary(data.maximumSalary),
    requireVideo: Boolean(data.requireVideo),
    status: ['active', 'inactive'].includes(data.status) ? data.status : 'active',
    workSetupRemarks: data.workSetupRemarks 
      ? sanitizePlainText(data.workSetupRemarks) 
      : undefined,
    orgID: sanitizePlainText(data.orgID),
    lastEditedBy: data.lastEditedBy,
    createdBy: data.createdBy,
  };
}