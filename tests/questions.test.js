import { describe, test, expect, beforeEach } from '@jest/globals';
import { DynamicQuestionGenerator } from '../src/questions.js';
import '../src/plugins/index.js'; // Auto-register plugins

describe('Dynamic Question Generator', () => {
  let questionGenerator;

  beforeEach(() => {
    questionGenerator = new DynamicQuestionGenerator();
  });

  describe('Base Questions', () => {
    test('should generate all base questions', async () => {
      const questions = await questionGenerator.getQuestions();

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);

      // Check for essential questions
      const questionNames = questions.map(q => q.name);
      expect(questionNames).toContain('projectType');
      expect(questionNames).toContain('deployment');
      expect(questionNames).toContain('saveProfile');
    });

    test('should include conditional questions', async () => {
      const questions = await questionGenerator.getQuestions();

      // Find stack question for fullstack projects
      const stackQuestion = questions.find(q => 
        q.name === 'stack' && 
        q.when && 
        typeof q.when === 'function'
      );

      expect(stackQuestion).toBeDefined();
      
      // Test the condition
      expect(stackQuestion.when({ projectType: 'fullstack' })).toBe(true);
      expect(stackQuestion.when({ projectType: 'cli' })).toBeFalsy();
    });

    test('should include custom stack questions', async () => {
      const questions = await questionGenerator.getQuestions();

      const customStackQuestion = questions.find(q => 
        q.name === 'customStack' && 
        q.type === 'input'
      );

      expect(customStackQuestion).toBeDefined();
      expect(customStackQuestion.when({ stack: 'custom' })).toBe(true);
      expect(customStackQuestion.when({ stack: 'nextjs-app' })).toBeFalsy();
    });
  });

  describe('Dynamic Choices', () => {
    test('should generate stack choices from plugins', () => {
      const choices = questionGenerator.getStackChoices('fullstack');

      expect(Array.isArray(choices)).toBe(true);
      expect(choices.length).toBeGreaterThan(0);
      
      // Should include registered plugins
      const choiceValues = choices.map(c => c.value);
      expect(choiceValues).toContain('nextjs-app');
      expect(choiceValues).toContain('custom');
    });

    test('should generate language choices based on stack', () => {
      // Test with Next.js stack
      const nextjsChoices = questionGenerator.getLanguageChoices({ stack: 'nextjs-app' });
      expect(nextjsChoices).toContain('TypeScript');
      expect(nextjsChoices).toContain('JavaScript');

      // Test with unknown stack
      const defaultChoices = questionGenerator.getLanguageChoices({ stack: 'unknown' });
      expect(defaultChoices).toContain('TypeScript');
      expect(defaultChoices).toContain('JavaScript');
      expect(defaultChoices).toContain('Python');
    });

    test('should generate authentication choices based on stack', () => {
      const nextjsChoices = questionGenerator.getAuthenticationChoices({ stack: 'nextjs-app' });
      
      expect(Array.isArray(nextjsChoices)).toBe(true);
      const choiceValues = nextjsChoices.map(c => c.value);
      expect(choiceValues).toContain('nextauth');
      expect(choiceValues).toContain('clerk');
      expect(choiceValues).toContain('none');
    });

    test('should generate testing choices based on language', () => {
      const jsChoices = questionGenerator.getTestingChoices({ language: 'JavaScript' });
      const pyChoices = questionGenerator.getTestingChoices({ language: 'Python' });

      expect(jsChoices.some(c => c.value === 'jest')).toBe(true);
      expect(jsChoices.some(c => c.value === 'vitest')).toBe(true);
      
      expect(pyChoices.some(c => c.value === 'pytest')).toBe(true);
      expect(pyChoices.some(c => c.value === 'unittest')).toBe(true);
    });
  });

  describe('Conditional Logic', () => {
    test('should determine when package manager is needed', () => {
      expect(questionGenerator.needsPackageManager({ language: 'JavaScript' })).toBe(true);
      expect(questionGenerator.needsPackageManager({ language: 'TypeScript' })).toBe(true);
      expect(questionGenerator.needsPackageManager({ language: 'Python' })).toBe(false);
      expect(questionGenerator.needsPackageManager({ stack: 'nextjs-app' })).toBe(true);
    });

    test('should determine when database is needed', () => {
      expect(questionGenerator.needsDatabase({ projectType: 'fullstack' })).toBe(true);
      expect(questionGenerator.needsDatabase({ projectType: 'backend' })).toBe(true);
      expect(questionGenerator.needsDatabase({ projectType: 'frontend' })).toBe(false);
      expect(questionGenerator.needsDatabase({ projectType: 'cli' })).toBe(false);
    });

    test('should determine when styling is needed', () => {
      expect(questionGenerator.needsStyling({ projectType: 'fullstack' })).toBe(true);
      expect(questionGenerator.needsStyling({ projectType: 'frontend' })).toBe(true);
      expect(questionGenerator.needsStyling({ projectType: 'backend' })).toBe(false);
      expect(questionGenerator.needsStyling({ projectType: 'cli' })).toBe(false);
    });

    test('should determine when authentication is needed', () => {
      expect(questionGenerator.needsAuthentication({ projectType: 'fullstack' })).toBe(true);
      expect(questionGenerator.needsAuthentication({ projectType: 'backend' })).toBe(true);
      expect(questionGenerator.needsAuthentication({ projectType: 'frontend' })).toBe(false);
    });

    test('should detect implied languages', () => {
      expect(questionGenerator.getImpliedLanguage('fastapi')).toBe('Python');
      expect(questionGenerator.getImpliedLanguage('django')).toBe('Python');
      expect(questionGenerator.getImpliedLanguage('gin')).toBe('Go');
      expect(questionGenerator.getImpliedLanguage('rails')).toBe('Ruby');
      expect(questionGenerator.getImpliedLanguage('nextjs-app')).toBe('JavaScript');
    });

    test('should check if language is implied by stack', () => {
      expect(questionGenerator.isLanguageImpliedByStack('fastapi')).toBe(true);
      expect(questionGenerator.isLanguageImpliedByStack('django')).toBe(true);
      expect(questionGenerator.isLanguageImpliedByStack('nextjs-app')).toBe(false);
      expect(questionGenerator.isLanguageImpliedByStack('react')).toBe(false);
    });
  });

  describe('Advanced Questions', () => {
    test('should include advanced option questions', () => {
      const questions = questionGenerator.getAdvancedQuestions();

      expect(Array.isArray(questions)).toBe(true);
      
      const questionNames = questions.map(q => q.name);
      expect(questionNames).toContain('wantAdvancedOptions');
      expect(questionNames).toContain('mcpServers');
      expect(questionNames).toContain('preferredWorkflow');
      expect(questionNames).toContain('teamFeatures');
    });

    test('should have conditional advanced questions', () => {
      const questions = questionGenerator.getAdvancedQuestions();

      const mcpQuestion = questions.find(q => q.name === 'mcpServers');
      expect(mcpQuestion.when({ wantAdvancedOptions: true })).toBe(true);
      expect(mcpQuestion.when({ wantAdvancedOptions: false })).toBeFalsy();
    });

    test('should include workflow choices', () => {
      const questions = questionGenerator.getAdvancedQuestions();
      const workflowQuestion = questions.find(q => q.name === 'preferredWorkflow');

      expect(workflowQuestion).toBeDefined();
      expect(workflowQuestion.choices).toBeDefined();
      
      const choices = workflowQuestion.choices.map(c => c.value);
      expect(choices).toContain('explore-plan-code');
      expect(choices).toContain('tdd');
      expect(choices).toContain('screenshot-ui');
    });
  });

  describe('Profile Questions', () => {
    test('should include profile save questions', () => {
      const questions = questionGenerator.getProfileQuestions();

      expect(Array.isArray(questions)).toBe(true);
      
      const questionNames = questions.map(q => q.name);
      expect(questionNames).toContain('saveProfile');
      expect(questionNames).toContain('profileName');
    });

    test('should have conditional profile name question', () => {
      const questions = questionGenerator.getProfileQuestions();
      const profileNameQuestion = questions.find(q => q.name === 'profileName');

      expect(profileNameQuestion.when({ saveProfile: true })).toBe(true);
      expect(profileNameQuestion.when({ saveProfile: false })).toBeFalsy();
    });

    test('should generate default profile names', () => {
      const questions = questionGenerator.getProfileQuestions();
      const profileNameQuestion = questions.find(q => q.name === 'profileName');

      const defaultName = profileNameQuestion.default({
        stack: 'nextjs-app',
        language: 'TypeScript'
      });

      expect(typeof defaultName).toBe('string');
      expect(defaultName).toContain('nextjs-app');
      expect(defaultName).toContain('typescript');
    });
  });

  describe('Answer Validation', () => {
    test('should validate complete valid answers', () => {
      const answers = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript',
        packageManager: 'npm',
        database: 'postgresql',
        authentication: 'nextauth',
        styling: 'tailwind',
        testing: 'jest',
        deployment: 'vercel',
        saveProfile: true,
        profileName: 'my-profile'
      };

      const { errors, warnings } = questionGenerator.validateAnswers(answers);
      
      expect(errors).toHaveLength(0);
      expect(Array.isArray(warnings)).toBe(true);
    });

    test('should detect missing custom stack description', () => {
      const answers = {
        projectType: 'fullstack',
        stack: 'custom'
        // Missing customStack
      };

      const { errors } = questionGenerator.validateAnswers(answers);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Custom stack'))).toBe(true);
    });

    test('should detect missing custom language', () => {
      const answers = {
        projectType: 'frontend',
        language: 'Other'
        // Missing customLanguage
      };

      const { errors } = questionGenerator.validateAnswers(answers);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Custom language'))).toBe(true);
    });

    test('should handle plugin compatibility warnings', () => {
      const answers = {
        projectType: 'fullstack',
        stack: 'nextjs-app'
      };

      const { warnings } = questionGenerator.validateAnswers(answers);
      
      expect(Array.isArray(warnings)).toBe(true);
      // Warnings depend on plugin compatibility implementation
    });
  });

  describe('Plugin Integration', () => {
    test('should get plugin-specific questions', async () => {
      const questions = await questionGenerator.getPluginQuestions('nextjs-app', {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript'
      });

      expect(Array.isArray(questions)).toBe(true);
      // Plugin-specific questions depend on plugin implementation
    });

    test('should handle missing plugin gracefully', async () => {
      const questions = await questionGenerator.getPluginQuestions('nonexistent', {});

      expect(Array.isArray(questions)).toBe(true);
      expect(questions).toHaveLength(0);
    });

    test('should get all questions including plugin questions', async () => {
      const questions = await questionGenerator.getAllQuestions();

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      
      // Should include base questions
      const questionNames = questions.map(q => q.name);
      expect(questionNames).toContain('projectType');
      expect(questionNames).toContain('deployment');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid stack selection gracefully', () => {
      const choices = questionGenerator.getStackChoices('invalid-project-type');
      
      expect(Array.isArray(choices)).toBe(true);
      expect(choices.some(c => c.value === 'custom')).toBe(true);
    });

    test('should handle invalid language selection gracefully', () => {
      const choices = questionGenerator.getLanguageChoices({ stack: 'invalid-stack' });
      
      expect(Array.isArray(choices)).toBe(true);
      expect(choices.length).toBeGreaterThan(0);
    });

    test('should handle invalid authentication context gracefully', () => {
      const choices = questionGenerator.getAuthenticationChoices({});
      
      expect(Array.isArray(choices)).toBe(true);
      expect(choices.some(c => c.value === 'none')).toBe(true);
    });

    test('should handle invalid testing context gracefully', () => {
      const choices = questionGenerator.getTestingChoices({ language: 'UnknownLanguage' });
      
      expect(Array.isArray(choices)).toBe(true);
      expect(choices.some(c => c.value === 'none')).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should generate questions quickly', async () => {
      const startTime = Date.now();
      
      await questionGenerator.getAllQuestions();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should be fast (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should handle multiple calls efficiently', async () => {
      const promises = Array(10).fill().map(() => questionGenerator.getAllQuestions());
      
      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // Should handle multiple calls efficiently
      expect(duration).toBeLessThan(500);
    });
  });
});