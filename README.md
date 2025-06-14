# Copilot Instructions Repository

This repository serves as a central location for GitHub Copilot instruction files. These instructions help Copilot generate code that follows your preferred coding standards, patterns, and practices across different projects.

## Structure

- `.github/copilot-instructions.md`: Main instructions file that applies globally.
- `.github/instructions/`: Folder for specific technology or task instructions.
- `.github/prompts/`: Folder for reusable prompt templates.
- `.github/references/`: Folder for comprehensive documentation references that support the instruction files.
- `sveltekit/`: Technology-specific documentation that can be referenced in instructions.

## How to Use

### Option 1: Direct Reference

You can reference these instruction files directly in your projects without copying them:

1. Set up your project's GitHub Copilot settings to use instruction files:
   ```json
   {
     "github.copilot.chat.codeGeneration.useInstructionFiles": true,
     "github.copilot.chat.codeGeneration.instructions": [
       {
         "file": "https://raw.githubusercontent.com/YOUR_USERNAME/copilot-instructions/main/.github/copilot-instructions.md"
       },
       {
         "file": "https://raw.githubusercontent.com/YOUR_USERNAME/copilot-instructions/main/.github/instructions/sveltekit.instructions.md"
       }
     ]
   }
   ```

### Option 2: Copy to Your Project

Alternatively, you can copy the relevant files to your project:

1. Create a `.github` directory in your project.
2. Copy `copilot-instructions.md` to this directory.
3. Create a `.github/instructions` directory and copy relevant instruction files.

### Option 3: Local Submodule

You can add this repository as a Git submodule:

```bash
git submodule add https://github.com/YOUR_USERNAME/copilot-instructions.git .github/copilot-repo
```

Then create symlinks or reference files directly:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": ".github/copilot-repo/.github/copilot-instructions.md"
    }
  ]
}
```

## Available Instructions

- **General**: Base coding standards for JS/TS projects
- **SvelteKit**: Best practices for SvelteKit development
- **TailwindCSS**: Guidelines for using Tailwind CSS (including v4)
- **daisyUI**: Component-based design patterns with daisyUI 5
- **Drizzle ORM**: Best practices for database operations with Drizzle

## Reference Documentation

The `.github/references/` directory contains comprehensive documentation that supports the instruction files:

- **tailwindcss-llms.md**: Complete Tailwind CSS utility documentation and examples
- **tailwindcss4-llms.md**: Tailwind CSS v4 specific features and migration guide
- **daiyui-llms.md**: Complete daisyUI 5 component documentation and usage patterns

These reference files provide detailed context that Copilot can use when the instruction files reference them, ensuring more accurate and comprehensive code generation.

## Contributing

Feel free to add new instruction files or update existing ones. Follow these guidelines:

1. Keep instructions concise and focused.
2. Use the front matter with `applyTo` patterns to target specific file types.
3. Provide code examples where helpful.
4. Organize instructions by technology or concern.
