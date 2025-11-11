export interface PreScreeningQuestion {
  id: string;
  question: string;
  answerType:
    | "short_answer"
    | "long_answer"
    | "dropdown"
    | "checkboxes"
    | "range";
  options?: string[];
  rangeConfig?: {
    min: number;
    max: number;
    step: number;
    minLabel?: string;
    maxLabel?: string;
  };
  required: boolean;
}
