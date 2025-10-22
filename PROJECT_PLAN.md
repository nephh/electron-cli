# Electron CLI Project Plan

## Project Overview

**Name:** Volt (Electron CLI)  
**Purpose:** A developer-friendly CLI tool to rapidly scaffold Electron + Vite projects with optional integrations like Tailwind CSS, shadcn/ui, Next.js, and more.

**Tech Stack:**
- TypeScript
- Commander (CLI framework)
- Clack (Interactive prompts)
- Chalk (Terminal styling)
- Additional: execa, fs-extra, ora, gradient-string

---

## Architecture Design

### Core Principles

1. **Modularity**: Each feature (installer, template, config) is isolated
2. **Extensibility**: Easy to add new frameworks, tools, and options
3. **Type Safety**: Leverage TypeScript for robust development
4. **User Experience**: Intuitive prompts and helpful feedback
5. **Maintainability**: Clear separation of concerns

### Directory Structure

```
electron-cli/
├── src/
│   ├── cli/
│   │   ├── main.ts                 # Entry point, Commander setup
│   │   └── prompts.ts              # Clack prompt definitions
│   ├── installers/
│   │   ├── index.ts                # Installer registry/manager
│   │   ├── tailwind.ts             # Tailwind CSS installer
│   │   ├── eslint.ts               # ESLint installer
│   │   ├── prettier.ts             # Prettier installer
│   │   ├── shadcn.ts               # shadcn/ui installer
│   │   └── types.ts                # Installer interfaces
│   ├── templates/
│   │   ├── electron-vite/          # Base Electron + Vite template
│   │   ├── electron-nextjs/        # Electron + Next.js template
│   │   └── index.ts                # Template manager
│   ├── scaffolders/
│   │   ├── index.ts                # Main scaffolding orchestrator
│   │   ├── project.ts              # Project directory setup
│   │   └── files.ts                # File generation utilities
│   ├── utils/
│   │   ├── logger.ts               # Logging with chalk/ora
│   │   ├── package-manager.ts     # Detect & use npm/pnpm/yarn
│   │   ├── fs.ts                   # File system helpers
│   │   ├── git.ts                  # Git initialization
│   │   └── validation.ts           # Input validation
│   └── types/
│       ├── config.ts               # User configuration types
│       └── index.ts                # Shared types
├── templates/                      # Template files (copied during scaffolding)
│   ├── electron-vite/
│   │   ├── base/
│   │   ├── typescript/
│   │   └── javascript/
│   └── electron-nextjs/
│       └── base/
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── PROJECT_PLAN.md
```

---

## Implementation Plan

### Phase 1: Core CLI Infrastructure ✓ (Partially Complete)

**Status:** In Progress

**Tasks:**
- [x] Set up Commander for CLI parsing
- [x] Implement basic Clack prompts
- [ ] Create user configuration types
- [ ] Implement project name validation
- [ ] Add directory existence checks

**Files to Create/Modify:**
- `src/types/config.ts`
- `src/utils/validation.ts`
- `src/cli/main.ts` (enhance)

---

### Phase 2: Template System

**Goal:** Create a flexible template system that can be extended easily

**Tasks:**
1. Design template structure (base + variants)
2. Create base Electron + Vite template
3. Implement template copying with variable replacement
4. Support TypeScript and JavaScript variants

**Template Structure:**
```typescript
interface Template {
  name: string;
  description: string;
  path: string;
  variants: TemplateVariant[];
  defaultVariant: string;
}

interface TemplateVariant {
  name: string;
  language: 'typescript' | 'javascript';
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  files: TemplateFile[];
}

interface TemplateFile {
  source: string;
  destination: string;
  transform?: (content: string, config: UserConfig) => string;
}
```

**Files to Create:**
- `src/templates/index.ts`
- `src/templates/template-manager.ts`
- `src/types/template.ts`
- `templates/electron-vite/base/` (actual template files)

---

### Phase 3: Installer System (Plugin Architecture)

**Goal:** Create a plugin-like system where each optional feature is self-contained

