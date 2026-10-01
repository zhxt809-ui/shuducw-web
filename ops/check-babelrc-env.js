/**
 * 验证 .babelrc 的环境分组是否生效
 * 直接调用 Babel 解析配置（不启动 dev server），分别以 development / production 解析，
 * 打印实际生效的 plugins 与 presets，用客观证据确认：
 *   development → 含 react-dev-inspector 插件 + preset-react development:true
 *   production  → 只有 next/babel，干净
 */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');

// pnpm 严格布局下 @babel/core 未提升到根 node_modules，动态定位
function loadBabelCore() {
  try {
    return require('@babel/core');
  } catch (e) {
    const store = path.join(root, 'node_modules', '.pnpm');
    const dir = fs
      .readdirSync(store)
      .filter((d) => d.startsWith('@babel+core@'))
      .sort()
      .pop();
    if (!dir) throw e;
    return require(path.join(store, dir, 'node_modules', '@babel', 'core'));
  }
}
const babel = loadBabelCore();
console.log('@babel/core 版本:', babel.version);

const probe = path.join(root, 'src', 'app', 'page.tsx');

function describe(envName) {
  const cfg = babel.loadPartialConfig({ filename: probe, cwd: root, envName });
  const plugins = (cfg.options.plugins || []).map((p) => p.key || (p.file && p.file.request) || 'unknown');
  const presets = (cfg.options.presets || []).map((p) => p.key || (p.file && p.file.request) || 'unknown');
  return { envName, plugins, presets };
}

let ok = true;
for (const envName of ['development', 'production']) {
  const r = describe(envName);
  const hasInspector = r.plugins.some((p) => String(p).includes('inspector'));
  console.log(`\n[env=${envName}]`);
  console.log('  plugins:', r.plugins.length ? r.plugins.join(', ') : '(无)');
  console.log('  presets:', r.presets.join(', '));
  console.log('  react-dev-inspector 注入:', hasInspector ? '是' : '否');
  if (envName === 'development' && !hasInspector) ok = false;
  if (envName === 'production' && hasInspector) ok = false;
}

console.log('\n判定: ' + (ok ? '通过 — 开发环境保留调试能力，生产环境不注入' : '未通过 — 环境分组不符合预期'));
process.exit(ok ? 0 : 1);
