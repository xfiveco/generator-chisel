import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Get the git root directory
 * @param {string} cwd - Current working directory
 * @returns {string|null} - Git root path or null if not in a git repo
 */
function getGitRoot(cwd) {
  try {
    const result = execSync('git rev-parse --show-toplevel', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim().replace(/\\/g, '/');
  } catch {
    return null;
  }
}

/**
 * Get relative path from git root to a target directory
 * @param {string} gitRoot - Git root directory
 * @param {string} targetDir - Target directory
 * @returns {string} - Relative path
 */
function getRelativePath(gitRoot, targetDir) {
  // Normalize paths
  const normalizedGitRoot = path.resolve(gitRoot).replace(/\\/g, '/');
  const normalizedTarget = path.resolve(targetDir).replace(/\\/g, '/');

  // Get relative path
  return path.relative(normalizedGitRoot, normalizedTarget).replace(/\\/g, '/');
}

export default function huskyInit(api) {
  api.registerCommand(
    'husky-init',
    (command) =>
      command
        .description('initialize Husky git hooks for this theme')
        .option('--force', 'force initialization even if already configured'),
    async (options) => {
      const themeDir = api.resolve();
      const huskyDir = api.resolve('.husky');

      // Check if .husky directory exists
      if (!fs.existsSync(huskyDir)) {
        console.error('❌ .husky directory not found in theme folder.');
        console.error('   Make sure the theme was properly generated.');
        process.exit(1);
      }

      // Find git root
      const gitRoot = getGitRoot(themeDir);

      if (!gitRoot) {
        console.error('❌ No git repository found.');
        console.error('   Skipping husky initialization.');
        process.exit(1);
      }

      console.log(`📂 Git root: ${gitRoot}`);
      console.log(`📁 Theme dir: ${themeDir}`);

      // Calculate relative path from git root to .husky
      const relativePath = getRelativePath(gitRoot, huskyDir);
      console.log(`🔗 Husky path (relative to git root): ${relativePath}`);

      // Check if husky is already configured
      try {
        const currentHooksPath = execSync('git config core.hooksPath', {
          cwd: themeDir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();

        if (currentHooksPath && !options.force) {
          console.log(`\n✔ Husky is already configured.`);
          console.log(`  Current hooks path: ${currentHooksPath}`);
          console.log(`  Use --force to reconfigure.`);
          return;
        }
      } catch {
        // Not configured yet, continue
      }

      // Run husky from git root with the relative path
      console.log('\n🚀 Initializing Husky...');

      // Run husky with the relative path
      try {
        execSync(`npx husky ${relativePath}`, {
          cwd: gitRoot,
          stdio: 'inherit',
        });
      } catch (error) {
        console.error('\n❌ Husky initialization failed.');
        process.exit(1);
      }


      // Verify configuration
      try {
        const hooksPath = execSync('git config core.hooksPath', {
          cwd: themeDir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();

        console.log(`\n✅ Husky initialized successfully!`);
        console.log(`   Git hooks path: ${hooksPath}`);
        console.log(
          `\n   Pre-commit hook will now protect core/ folder modifications.`,
        );
      } catch {
        console.log(`\n✅ Husky initialized.`);
      }
    },
  );
}
