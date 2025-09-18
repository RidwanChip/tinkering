# Tinkering

**Tinkering** is a Visual Studio Code extension that allows you to run Laravel Tinker easily from within VSCode. It provides a dedicated playground for PHP code execution, CodeLens for running scripts, and a play button in the editor title for quick execution.

---

## Features

- **Create a Playground**: Automatically creates a `.tinkering/playground.php` file in your Laravel project where you can write Tinker code.
- **Run PHP Files with Tinker**: Execute any PHP file inside the `.tinkering/` folder using Laravel Tinker.
- **CodeLens Integration**: Displays a “Run Playground” link above your code for quick execution.
- **Editor Title Button**: Shows a play icon in the top-right corner of the editor for files in `.tinkering/`.
- **SQL Query Logging**: Outputs SQL queries, bindings, and execution time in a readable and colorful format in the terminal.
- **Keyboard Shortcuts**:
  - `Ctrl+Alt+I`: Initialize playground
  - `Ctrl+Alt+R`: Run current file

---

## Installation

1. Clone or download the repository.
2. Open the extension folder in VSCode.
3. Run `npm install` to install dependencies.
4. Compile TypeScript:  
   ```bash
   npm run compile
