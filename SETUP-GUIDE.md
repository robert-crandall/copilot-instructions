# Setting Up Copilot Instructions in a New Project

This guide explains how to set up GitHub Copilot instructions in a new project using this repository as a reference.

## Option 1: Copy Required Files

1. Create the necessary directories:
   ```bash
   mkdir -p .github/instructions
   mkdir -p .github/prompts
   ```

2. Copy the main instruction file:
   ```bash
   cp /path/to/copilot-instructions/.github/copilot-instructions.md .github/
   ```

3. Copy relevant technology-specific instruction files:
   ```bash
   # For SvelteKit projects
   cp /path/to/copilot-instructions/.github/instructions/sveltekit.instructions.md .github/instructions/
   cp /path/to/copilot-instructions/.github/instructions/tailwindcss.instructions.md .github/instructions/
   ```

4. Copy prompt files as needed:
   ```bash
   cp /path/to/copilot-instructions/.github/prompts/create-svelte-component.prompt.md .github/prompts/
   ```

## Option 2: Use Git Submodules

1. Add this repository as a Git submodule:
   ```bash
   git submodule add https://github.com/YOUR_USERNAME/copilot-instructions.git .github/copilot-repo
   ```

2. Create symlinks to the instruction files:
   ```bash
   ln -s .github/copilot-repo/.github/copilot-instructions.md .github/copilot-instructions.md
   mkdir -p .github/instructions
   ln -s ../.github/copilot-repo/.github/instructions/sveltekit.instructions.md .github/instructions/
   ln -s ../.github/copilot-repo/.github/instructions/tailwindcss.instructions.md .github/instructions/
   ```

## Option 3: Remote References

Configure your VS Code settings to reference the instruction files directly from GitHub:

1. Create a `.vscode/settings.json` file:
   ```json
   {
     "github.copilot.chat.codeGeneration.useInstructionFiles": true,
     "github.copilot.chat.codeGeneration.instructions": [
       {
         "file": "https://raw.githubusercontent.com/YOUR_USERNAME/copilot-instructions/main/.github/copilot-instructions.md"
       },
       {
         "file": "https://raw.githubusercontent.com/YOUR_USERNAME/copilot-instructions/main/.github/instructions/sveltekit.instructions.md"
       },
       {
         "file": "https://raw.githubusercontent.com/YOUR_USERNAME/copilot-instructions/main/.github/instructions/tailwindcss.instructions.md"
       }
     ]
   }
   ```

## Verifying Setup

To verify your setup:

1. Open VS Code and ensure GitHub Copilot is activated.
2. Open the Command Palette (Cmd+Shift+P or Ctrl+Shift+P).
3. Run `Chat: Configure Instructions` and check if your instruction files appear in the list.
4. Test by asking Copilot to generate code, e.g., "Create a new SvelteKit component".
