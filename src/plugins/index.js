import { registry } from './registry.js';
import { NextJSPlugin, NextJSPagesPlugin } from './nextjs-plugin.js';
import { ExpressPlugin } from './express-plugin.js';
import { ReactPlugin } from './react-plugin.js';
import { RemixPlugin } from './remix-plugin.js';
import { T3StackPlugin } from './t3-plugin.js';
import { MERNStackPlugin } from './mern-plugin.js';
import { MEANStackPlugin } from './mean-plugin.js';
import { FastifyPlugin } from './fastify-plugin.js';
import { FastAPIPlugin } from './fastapi-plugin.js';
import { DjangoPlugin } from './django-plugin.js';
import { GinPlugin } from './gin-plugin.js';
import { RailsPlugin } from './rails-plugin.js';
import { VuePlugin } from './vue-plugin.js';
import { SveltePlugin } from './svelte-plugin.js';
import { AngularPlugin } from './angular-plugin.js';
import { VanillaPlugin } from './vanilla-plugin.js';

// Register all built-in plugins
export function registerBuiltInPlugins() {
  // Original plugins
  registry.register(NextJSPlugin);
  registry.register(NextJSPagesPlugin);
  registry.register(ExpressPlugin);
  registry.register(ReactPlugin);
  
  // New full-stack plugins
  registry.register(RemixPlugin);
  registry.register(T3StackPlugin);
  registry.register(MERNStackPlugin);
  registry.register(MEANStackPlugin);
  
  // Backend framework plugins
  registry.register(FastifyPlugin);
  registry.register(FastAPIPlugin);
  registry.register(DjangoPlugin);
  registry.register(GinPlugin);
  registry.register(RailsPlugin);
  
  // Frontend framework plugins
  registry.register(VuePlugin);
  registry.register(SveltePlugin);
  registry.register(AngularPlugin);
  registry.register(VanillaPlugin);
}

// Auto-register plugins when module is imported
registerBuiltInPlugins();

export { registry } from './registry.js';
export { BasePlugin } from './base-plugin.js';
export { NextJSPlugin, NextJSPagesPlugin } from './nextjs-plugin.js';
export { ExpressPlugin } from './express-plugin.js';
export { ReactPlugin } from './react-plugin.js';
export { RemixPlugin } from './remix-plugin.js';
export { T3StackPlugin } from './t3-plugin.js';
export { MERNStackPlugin } from './mern-plugin.js';
export { MEANStackPlugin } from './mean-plugin.js';
export { FastifyPlugin } from './fastify-plugin.js';
export { FastAPIPlugin } from './fastapi-plugin.js';
export { DjangoPlugin } from './django-plugin.js';
export { GinPlugin } from './gin-plugin.js';
export { RailsPlugin } from './rails-plugin.js';
export { VuePlugin } from './vue-plugin.js';
export { SveltePlugin } from './svelte-plugin.js';
export { AngularPlugin } from './angular-plugin.js';
export { VanillaPlugin } from './vanilla-plugin.js';