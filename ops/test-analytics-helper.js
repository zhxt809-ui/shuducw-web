// 真实埋点 helper 单元测试（编译 src/lib/analytics.ts 后以假 window 调用）
// 目的：验证 trackEvent / trackToolUse / trackLeadClick 确实产出百度统计 _trackEvent 指令
const assert = require('assert');
const path = require('path');

const analytics = require(path.join(__dirname, '..', 'tmp-analytics', 'analytics.js'));

// 假 window：模拟 hm.js 加载后 _hmt 已被替换为带 push 方法的对象
const pushed = [];
global.window = {
  location: { pathname: '/self-check' },
  _hmt: { push: (cmd) => pushed.push(cmd) },
};

analytics.trackEvent('工具', '开始自查', '账务风险自查');
analytics.trackEvent('工具', '完成自查', '股东往来自查', 3);
analytics.trackEvent('表单', '提交成功', '联系页表单');
analytics.trackToolUse('增值税计算器');
analytics.trackLeadClick('点击电话');

assert.strictEqual(pushed.length, 5, '_trackEvent 指令数量应为 5');
assert.deepStrictEqual(pushed[0], ['_trackEvent', '工具', '开始自查', '账务风险自查']);
assert.deepStrictEqual(pushed[1], ['_trackEvent', '工具', '完成自查', '股东往来自查', 3]);
assert.deepStrictEqual(pushed[2], ['_trackEvent', '表单', '提交成功', '联系页表单']);
assert.deepStrictEqual(pushed[3], ['_trackEvent', '工具', '使用', '增值税计算器']);
// 线索点击自动带上当前页面路径
assert.deepStrictEqual(pushed[4], ['_trackEvent', '线索', '点击电话', '/self-check']);

// 场景 2：hm.js 尚未加载（_hmt 为普通数组）——应自动初始化数组并缓存指令
const pushed2 = [];
global.window = { location: { pathname: '/contact' } };
global.window._hmt = undefined;
analytics.trackEvent('表单', '提交失败', '联系页表单');
assert.ok(Array.isArray(global.window._hmt), '未初始化时应创建 _hmt 数组');
assert.deepStrictEqual(global.window._hmt[0], ['_trackEvent', '表单', '提交失败', '联系页表单']);

// 场景 3：服务端渲染（无 window）——应静默跳过且不抛错
delete global.window;
analytics.trackEvent('工具', '使用', '服务端调用');
analytics.trackToolUse('个税计算器');
analytics.trackLeadClick('点击小红书');

// 场景 4：label/value 缺省
global.window = { location: { pathname: '/' }, _hmt: { push: (c) => pushed2.push(c) } };
analytics.trackEvent('线索', '打开留资弹窗');
assert.deepStrictEqual(pushed2[0], ['_trackEvent', '线索', '打开留资弹窗', '']);

console.log('[PASS] 埋点 helper 全部场景通过：');
console.log('  - 已加载 hm.js：5 条指令格式正确（含 value 与页面路径）');
console.log('  - 未加载 hm.js：自动创建 _hmt 数组缓存指令');
console.log('  - 服务端渲染：静默跳过不抛错');
console.log('  - label 缺省：以空字符串占位，符合百度统计参数要求');
