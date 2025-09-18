# Tinkering

**Tinkering** is a Visual Studio Code extension that allows you to run Laravel Tinker easily from within VSCode.  
It provides a dedicated playground for PHP code execution, CodeLens for running scripts, and a play button in the editor title for quick execution.  

> A simple and convenient way to run Laravel Tinker directly inside VSCode, avoiding the complexity of writing commands manually in the terminal.

---

## Features

- **Create a Playground**: Automatically creates a `.tinkering/playground.php` file in your Laravel project where you can write Tinker code.
- **Run PHP Files with Tinker**: Execute any PHP file inside the `.tinkering/` folder using Laravel Tinker.
- **CodeLens Integration**: Displays a “Run Playground” link above your code for quick execution.
- **Editor Title Button**: Shows a play icon in the top-right corner of the editor for files in `.tinkering/`.
- **SQL Query Logging**: Outputs SQL queries, bindings, and execution time in a readable format in the terminal.
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

## Example

### 1. Playground File
```php
// .tinkering/playground.php
use App\Models\User;

// Retrieve User
User::where('email','author@example.com')->get();
```

### 2. Output
    [SQL] select * from `users` where `email` = ?
    [Bindings: author@example.com]
    [Time: 3.59 ms]
    ----------------------------
    = Illuminate\Database\Eloquent\Collection {#2065
        all: [
          App\Models\User {#6626
            id: 1,
            name: "John Author",
            email: "author@example.com",
            email_verified_at: null,
            #password: "$2y$12$8dXcRyxRmDyOpTaeqvnzpeeteYZKIIn6Hs7/m0fuuhP/CBvUBWA7e",
            #remember_token: null,
            created_at: "2025-08-13 02:35:02",
            updated_at: "2025-08-13 02:35:02",
          },
        ],
      }
