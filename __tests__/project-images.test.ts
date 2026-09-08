// 数据引用的图片文件存在性测试（回归守护）
// 背景：OG 图曾指向不存在的 .png（d0a2a2e 修复）、avatar.svg 曾 404（P32 补上）。
// 这类"引用了不存在的文件"只在运行时暴露，用数据完整性测试挡住。

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { projects } from '@/data/projects';
import { personal } from '@/data/personal';

const publicRoot = path.resolve(process.cwd(), 'public');

describe('数据引用的图片文件存在性', () => {
  it('每个项目的 image 字段都有真实存在的封面文件', () => {
    for (const project of projects) {
      const filePath = path.join(publicRoot, project.image);
      expect(existsSync(filePath), `${project.id} 缺少封面: ${project.image}`).toBe(true);
    }
  });

  it('personal.avatar 指向的文件存在', () => {
    const filePath = path.join(publicRoot, personal.avatar);
    expect(existsSync(filePath), `缺少头像: ${personal.avatar}`).toBe(true);
  });
});
