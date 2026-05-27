/**
 * Minimal Jest TypeScript → CommonJS transformer.
 * Uses Node 22+'s built-in TypeScript type stripper, then converts ES import/export
 * to CommonJS require/exports.
 */
const path = require("path");
const PROJECT_ROOT = path.resolve(__dirname);

function esmToCjs(code) {
  const exportedNames = [];

  // 1. Named imports: import { A, B } from "x" → const { A, B } = require("x")
  code = code.replace(
    /^import\s+\{([^}]+)\}\s+from\s+(['"])(.*?)\2\s*;?/gm,
    (_, names, q, mod) => `const {${names}} = require(${q}${mod}${q});`
  );

  // 2. Default imports: import X from "x" → const X = require("x").default || require("x")
  code = code.replace(
    /^import\s+(\w+)\s+from\s+(['"])(.*?)\2\s*;?/gm,
    (_, name, q, mod) => `const ${name} = require(${q}${mod}${q});`
  );

  // 3. Side-effect imports: import "x" → require("x")
  code = code.replace(
    /^import\s+(['"])(.*?)\1\s*;?/gm,
    (_, q, mod) => `require(${q}${mod}${q});`
  );

  // 4. export const/let/var/function/class X → const X = ... (capture names for module.exports)
  code = code.replace(
    /^export\s+(const|let|var)\s+(\w+)/gm,
    (_, keyword, name) => {
      exportedNames.push(name);
      return `${keyword} ${name}`;
    }
  );
  code = code.replace(
    /^export\s+(function|class|async function)\s+(\w+)/gm,
    (_, keyword, name) => {
      exportedNames.push(name);
      return `${keyword} ${name}`;
    }
  );

  // 5. export default
  code = code.replace(/^export\s+default\s+/gm, "module.exports = ");

  // 6. export { A, B, C } (re-exports and named exports)
  code = code.replace(
    /^export\s+\{([^}]+)\}\s*;?/gm,
    (_, names) => {
      const pairs = names.split(",").map(n => {
        const m = n.trim().match(/(\w+)(?:\s+as\s+(\w+))?/);
        if (!m) return "";
        const [, local, exported] = m;
        return `exports.${exported || local} = ${local};`;
      });
      return pairs.join("\n");
    }
  );

  // 7. Append module.exports for named exports at the end of the file
  if (exportedNames.length > 0) {
    const assigns = exportedNames.map(n => `  ${n}: ${n}`).join(",\n");
    code += `\nObject.assign(exports, {\n${assigns}\n});\n`;
  }

  return code;
}

function resolveAlias(code) {
  // require("@/...") → require("/absolute/path/...")
  code = code.replace(/require\((['"])@\/([^'"]+)\1\)/g, (_, q, p) => {
    const resolved = path.join(PROJECT_ROOT, p);
    return `require("${resolved}")`;
  });
  // leftover import ... from "@/..." (after ESM conversion, shouldn't exist, but just in case)
  code = code.replace(/from\s+(['"])@\/([^'"]+)\1/g, (_, q, p) => {
    const resolved = path.join(PROJECT_ROOT, p);
    return `from "${resolved}"`;
  });
  return code;
}

module.exports = {
  process(sourceText, sourcePath) {
    if (!sourcePath.endsWith(".ts") && !sourcePath.endsWith(".tsx")) {
      return { code: sourceText };
    }

    // Step 1: Strip TypeScript types using Node 22+ built-in
    let code = sourceText;
    try {
      const { stripTypeScriptTypes } = require("node:module");
      code = stripTypeScriptTypes(code, { mode: "strip" });
    } catch {
      // Minimal fallback
      code = code
        .replace(/^import\s+type\s+.*?;/gm, "")
        .replace(/\btype\s+\{[^}]*\}\s*(,\s*)?/g, "");
    }

    // Step 2: ESM → CJS
    code = esmToCjs(code);

    // Step 3: Resolve @/ alias in require() calls
    code = resolveAlias(code);

    return { code };
  },
};
