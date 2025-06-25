
import { MonitoringService } from '@/services/monitoringService';

describe('MonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  describe('Error Logging', () => {
    it('should log errors with context', async () => {
      const error = new Error('Test error');
      const context = { operation: 'test_operation' };

      await MonitoringService.logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        'Error in test_operation:',
        error,
        context
      );
    });

    it('should handle errors without context', async () => {
      const error = new Error('Test error');

      await MonitoringService.logError(error);

      expect(console.error).toHaveBeenCalledWith('Application error:', error, {});
    });
  });

  describe('User Activity Logging', () => {
    it('should log user activities', async () => {
      await MonitoringService.logUserActivity('test_action', 'test_category', 'user123');

      expect(console.log).toHaveBeenCalledWith(
        'User Activity: user123 performed test_action in test_category'
      );
    });

    it('should handle activities without user ID', async () => {
      await MonitoringService.logUserActivity('test_action', 'test_category');

      expect(console.log).toHaveBeenCalledWith(
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