**Design Pattern:**
```typescript
interface Installer {
  name: string;
  description: string;
  category: 'ui' | 'tooling' | 'testing' | 'framework';
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  
  // Can this installer run with the current config?
  isCompatible(config: UserConfig): boolean;
  
  // What does this installer depend on?
  getDependencies(): string[];
  
  // Install the feature
  install(projectPath: string, config: UserConfig): Promise<void>;
  
  // Post-install configuration
  configure?(projectPath: string, config: UserConfig): Promise<void>;
}
```

**Installer Registry:**
```typescript
// src/installers/index.ts
export const installers = new Map<string, Installer>([
  ['tailwind', tailwindInstaller],
  ['shadcn', shadcnInstaller],
  ['eslint', eslintInstaller],
  ['prettier', prettierInstaller],
  ['playwright', playwrightInstaller],
  ['vitest', vitestInstaller],
]);

export function getInstaller(name: string): Installer | undefined {
  return installers.get(name);
}

export function getAvailableInstallers(config: UserConfig): Installer[] {
  return Array.from(installers.values())
    .filter(installer => installer.isCompatible(config));
}
```

**Installers to Implement:**

1. **Tailwind CSS** (`src/installers/tailwind.ts`)
   - Add dependencies: tailwindcss, postcss, autoprefixer
   - Generate tailwind.config.js
   - Generate postcss.config.js
   - Add Tailwind directives to CSS
   - Update Vite config if needed

2. **shadcn/ui** (`src/installers/shadcn.ts`)
   - Depends on: Tailwind CSS
   - Run shadcn-ui init
   - Configure components.json
   - Set up path aliases

3. **ESLint** (`src/installers/eslint.ts`)
   - Add ESLint + plugins
   - Generate .eslintrc.js
   - Add scripts to package.json

4. **Prettier** (`src/installers/prettier.ts`)
   - Add Prettier
   - Generate .prettierrc
   - Add .prettierignore
   - Integrate with ESLint if present

5. **Testing (Vitest/Playwright)** (`src/installers/testing.ts`)
   - Configure test frameworks
   - Add test scripts
   - Create example tests

**Files to Create:**
- `src/installers/types.ts`
- `src/installers/index.ts`
- `src/installers/tailwind.ts`
- `src/installers/shadcn.ts`
- `src/installers/eslint.ts`
- `src/installers/prettier.ts`
- `src/installers/testing.ts`

---

### Phase 4: Scaffolding Engine

**Goal:** Orchestrate the entire project creation process

**Workflow:**
1. Validate project name and directory
2. Create project directory
3. Copy base template
4. Install dependencies based on selected options
5. Run installers in dependency order
6. Initialize git repository
7. Display success message with next steps

**Scaffolder Implementation:**
```typescript
// src/scaffolders/index.ts
export class ProjectScaffolder {
  constructor(
    private config: UserConfig,
    private logger: Logger,
  ) {}

  async scaffold(): Promise<void> {
    await this.validateConfig();
    await this.createDirectory();
    await this.copyTemplate();
    await this.installDependencies();
    await this.runInstallers();
    await this.initializeGit();
    await this.displaySuccess();
  }

  private async runInstallers(): Promise<void> {
    // Resolve installer dependencies
    const orderedInstallers = this.resolveInstallerOrder();
    
    for (const installerName of orderedInstallers) {
      const installer = getInstaller(installerName);
      if (installer) {
        await installer.install(this.config.projectPath, this.config);
        if (installer.configure) {
          await installer.configure(this.config.projectPath, this.config);
        }
      }
    }
  }

  private resolveInstallerOrder(): string[] {
    // Topological sort based on dependencies
    // Ensures installers run in correct order
  }
}
```

**Files to Create:**
- `src/scaffolders/index.ts`
- `src/scaffolders/project.ts`
- `src/scaffolders/files.ts`
- `src/scaffolders/dependency-resolver.ts`

---

### Phase 5: Enhanced CLI Experience

**Tasks:**
1. Improve prompts with better descriptions
2. Add prompt validation
3. Show dependency trees
4. Add spinner/progress indicators
5. Colorful success messages
6. Next steps guide

