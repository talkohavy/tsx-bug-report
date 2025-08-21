# Debugger Step-Into (F11) Not Working with `node:async_hooks` in tsx

## 1. Summary

When debugging TypeScript files with tsx in VS Code, the debugger's "Step Into" (F11) functionality fails to work correctly when `node:async_hooks` is imported and used, even if the hook is not actively doing anything. The debugger steps over async function calls instead of stepping into them.

## 2. Environment

- **tsx version**: 4.20.4
- **Node.js version**: v22.16.0
- **TypeScript version**: 5.4.2
- **VS Code version**: 1.103
- **Operating System**: macOS

## 3. Expected Behavior

When pressing F11 (Step Into) on line 17 (`await attachMe();`), the debugger should step into the `attachMe()` function.

## 4. Actual Behavior

When pressing F11 (Step Into) on line 17 (`await attachMe();`), the debugger steps over the function call instead of stepping into it.

## 5. Reproduction Steps

### A. Create the following file structure:

```
project/
├── package.json
├── tsconfig.json
└── src/
    └── initServer.ts
```

### B. package.json

```json
{
  "name": "tsx-debug-bug",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "tsx watch src/initServer.ts"
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.3",
    "@types/node": "^24.3.0",
    "tsx": "^4.20.4",
    "typescript": "^5.4.2"
  }
}
```

### C. src/initServer.ts

```typescript
import express from "express";
import { createHook } from "node:async_hooks";

async function initServer() {
  await attachMe();

  const app = express();
  const PORT = process.env.PORT || 8000;

  const asyncHook = createHook({});

  asyncHook.enable(); // <--- Comment me out! and all of a sudden F11 works as expected!

  app.use(express.json());

  app.get("/", async (req, res) => {
    await attachMe(); // <--- Step Into (F11) fails to step into

    console.log("got here");

    res.json({ success: true });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

initServer();

async function attachMe() {
  console.log("Attaching...");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Attached!");
}
```

### D. Steps to reproduce:

1. Install dependencies: `npm install`
2. Open the project in VS Code
3. Set a breakpoint on line 17: `await attachMe();`
4. Start debugging with `npm run dev`
5. When the breakpoint is hit, press F11 (Step Into)
6. **Observe**: The debugger steps over the function instead of stepping into it

### E. Workaround verification:

1.  Comment out line 12: `asyncHook.enable();`
2.  Repeat steps 4-5
3.  **Observe**: Step Into (F11) now works correctly

## 6. Additional Testing

### Test 1: Compiled JavaScript works correctly

When the TypeScript file is compiled to JavaScript using `tsc` and run with sourcemaps:

```bash
npx tsc
node dist/initServer.js
```

The Step Into functionality works correctly, even with `node:async_hooks` enabled.

### Test 2: ESM JavaScript works correctly

When converting the file to ESM JavaScript (changing extension to `.js` and running directly):

```bash
node src/initServer.js
```

The Step Into functionality works correctly.

## 7. Impact

This bug significantly impacts the debugging experience for developers using tsx with any code that utilizes Node.js async_hooks, making it difficult to debug async function calls in such scenarios.
