import { LucideIcon } from 'lucide-react';

export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER'
}

export interface CardConfig {
  role: UserRole;
  title: string;
  description: string;
  Icon: LucideIcon;
  themeColor: 'blue' | 'yellow' | 'purple';
  href: string; // Simulated route
}

export interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  errorMessage?: string; // Added for external validation feedback
}

export interface NotificationConfig {
  webhookUrl: string;
  isEnabled: boolean;
}

export interface StudentFormData {
  name: string;
  gradeClass: string;
  reason: string;
  peerRelation: number; // 1-5
  fatherRelation: number; // 1-5
  motherRelation: number; // 1-5
  selfPerception: string;
  currentEmotion: string;
  desiredChange: string;
  confidentiality: string[]; // checkboxes
  date: string;
  time: string;
}

export interface ParentFormData {
  childName: string;
  gradeClass: string;
  relation: string; // Parent, Relative, Other
  contact: string;
  desiredTime: string;
  
  // Narrative
  worries: string;
  examples: string;
  onsetAndCause: string;
  attemptsAndEffects: string;
  desiredChange: string;

  // Added Fields
  strengths: string;
  favoriteActivities: string;

  // Check
  medicalHistory: string; // 'yes' | 'no'
  medicalHistoryDetail?: string; // Added for detailed info when history is 'yes'
  motherRelationScore: number; // 1-10
  fatherRelationScore: number; // 1-10
  temperament: string;
  exceptionalSituations: string;
  note: string; // Added field
}

export interface TeacherFormData {
  gradeClass: string;
  studentName: string;
  referralReason: string;
  desiredChange: string; // Added field
  
  // Added Fields
  strengths: string;
  favoriteActivities: string;

  // School Life Scale (1-5)
  peerRelation: string;
  classAttitude: string;
  learningAbility: string;
  compliance: string;

  // Behavioral Characteristics (1-3)
  inattention: string;
  impulsivity: string;
  aggression: string;
  behavioralExamples?: string; // Added field for specific examples

  // Emotions
  emotions: string[];
  otherEmotionDetail?: string; // Added for specific input when 'Other' is selected

  // Other Observations
  repetitiveBehavior: string; // 'yes' | 'no'
  repetitiveBehaviorDetail?: string; // Added for specific input when 'yes' is selected
  frequency: string;
  severity: string;
}