**Enhanced Prompts:**
```typescript
// src/cli/prompts.ts
export async function getProjectConfig(): Promise<UserConfig> {
  const config = await p.group({
    projectName: () => p.text({
      message: 'What would you like to name your project?',
      placeholder: 'my-electron-app',
      validate: validateProjectName,
    }),
    
    language: () => p.select({
      message: 'Will you be using TypeScript or JavaScript?',
      options: [
        { value: 'typescript', label: 'TypeScript', hint: 'Recommended' },
        { value: 'javascript', label: 'JavaScript' },
      ],
    }),
    
    template: () => p.select({
      message: 'Choose your base template:',
      options: [
        { value: 'electron-vite', label: 'Electron + Vite', hint: 'Fast, modern' },
        { value: 'electron-nextjs', label: 'Electron + Next.js', hint: 'Coming soon', disabled: true },
      ],
    }),
    
    styling: () => p.multiselect({
      message: 'Select styling tools:',
      options: [
        { value: 'tailwind', label: 'Tailwind CSS', hint: 'Utility-first CSS' },
        { value: 'shadcn', label: 'shadcn/ui', hint: 'Requires Tailwind' },
      ],
      required: false,
    }),
    
    tooling: () => p.multiselect({
      message: 'Select development tools:',
      options: [
        { value: 'eslint', label: 'ESLint', hint: 'Code linting' },
        { value: 'prettier', label: 'Prettier', hint: 'Code formatting' },
      ],
      required: false,
    }),
    
    testing: () => p.confirm({
      message: 'Include testing setup?',
      initialValue: false,
    }),
    
    git: () => p.confirm({
      message: 'Initialize Git repository?',
      initialValue: true,
    }),
    
    packageManager: () => p.select({
      message: 'Which package manager?',
      options: [
        { value: 'pnpm', label: 'pnpm', hint: 'Fast, efficient' },
        { value: 'npm', label: 'npm' },
        { value: 'yarn', label: 'yarn' },
      ],
    }),
  });

  return config;
}
```

**Files to Create/Modify:**
- `src/cli/prompts.ts`
- `src/utils/logger.ts`

---

### Phase 6: Utility Functions

**Package Manager Detection:**
```typescript
// src/utils/package-manager.ts
export async function detectPackageManager(): Promise<PackageManager> {
  // Check for lock files
  // Check for global installations
  // Return preferred package manager
}

export async function installDependencies(
  projectPath: string,
  manager: PackageManager
): Promise<void> {
  // Run appropriate install command
}
```

**Logger:**
```typescript
// src/utils/logger.ts
export class Logger {
  spinner: Ora;

  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  
  startSpinner(message: string): void;
  stopSpinner(success: boolean, message: string): void;
}
```

**Files to Create:**
- `src/utils/logger.ts`
- `src/utils/package-manager.ts`
- `src/utils/fs.ts`
- `src/utils/git.ts`
- `src/utils/validation.ts`

---

### Phase 7: Advanced Templates

**Goal:** Add Next.js and other framework support

**Tasks:**
1. Create Electron + Next.js template
2. Research and plan for other frameworks
3. Implement framework-specific installers

**Future Templates:**
- Electron + Next.js
- Electron + SvelteKit
- Electron + Nuxt
- Electron + Remix

---

### Phase 8: Testing & Quality

**Tasks:**
1. Write unit tests for utilities
2. Write integration tests for scaffolding
3. Test all installer combinations
4. Set up CI/CD pipeline

**Testing Structure:**
```
tests/
├── unit/
│   ├── utils/
│   ├── installers/
│   └── templates/
├── integration/
│   ├── scaffolding.test.ts
│   └── installers.test.ts
└── fixtures/
    └── sample-projects/
```

---

### Phase 9: Documentation & Publishing

**Tasks:**
1. Write comprehensive README
2. Create contribution guidelines
3. Document installer API
4. Add JSDoc comments
5. Publish to npm

---

## Extension Points

### Adding a New Installer

1. Create new file in `src/installers/`
2. Implement the `Installer` interface
3. Register in `src/installers/index.ts`
4. Add to prompts if user-selectable
5. Write tests

