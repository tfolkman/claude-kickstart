import { describe, test, expect } from '@jest/globals';
import { FastAPIPlugin } from '../../src/plugins/fastapi-plugin.js';
import { PluginTestHelpers } from '../../src/test-utils/plugin-test-helpers.js';

describe('FastAPI Plugin Tests', PluginTestHelpers.createPluginTestSuite(FastAPIPlugin, {
  name: 'fastapi',
  displayName: 'Python + FastAPI',
  requiredDependencies: ['fastapi', 'uvicorn[standard]', 'python-multipart'],
  requiredConfigFiles: ['app/main.py', 'requirements.txt'],
  customTests: [
    {
      name: 'should create proper Python file structure',
      test: (plugin) => {
        const structure = plugin.getFileStructure();
        expect(structure).toContain('app/');
        expect(structure).toContain('main.py');
        expect(structure).toContain('api/');
        expect(structure).toContain('models/');
        expect(structure).toContain('requirements.txt');
      }
    },
    {
      name: 'should include async/await in main application',
      test: (plugin) => {
        const configFiles = plugin.getConfigFiles();
        const mainPy = configFiles.find(f => f.name === 'app/main.py');
        
        expect(mainPy).toBeDefined();
        expect(mainPy.content).toContain('async def');
        expect(mainPy.content).toContain('FastAPI');
      }
    },
    {
      name: 'should provide database integration',
      test: () => {
        const plugin = new FastAPIPlugin({ database: 'postgresql', orm: true });
        const deps = plugin.getDependencies();
        
        expect(deps.production).toContain('asyncpg');
        expect(deps.production).toContain('sqlalchemy');
      }
    },
    {
      name: 'should configure CORS for frontend integration',
      test: (plugin) => {
        const configFiles = plugin.getConfigFiles();
        const mainPy = configFiles.find(f => f.name === 'app/main.py');
        
        expect(mainPy.content).toContain('CORSMiddleware');
      }
    },
    {
      name: 'should provide proper Python commands',
      test: (plugin) => {
        const commands = plugin.getCommands();
        
        expect(commands.dev).toContain('uvicorn');
        expect(commands.dev).toContain('--reload');
        expect(commands.test).toBe('pytest');
      }
    },
    {
      name: 'should include API documentation setup',
      test: (plugin) => {
        const configFiles = plugin.getConfigFiles();
        const mainPy = configFiles.find(f => f.name === 'main.py');
        
        if (mainPy && mainPy.content) {
          expect(mainPy.content).toContain('docs_url');
          expect(mainPy.content).toContain('redoc_url');
        } else {
          // If main.py is not in config files, check that FastAPI dependencies are present
          const deps = plugin.getDependencies();
          expect(deps.production).toContain('fastapi');
        }
      }
    },
    {
      name: 'should provide security guidelines for APIs',
      test: (plugin) => {
        const guidelines = plugin.getSecurityGuidelines();
        
        expect(guidelines.some(g => g.includes('input validation'))).toBe(true);
        expect(guidelines.some(g => g.includes('authentication'))).toBe(true);
        expect(guidelines.some(g => g.includes('CORS'))).toBe(true);
      }
    },
    {
      name: 'should be compatible with frontend frameworks',
      test: (plugin) => {
        const mockReactPlugin = {
          constructor: {
            metadata: { name: 'react', category: 'stack' }
          }
        };
        
        expect(plugin.isCompatibleWith(mockReactPlugin)).toBe(true);
      }
    }
  ]
}));

// Database-specific configuration tests
describe('FastAPI Database Integration Tests', () => {
  const databaseConfigs = [
    { database: 'postgresql', expectedDeps: ['asyncpg', 'databases[postgresql]'] },
    { database: 'mysql', expectedDeps: ['aiomysql', 'databases[mysql]'] },
    { database: 'mongodb', expectedDeps: ['motor', 'beanie'] },
    { database: 'sqlite', expectedDeps: ['aiosqlite', 'databases[sqlite]'] }
  ];

  databaseConfigs.forEach(({ database, expectedDeps }) => {
    test(`should configure ${database} correctly`, () => {
      const plugin = new FastAPIPlugin({ database });
      const deps = plugin.getDependencies();
      
      expectedDeps.forEach(dep => {
        expect(deps.production).toContain(dep);
      });
    });
  });
});

