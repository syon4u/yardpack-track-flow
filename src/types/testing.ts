
export interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  duration?: number;
  message: string;
}

export interface TestConfig {
  name: string;
  description: string;
  timeoutMs?: number;
}
