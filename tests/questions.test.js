import { jest } from '@jest/globals';
import { getQuestions } from '../src/questions.js';

describe('Questions Configuration', () => {
  describe('getQuestions', () => {
    it('should return an array of questions', async () => {
      const questions = await getQuestions();
      
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should include required core questions', async () => {
      const questions = await getQuestions();
      const questionNames = questions.map(q => q.name);

      expect(questionNames).toContain('projectType');
      expect(questionNames).toContain('language');
      expect(questionNames).toContain('saveProfile');
    });

    it('should have conditional questions with when clauses', async () => {
      const questions = await getQuestions();
      
      // Find stack question for fullstack
      const fullstackStackQuestion = questions.find(q => 
        q.name === 'stack' && 
        q.when && 
        typeof q.when === 'function'
      );

      expect(fullstackStackQuestion).toBeDefined();
      expect(fullstackStackQuestion.when({ projectType: 'fullstack' })).toBe(true);
      expect(fullstackStackQuestion.when({ projectType: 'cli' })).toBe(false);
    });

    it('should have custom input questions that appear conditionally', async () => {
      const questions = await getQuestions();
      
      const customStackQuestion = questions.find(q => q.name === 'customStack');
      expect(customStackQuestion).toBeDefined();
      expect(customStackQuestion.type).toBe('input');
      expect(typeof customStackQuestion.when).toBe('function');
    });

    it('should have advanced options toggle', async () => {
      const questions = await getQuestions();
      
      const advancedOptionsQuestion = questions.find(q => q.name === 'wantAdvancedOptions');
      expect(advancedOptionsQuestion).toBeDefined();
      expect(advancedOptionsQuestion.type).toBe('confirm');
      expect(advancedOptionsQuestion.default).toBe(false);
    });

    it('should have MCP servers question conditional on advanced options', async () => {
      const questions = await getQuestions();
      
      const mcpQuestion = questions.find(q => q.name === 'mcpServers');
      expect(mcpQuestion).toBeDefined();
      expect(mcpQuestion.type).toBe('checkbox');
      expect(mcpQuestion.when({ wantAdvancedOptions: true })).toBe(true);
      expect(mcpQuestion.when({ wantAdvancedOptions: false })).toBe(false);
    });

    it('should have workflow preference question', async () => {
      const questions = await getQuestions();
      
      const workflowQuestion = questions.find(q => q.name === 'preferredWorkflow');
      expect(workflowQuestion).toBeDefined();
      expect(workflowQuestion.choices).toBeDefined();
      expect(workflowQuestion.choices.length).toBeGreaterThan(0);
    });

    it('should handle dynamic language choices based on stack', async () => {
      const questions = await getQuestions();
      
      const languageQuestion = questions.find(q => q.name === 'language');
      expect(languageQuestion).toBeDefined();
      expect(typeof languageQuestion.choices).toBe('function');
      
      // Test Python stack
      const pythonChoices = languageQuestion.choices({ stack: 'fastapi' });
      expect(pythonChoices).toEqual(['Python']);
      
      // Test general stack
      const generalChoices = languageQuestion.choices({ stack: 'react' });
      expect(generalChoices).toContain('TypeScript');
      expect(generalChoices).toContain('JavaScript');
    });

    it('should handle authentication choices based on stack', async () => {
      const questions = await getQuestions();
      
      const authQuestion = questions.find(q => q.name === 'authentication');
      expect(authQuestion).toBeDefined();
      expect(typeof authQuestion.choices).toBe('function');
      
      // Test Next.js stack (should include NextAuth)
      const nextjsChoices = authQuestion.choices({ stack: 'nextjs-app' });
      const hasNextAuth = nextjsChoices.some(choice => choice.value === 'nextauth');
      expect(hasNextAuth).toBe(true);
      
      // Test non-Next.js stack
      const expressChoices = authQuestion.choices({ stack: 'express' });
      const hasNextAuthExpress = expressChoices.some(choice => choice.value === 'nextauth');
      expect(hasNextAuthExpress).toBe(false);
    });

    it('should have proper validation for profile name', async () => {
      const questions = await getQuestions();
      
      const profileNameQuestion = questions.find(q => q.name === 'profileName');
      expect(profileNameQuestion).toBeDefined();
      expect(profileNameQuestion.type).toBe('input');
      expect(typeof profileNameQuestion.when).toBe('function');
      expect(typeof profileNameQuestion.default).toBe('function');
      
      // Test default generation
      const defaultName = profileNameQuestion.default({ 
        stack: 'nextjs-app', 
        language: 'TypeScript' 
      });
      expect(defaultName).toBe('nextjs-app-typescript');
    });
  });
});