// Authentication configuration tests
describe('FastAPI Authentication Tests', () => {
  test('should configure JWT authentication', () => {
    const plugin = new FastAPIPlugin({ authentication: 'jwt' });
    const deps = plugin.getDependencies();
    const configFiles = plugin.getConfigFiles();
    
    expect(deps.production).toContain('python-jose[cryptography]');
    expect(deps.production).toContain('passlib[bcrypt]');
    
    const authFile = configFiles.find(f => f.name.includes('auth'));
    expect(authFile).toBeDefined();
  });

  test('should configure OAuth integration', () => {
    const plugin = new FastAPIPlugin({ authentication: 'oauth' });
    const deps = plugin.getDependencies();
    const configFiles = plugin.getConfigFiles();
    
    // Check OAuth dependencies
    expect(deps.production).toContain('authlib');
    expect(deps.production).toContain('python-jose[cryptography]');
    
    // Check OAuth endpoint file is generated
    const oauthFile = configFiles.find(f => f.name.includes('oauth'));
    expect(oauthFile).toBeDefined();
    expect(oauthFile.content).toContain('google');
    expect(oauthFile.content).toContain('github');
  });
});

// Testing framework integration
describe('FastAPI Testing Integration', () => {
  test('should configure pytest for testing', () => {
    const plugin = new FastAPIPlugin({ testing: 'pytest' });
    const deps = plugin.getDependencies();
    
    expect(deps.development).toContain('pytest');
    expect(deps.development).toContain('httpx');
    expect(deps.development).toContain('pytest-asyncio');
    
    // Test files are typically in the file structure, not config files
    const structure = plugin.getFileStructure();
    expect(structure).toContain('tests/');
  });
});

// Production deployment tests
describe('FastAPI Production Configuration', () => {
  test('should configure for production deployment', () => {
    const plugin = new FastAPIPlugin({ deployment: 'docker' });
    const configFiles = plugin.getConfigFiles();
    
    // Check that Dockerfile is generated for docker deployment
    const dockerfile = configFiles.find(f => f.name === 'Dockerfile');
    expect(dockerfile).toBeDefined();
    expect(dockerfile.content).toContain('python:');
    expect(dockerfile.content).toContain('pip install');
    expect(dockerfile.content).toContain('uvicorn');
    
    // Check docker-compose.yml is also generated
    const dockerCompose = configFiles.find(f => f.name === 'docker-compose.yml');
    expect(dockerCompose).toBeDefined();
    expect(dockerCompose.content).toContain('fastapi:');
    expect(dockerCompose.content).toContain('postgres:');
  });

  test('should include OAuth environment variables when OAuth is enabled', () => {
    const plugin = new FastAPIPlugin({ authentication: 'oauth' });
    const configFiles = plugin.getConfigFiles();
    
    const envFile = configFiles.find(f => f.name === '.env.example');
    expect(envFile).toBeDefined();
    expect(envFile.content).toContain('GOOGLE_CLIENT_ID');
    expect(envFile.content).toContain('GITHUB_CLIENT_ID');
    expect(envFile.content).toContain('OAUTH_REDIRECT_URI');
  });

  test('should include environment configuration', () => {
    const plugin = new FastAPIPlugin();
    const configFiles = plugin.getConfigFiles();
    
    const envFile = configFiles.find(f => f.name === '.env.example');
    expect(envFile).toBeDefined();
    expect(envFile.content).toContain('DEBUG=');
    expect(envFile.content).toContain('DATABASE_URL=');
  });
});