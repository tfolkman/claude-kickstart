import { describe, test, expect } from '@jest/globals';
import { NextJSPlugin } from '../src/plugins/nextjs-plugin.js';
import { ExpressPlugin } from '../src/plugins/express-plugin.js';
import { ReactPlugin } from '../src/plugins/react-plugin.js';
import { RemixPlugin } from '../src/plugins/remix-plugin.js';
import { T3StackPlugin } from '../src/plugins/t3-plugin.js';
import { MERNStackPlugin } from '../src/plugins/mern-plugin.js';
import { MEANStackPlugin } from '../src/plugins/mean-plugin.js';
import { FastifyPlugin } from '../src/plugins/fastify-plugin.js';
import { FastAPIPlugin } from '../src/plugins/fastapi-plugin.js';
import { DjangoPlugin } from '../src/plugins/django-plugin.js';
import { GinPlugin } from '../src/plugins/gin-plugin.js';
import { RailsPlugin } from '../src/plugins/rails-plugin.js';
import { VuePlugin } from '../src/plugins/vue-plugin.js';
import { SveltePlugin } from '../src/plugins/svelte-plugin.js';
import { AngularPlugin } from '../src/plugins/angular-plugin.js';
import { VanillaPlugin } from '../src/plugins/vanilla-plugin.js';