**Example:**
```typescript
// src/installers/my-new-tool.ts
import { Installer, UserConfig } from '../types';

export const myNewToolInstaller: Installer = {
  name: 'my-new-tool',
  description: 'My awesome new tool',
  category: 'tooling',
  
  dependencies: {
    'my-tool': '^1.0.0',
  },
  
  isCompatible(config: UserConfig): boolean {
    // Check if this installer can run
    return true;
  },
  
  getDependencies(): string[] {
    // Return other installers this depends on
    return [];
  },
  
  async install(projectPath: string, config: UserConfig): Promise<void> {
    // Installation logic
  },
  
  async configure(projectPath: string, config: UserConfig): Promise<void> {
    // Configuration logic
  },
};
```

### Adding a New Template

1. Create template directory in `templates/`
2. Add template metadata
3. Register in `src/templates/index.ts`
4. Add to prompts
5. Document specific requirements

---

## Type Definitions

### Core Types

```typescript
// src/types/config.ts
export interface UserConfig {
  projectName: string;
  projectPath: string;
  language: 'typescript' | 'javascript';
  template: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  installers: string[];
  features: {
    styling: string[];
    tooling: string[];
    testing: boolean;
    git: boolean;
  };
}

// src/types/index.ts
export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type Language = 'typescript' | 'javascript';
export type InstallerCategory = 'ui' | 'tooling' | 'testing' | 'framework';

export interface PackageJson {
  name: string;
  version: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  [key: string]: any;
}
```

---

## Best Practices

### Code Organization
- One installer per file
- Group related utilities
- Keep prompts in dedicated file
- Separate types from implementation

### Error Handling
- Validate all user inputs
- Provide helpful error messages
- Clean up on failure
- Log errors with context

### User Experience
- Show progress indicators
- Provide clear success/error messages
- Display next steps after completion
- Include examples in prompts

### Extensibility
- Use interfaces for contracts
- Registry pattern for installers
- Dependency injection where appropriate
- Clear extension points

---

## Future Enhancements

### Near Term
- [ ] Add more templates (Next.js, SvelteKit)
- [ ] Support for more UI libraries (Material-UI, Chakra)
- [ ] Testing framework options (Jest, Vitest, Playwright)
- [ ] CI/CD setup options (GitHub Actions, GitLab CI)

### Long Term
- [ ] Interactive preview mode
- [ ] Update command (upgrade dependencies)
- [ ] Plugin system for third-party installers
- [ ] Web-based configurator
- [ ] Template marketplace
- [ ] AI-powered recommendations

### Community
- [ ] Contribution guidelines
- [ ] Issue templates
- [ ] Code of conduct
- [ ] Discord community
- [ ] Video tutorials

---

## Success Metrics

- **Speed:** Project scaffolded in < 60 seconds
- **Size:** Generated project < 100MB (node_modules excluded)
- **Compatibility:** Works on Windows, macOS, Linux
- **Extensibility:** New installer in < 100 lines of code
- **Developer Experience:** 5-star ratings, positive feedback

---

## Getting Started with Development

### Priority Order

1. **Phase 2 (Templates)** - Foundation for everything
2. **Phase 6 (Utilities)** - Supporting infrastructure
3. **Phase 3 (Installers)** - Core functionality
4. **Phase 4 (Scaffolding)** - Tie it all together
5. **Phase 5 (CLI UX)** - Polish the experience
6. **Phase 8 (Testing)** - Ensure quality
7. **Phase 7 (Advanced Templates)** - Expand offerings
8. **Phase 9 (Documentation)** - Prepare for release

### First Steps

1. Define core types (`src/types/config.ts`)
2. Create base Electron + Vite template
3. Implement template copying
4. Build Tailwind installer (simplest)
5. Create scaffolding orchestrator
6. Test end-to-end

---

## Resources

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Clack Prompts](https://github.com/natemoo-re/clack)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Create T3 App](https://create.t3.gg/) - Inspiration
- [Create Next App](https://nextjs.org/docs/api-reference/create-next-app) - Reference

---

## Notes

- Keep the CLI fast - lazy load heavy dependencies
- Cache templates locally for offline use
- Provide sensible defaults for quick start
- Make every option optional (except project name)
- Follow semantic versioning strictly
- Keep backwards compatibility where possible

---

**Last Updated:** October 22, 2025  
**Version:** 1.0  
**Status:** Planning Phase
