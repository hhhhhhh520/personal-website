# LightRays WebGL 性能问题
> 创建时间: 2026-06-25 | 状态: 🟢已解决（2026-09-04）

## 问题描述

`components/effects/LightRays.tsx` 存在多个性能问题：

1. **useEffect 依赖数组过大** (line 269): 包含12个props，任何prop变化都会重建整个WebGL上下文
2. **无帧率限制**: 在144Hz+显示器上GPU满载运行
3. **空catch块** (line 220, 260): 吞掉所有渲染错误，无法调试
4. **mousemove 监听**: `followMouse={true}` 时每帧都响应鼠标移动

## 出现原因

**提交**: `bb5db39` (Light Rays背景)

LightRays 组件是第三方库或AI生成的代码，没有针对性能优化。在添加到项目时没有进行性能审查。

## 解决方案

**步骤**:

1. **减少依赖数组**:
```typescript
// 将非关键props改为ref
const propsRef = useRef(props);
propsRef.current = props;

useEffect(() => {
  // 只依赖关键props
  // 使用 propsRef.current 读取其他props
}, [props.raysColor, props.raysOrigin]);
```

2. **添加帧率限制**:
```typescript
const lastFrameTime = useRef(0);
const animate = (time: number) => {
  if (time - lastFrameTime.current < 16.67) { // 60fps
    requestAnimationFrame(animate);
    return;
  }
  lastFrameTime.current = time;
  // ... 渲染逻辑
};
```

3. **添加 prefers-reduced-motion 检查**:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) return; // 不启动动画
```

4. **修复空catch块**:
```typescript
catch (error) {
  console.debug('[LightRays] Render error:', error);
}
```

5. **考虑懒加载**: 使用 `next/dynamic` 只在首页加载

## 相关文件

- `components/effects/LightRays.tsx`
- `app/[locale]/page.tsx`

## 参考资料

- 提交 `bb5db39` 添加了 LightRays

## 解决记录（2026-09-04）

四项全部落地（着色器逐字节未动）：
1. **依赖数组** → props 收进 `propsRef`，effect 改 `[]` 仅挂载时初始化一次，任一 prop 引用变化不再重建 WebGL 上下文。
2. **帧率上限** → 动画循环加 `FRAME_INTERVAL`（~60fps），高刷屏不再 GPU 满载。
3. **`prefers-reduced-motion`** → 命中时只渲染一帧静态画面，不启动动画循环（省 GPU + 无障碍）。
4. **空 catch** → 渲染/清理两处改为 `console.debug` 记录，不再静默吞错。
