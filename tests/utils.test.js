import { formatError, formatSuccess, formatWarning, formatInfo } from '../src/utils.js';

describe('Utility Functions', () => {
  describe('formatError', () => {
    it('should format error messages correctly', () => {
      const result = formatError('Test error message');
      expect(result).toContain('❌ Error: Test error message');
    });
  });

  describe('formatSuccess', () => {
    it('should format success messages correctly', () => {
      const result = formatSuccess('Test success message');
      expect(result).toContain('✅ Test success message');
    });
  });

  describe('formatWarning', () => {
    it('should format warning messages correctly', () => {
      const result = formatWarning('Test warning message');
      expect(result).toContain('⚠️  Test warning message');
    });
  });

  describe('formatInfo', () => {
    it('should format info messages correctly', () => {
      const result = formatInfo('Test info message');
      expect(result).toContain('ℹ️  Test info message');
    });
  });
});