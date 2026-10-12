import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 去掉摘要末尾的「关键词：…」SEO 尾巴。
 *
 * 背景：后台文章的摘要常以「关键词：a、b、c」结尾（原先用于搜索优化），
 * 直接展示给客户会像关键词堆砌，削弱阅读体验与正式感。
 * 处理原则：**只剥离位于末尾的那一段**，数据本身不改动（原文仍在数据里，
 * 文章页正文、站点地图与结构化数据不受影响），因此不影响已有收录。
 */
export function stripKeywordTail(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/[\s，,、]*(?:关键词|关键字)[：:][^\n]*$/u, '')
    .replace(/[\s，,、]+$/u, '')
    .trim();
}