describe('Built-in Plugins', () => {
  describe('NextJSPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = NextJSPlugin.metadata;
      
      expect(metadata.name).toBe('nextjs-app');
      expect(metadata.displayName).toBe('Next.js 14 (App Router)');
      expect(metadata.category).toBe('stack');
      expect(metadata.languages).toContain('TypeScript');
      expect(metadata.languages).toContain('JavaScript');
    });

    test('should provide dependencies', () => {
      const plugin = new NextJSPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('next');
      expect(deps.production).toContain('react');
      expect(deps.production).toContain('react-dom');
    });

    test('should provide file structure', () => {
      const plugin = new NextJSPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('app/');
      expect(structure).toContain('page.');
      expect(structure).toContain('layout.');
    });

    test('should adapt to TypeScript configuration', () => {
      const plugin = new NextJSPlugin({ language: 'TypeScript' });
      const devDeps = plugin.getDevDependencies();
      
      expect(devDeps).toContain('typescript');
      expect(devDeps).toContain('@types/react');
    });

    test('should support Tailwind integration', () => {
      const plugin = new NextJSPlugin({ styling: 'tailwind' });
      const devDeps = plugin.getDevDependencies();
      const configFiles = plugin.getConfigFiles();
      
      expect(devDeps).toContain('tailwindcss');
      expect(configFiles.some(f => f.name === 'tailwind.config.ts')).toBe(true);
    });
  });

  describe('ExpressPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = ExpressPlugin.metadata;
      
      expect(metadata.name).toBe('express');
      expect(metadata.displayName).toBe('Node.js + Express');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('backend');
    });

    test('should provide backend dependencies', () => {
      const plugin = new ExpressPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('express');
      expect(deps.production).toContain('cors');
      expect(deps.production).toContain('helmet');
    });

    test('should provide backend file structure', () => {
      const plugin = new ExpressPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('controllers/');
      expect(structure).toContain('middleware/');
      expect(structure).toContain('routes/');
      expect(structure).toContain('app.');
      expect(structure).toContain('server.');
    });

    test('should adapt to database choice', () => {
      const plugin = new ExpressPlugin({ database: 'postgresql' });
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('pg');
    });
  });

  describe('ReactPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = ReactPlugin.metadata;
      
      expect(metadata.name).toBe('react');
      expect(metadata.displayName).toBe('React');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('frontend');
    });

    test('should provide React dependencies', () => {
      const plugin = new ReactPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('react');
      expect(deps.production).toContain('react-dom');
      expect(deps.production).toContain('react-router-dom');
    });

    test('should use Vite for development', () => {
      const plugin = new ReactPlugin();
      const devDeps = plugin.getDevDependencies();
      const commands = plugin.getCommands();
      
      expect(devDeps).toContain('vite');
      expect(devDeps).toContain('@vitejs/plugin-react');
      expect(commands.dev).toBe('vite');
    });
  });

  describe('RemixPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = RemixPlugin.metadata;
      
      expect(metadata.name).toBe('remix');
      expect(metadata.displayName).toBe('Remix');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide Remix dependencies', () => {
      const plugin = new RemixPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('@remix-run/node');
      expect(deps.production).toContain('@remix-run/react');
      expect(deps.production).toContain('@remix-run/serve');
    });

    test('should provide Remix file structure', () => {
      const plugin = new RemixPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('app/');
      expect(structure).toContain('routes/');
      expect(structure).toContain('root.');
    });
  });

  describe('T3StackPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = T3StackPlugin.metadata;
      
      expect(metadata.name).toBe('t3');
      expect(metadata.displayName).toBe('T3 Stack');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide T3 Stack dependencies', () => {
      const plugin = new T3StackPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('next');
      expect(deps.production).toContain('@trpc/server');
      expect(deps.production).toContain('@trpc/client');
      expect(deps.production).toContain('@trpc/react-query');
      expect(deps.production).toContain('zod');
    });

    test('should include Prisma and NextAuth', () => {
      const plugin = new T3StackPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('@prisma/client');
      expect(deps.production).toContain('next-auth');
    });
  });

  describe('MERNStackPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = MERNStackPlugin.metadata;
      
      expect(metadata.name).toBe('mern');
      expect(metadata.displayName).toBe('MERN Stack');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide MERN dependencies', () => {
      const plugin = new MERNStackPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('express');
      expect(deps.production).toContain('mongoose');
      expect(deps.production).toContain('react');
      expect(deps.production).toContain('react-dom');
    });

    test('should provide MERN file structure', () => {
      const plugin = new MERNStackPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('server/');
      expect(structure).toContain('client/');
      expect(structure).toContain('models/');
      expect(structure).toContain('routes/');
    });
  });

  describe('MEANStackPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = MEANStackPlugin.metadata;
      
      expect(metadata.name).toBe('mean');
      expect(metadata.displayName).toBe('MEAN Stack');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide MEAN dependencies', () => {
      const plugin = new MEANStackPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('express');
      expect(deps.production).toContain('mongoose');
      expect(deps.production).toContain('@angular/core');
      expect(deps.production).toContain('@angular/common');
    });
  });

  describe('FastifyPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = FastifyPlugin.metadata;
      
      expect(metadata.name).toBe('fastify');
      expect(metadata.displayName).toBe('Node.js + Fastify');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('backend');
    });

    test('should provide Fastify dependencies', () => {
      const plugin = new FastifyPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('fastify');
      expect(deps.production).toContain('@fastify/cors');
      expect(deps.production).toContain('@fastify/helmet');
    });
  });

  describe('FastAPIPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = FastAPIPlugin.metadata;
      
      expect(metadata.name).toBe('fastapi');
      expect(metadata.displayName).toBe('Python + FastAPI');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('backend');
    });

    test('should provide FastAPI dependencies', () => {
      const plugin = new FastAPIPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('fastapi');
      expect(deps.production).toContain('uvicorn[standard]');
      // Note: pydantic is included with FastAPI automatically
    });

    test('should provide FastAPI file structure', () => {
      const plugin = new FastAPIPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('app/');
      expect(structure).toContain('main.py');
      expect(structure).toContain('api/'); // FastAPI uses api/ instead of routers/
      expect(structure).toContain('models/');
    });
  });

  describe('DjangoPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = DjangoPlugin.metadata;
      
      expect(metadata.name).toBe('django');
      expect(metadata.displayName).toBe('Python + Django');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide Django dependencies', () => {
      const plugin = new DjangoPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('Django>=4.2,<5.0');
      expect(deps.production).toContain('djangorestframework');
      expect(deps.production).toContain('django-cors-headers');
    });
  });

  describe('GinPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = GinPlugin.metadata;
      
      expect(metadata.name).toBe('gin');
      expect(metadata.displayName).toBe('Go + Gin');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('backend');
    });

    test('should provide Go file structure', () => {
      const plugin = new GinPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('cmd/');
      expect(structure).toContain('internal/');
      expect(structure).toContain('pkg/');
      expect(structure).toContain('main.go');
    });
  });

  describe('RailsPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = RailsPlugin.metadata;
      
      expect(metadata.name).toBe('rails');
      expect(metadata.displayName).toBe('Ruby on Rails');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide Rails dependencies', () => {
      const plugin = new RailsPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('rails');
      expect(deps.production).toContain('pg');
      expect(deps.production).toContain('puma');
    });
  });

  describe('VuePlugin', () => {
    test('should have correct metadata', () => {
      const metadata = VuePlugin.metadata;
      
      expect(metadata.name).toBe('vue');
      expect(metadata.displayName).toBe('Vue.js');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('frontend');
    });

    test('should provide Vue dependencies', () => {
      const plugin = new VuePlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('vue');
      expect(deps.production).toContain('vue-router');
      expect(deps.production).toContain('pinia');
    });
  });

  describe('SveltePlugin', () => {
    test('should have correct metadata', () => {
      const metadata = SveltePlugin.metadata;
      
      expect(metadata.name).toBe('svelte');
      expect(metadata.displayName).toBe('Svelte');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('fullstack');
    });

    test('should provide Svelte dependencies', () => {
      const plugin = new SveltePlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('@sveltejs/kit');
      expect(deps.production).toContain('svelte');
    });
  });

  describe('AngularPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = AngularPlugin.metadata;
      
      expect(metadata.name).toBe('angular');
      expect(metadata.displayName).toBe('Angular');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('frontend');
    });

    test('should provide Angular dependencies', () => {
      const plugin = new AngularPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toContain('@angular/core');
      expect(deps.production).toContain('@angular/common');
      expect(deps.production).toContain('@angular/router');
    });
  });

  describe('VanillaPlugin', () => {
    test('should have correct metadata', () => {
      const metadata = VanillaPlugin.metadata;
      
      expect(metadata.name).toBe('vanilla');
      expect(metadata.displayName).toBe('Vanilla JS');
      expect(metadata.category).toBe('stack');
      expect(metadata.projectTypes).toContain('frontend');
    });

    test('should provide minimal dependencies', () => {
      const plugin = new VanillaPlugin();
      const deps = plugin.getDependencies();
      
      expect(deps.production).toEqual([]);
      expect(deps.development).toContain('vite');
    });

    test('should provide simple file structure', () => {
      const plugin = new VanillaPlugin();
      const structure = plugin.getFileStructure();
      
      expect(structure).toContain('src/');
      expect(structure).toContain('index.html');
      expect(structure).toContain('main.');
    });
  });

  describe('Plugin Compatibility Tests', () => {
    test('NextJS should be incompatible with other frontend frameworks', () => {
      const nextjs = new NextJSPlugin();
      const react = new ReactPlugin();
      const vue = new VuePlugin();
      const angular = new AngularPlugin();
      const svelte = new SveltePlugin();
      
      expect(nextjs.isCompatibleWith(react)).toBe(false);
      expect(nextjs.isCompatibleWith(vue)).toBe(false);
      expect(nextjs.isCompatibleWith(angular)).toBe(false);
      expect(nextjs.isCompatibleWith(svelte)).toBe(false);
    });

    test('Backend frameworks should be compatible with frontend frameworks', () => {
      const express = new ExpressPlugin();
      const fastify = new FastifyPlugin();
      const react = new ReactPlugin();
      const vue = new VuePlugin();
      
      expect(express.isCompatibleWith(react)).toBe(true);
      expect(express.isCompatibleWith(vue)).toBe(true);
      expect(fastify.isCompatibleWith(react)).toBe(true);
      expect(fastify.isCompatibleWith(vue)).toBe(true);
    });

    test('Full-stack frameworks should handle compatibility correctly', () => {
      const mern = new MERNStackPlugin();
      const mean = new MEANStackPlugin();
      const t3 = new T3StackPlugin();
      const react = new ReactPlugin();
      const angular = new AngularPlugin();
      
      // MERN includes React, so they should be compatible
      expect(mern.isCompatibleWith(react)).toBe(true);
      // MEAN includes Angular, not React
      expect(mean.isCompatibleWith(angular)).toBe(true);
      expect(mean.isCompatibleWith(react)).toBe(true); // Can work together
      // T3 is Next.js based, compatible with React
      expect(t3.isCompatibleWith(react)).toBe(true);
    });
  });

  describe('Plugin Configuration Adaptation', () => {
    test('plugins should adapt to TypeScript configuration', () => {
      const configs = [
        { language: 'TypeScript' },
        { language: 'JavaScript' }
      ];

      const plugins = [
        NextJSPlugin,
        ReactPlugin,
        VuePlugin,
        AngularPlugin
      ];

      plugins.forEach(PluginClass => {
        configs.forEach(config => {
          const plugin = new PluginClass(config);
          const devDeps = plugin.getDevDependencies();
          
          if (config.language === 'TypeScript') {
            expect(devDeps.some(dep => dep.includes('typescript') || dep.includes('@types/'))).toBe(true);
          }
        });
      });
    });

    test('plugins should adapt to styling configuration', () => {
      const stylingConfigs = [
        { styling: 'tailwind' },
        { styling: 'css-modules' },
        { styling: 'styled-components' }
      ];

      const frontendPlugins = [
        NextJSPlugin,
        ReactPlugin,
        VuePlugin
      ];

      frontendPlugins.forEach(PluginClass => {
        stylingConfigs.forEach(config => {
          const plugin = new PluginClass(config);
          const devDeps = plugin.getDevDependencies();
          const configFiles = plugin.getConfigFiles();
          
          if (config.styling === 'tailwind') {
            expect(devDeps).toContain('tailwindcss');
            expect(configFiles.some(f => f.name.includes('tailwind'))).toBe(true);
          }
        });
      });
    });

    test('backend plugins should adapt to database configuration', () => {
      const dbConfigs = [
        { database: 'postgresql' },
        { database: 'mysql' },
        { database: 'mongodb' }
      ];

      const backendPlugins = [
        ExpressPlugin,
        FastifyPlugin
      ];

      backendPlugins.forEach(PluginClass => {
        dbConfigs.forEach(config => {
          const plugin = new PluginClass(config);
          const deps = plugin.getDependencies();
          
          if (config.database === 'postgresql') {
            expect(deps.production).toContain('pg');
          }
          if (config.database === 'mysql') {
            expect(deps.production).toContain('mysql2');
          }
          if (config.database === 'mongodb') {
            expect(deps.production).toContain('mongoose');
          }
        });
      });
    });
  });
});