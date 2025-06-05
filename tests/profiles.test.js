import { jest } from '@jest/globals';

// Mock modules before importing the actual functions
jest.unstable_mockModule('fs-extra', () => ({
  default: {
    ensureDir: jest.fn(),
    writeJson: jest.fn(),
    readJson: jest.fn(),
    pathExists: jest.fn(),
    readdir: jest.fn()
  }
}));

jest.unstable_mockModule('os', () => ({
  homedir: jest.fn(() => '/mock/home')
}));

// Import after mocking
const { saveProfile, listProfiles } = await import('../src/profiles.js');
const fsExtra = (await import('fs-extra')).default;

const { ensureDir, writeJson, readJson, pathExists, readdir } = fsExtra;

describe('Profile Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveProfile', () => {
    it('should save profile to correct location', async () => {
      const profileName = 'test-profile';
      const config = {
        projectType: 'fullstack',
        stack: 'nextjs-app',
        language: 'TypeScript'
      };

      ensureDir.mockResolvedValue();
      writeJson.mockResolvedValue();

      const result = await saveProfile(profileName, config);

      // Should create profile directory
      expect(ensureDir).toHaveBeenCalledWith('/mock/home/.claude-kickstart/profiles');
      
      // Should save profile
      expect(writeJson).toHaveBeenCalledWith(
        '/mock/home/.claude-kickstart/profiles/test-profile.json',
        config,
        { spaces: 2 }
      );
      
      // Should save as last config
      expect(ensureDir).toHaveBeenCalledWith('/mock/home/.claude-kickstart');
      expect(writeJson).toHaveBeenCalledWith(
        '/mock/home/.claude-kickstart/last-config.json',
        config,
        { spaces: 2 }
      );

      expect(result).toBe('/mock/home/.claude-kickstart/profiles/test-profile.json');
    });

    it('should handle save errors gracefully', async () => {
      const profileName = 'test-profile';
      const config = { projectType: 'fullstack' };

      ensureDir.mockResolvedValue();
      writeJson.mockRejectedValue(new Error('Permission denied'));

      await expect(saveProfile(profileName, config)).rejects.toThrow('Permission denied');
    });
  });

  describe('listProfiles', () => {
    it('should return list of profile names', async () => {
      ensureDir.mockResolvedValue();
      readdir.mockResolvedValue(['profile1.json', 'profile2.json', 'not-a-profile.txt']);

      const profiles = await listProfiles();

      expect(ensureDir).toHaveBeenCalledWith('/mock/home/.claude-kickstart/profiles');
      expect(readdir).toHaveBeenCalledWith('/mock/home/.claude-kickstart/profiles');
      expect(profiles).toEqual(['profile1', 'profile2']);
    });

    it('should return empty array on error', async () => {
      ensureDir.mockResolvedValue();
      readdir.mockRejectedValue(new Error('Directory not found'));

      const profiles = await listProfiles();

      expect(profiles).toEqual([]);
    });

    it('should handle empty directory', async () => {
      ensureDir.mockResolvedValue();
      readdir.mockResolvedValue([]);

      const profiles = await listProfiles();

      expect(profiles).toEqual([]);
    });
  });
});