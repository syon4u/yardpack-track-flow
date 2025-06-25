
import { MonitoringService } from '@/services/monitoringService';

// Mock console methods
const mockConsoleError = jest.fn();
const mockConsoleLog = jest.fn();

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('MonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = mockConsoleError;
    console.log = mockConsoleLog;
  });

  afterAll(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('Error Logging', () => {
    it('should log errors with context', async () => {
      const error = new Error('Test error');
      const context = { operation: 'test_operation' };

      await MonitoringService.logError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error in test_operation:',
        error,
        context
      );
    });

    it('should handle errors without context', async () => {
      const error = new Error('Test error');

      await MonitoringService.logError(error);

      expect(mockConsoleError).toHaveBeenCalledWith('Application error:', error, {});
    });
  });

  describe('User Activity Logging', () => {
    it('should log user activities', async () => {
      await MonitoringService.logUserActivity('test_action', 'test_category', 'user123');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'User Activity: user123 performed test_action in test_category'
      );
    });

    it('should handle activities without user ID', async () => {
      await MonitoringService.logUserActivity('test_action', 'test_category');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'User Activity: anonymous performed test_action in test_category'
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should initialize performance monitoring', () => {
      const initSpy = jest.spyOn(MonitoringService, 'initializePerformanceMonitoring');
      MonitoringService.initializePerformanceMonitoring();
      expect(initSpy).toHaveBeenCalled();
    });
  });
});
