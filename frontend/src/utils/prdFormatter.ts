/**
 * Format markdown content to beautiful, readable HTML
 * Used across all PRD viewer components for consistent formatting
 */
export const formatPRDMarkdown = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '<p class="text-gray-500 italic">No content available</p>';
  }
  
  try {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    let formatted = content
      // Clean up CSS artifacts and class names
      .replace(/\b\d+\s+[a-z-]+-[a-z0-9-]+/g, '')
      .replace(/\bclass="[^"]*"/g, '')
      .replace(/\bstyle="[^"]*"/g, '')
      
      // Convert headers (do larger headers first to avoid conflicts), add ids for deep links
      .replace(/^##### (.*$)/gim, (_m, p1) => {
        const id = slugify(p1);
        return `<h5 id="${id}" class="text-base font-semibold text-gray-800 mt-4 mb-2">${p1}</h5>`;
      })
      .replace(/^#### (.*$)/gim, (_m, p1) => {
        const id = slugify(p1);
        return `<h4 id="${id}" class="text-lg font-semibold text-gray-800 mt-6 mb-3">${p1}</h4>`;
      })
      .replace(/^### (.*$)/gim, (_m, p1) => {
        const id = slugify(p1);
        return `<h3 id="${id}" class="text-xl font-semibold text-gray-900 mt-8 mb-4">${p1}</h3>`;
      })
      .replace(/^## (.*$)/gim, (_m, p1) => {
        const id = slugify(p1);
        return `<h2 id="${id}" class="text-2xl font-bold text-gray-900 mt-10 mb-5 pb-2 border-b border-gray-200">${p1}</h2>`;
      })
      .replace(/^# (.*$)/gim, (_m, p1) => {
        const id = slugify(p1);
        return `<h1 id="${id}" class="text-3xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b-2 border-gray-300">${p1}</h1>`;
      })
      
      // Convert bold and italic (do combined first, use non-greedy with single-line flag)
      .replace(/\*\*\*([^*]+?)\*\*\*/gs, '<strong class="font-bold text-gray-900"><em class="italic">$1</em></strong>')
      .replace(/___([^_]+?)___/gs, '<strong class="font-bold text-gray-900"><em class="italic">$1</em></strong>')
      .replace(/\*\*([^*]+?)\*\*/gs, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/__([^_]+?)__/gs, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\*([^*]+?)\*/gs, '<em class="italic text-gray-700">$1</em>')
      .replace(/_([^_]+?)_/gs, '<em class="italic text-gray-700">$1</em>')
      
      // Convert inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Convert code blocks
      .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>')
      
      // Convert blockquotes
      .replace(/^> (.+$)/gim, '<blockquote class="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700">$1</blockquote>')
      
      // Convert horizontal rules
      .replace(/^---$/gim, '<hr class="my-8 border-t-2 border-gray-300"/>')
      .replace(/^\*\*\*$/gim, '<hr class="my-8 border-t-2 border-gray-300"/>')
      
      // Convert unordered lists (bullets)
      .replace(/^\s*[-*+]\s+(.+$)/gim, '<li class="mb-2 text-gray-700">$1</li>')
      // Convert ordered lists (numbers)
      .replace(/^\s*(\d+)\.\s+(.+$)/gim, '<li class="mb-2 text-gray-700">$2</li>');
      
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, function(match) {
      return '<ul class="list-disc ml-6 mb-4 mt-2 space-y-1">' + match + '</ul>';
    });
    
    // Convert paragraphs (split by double line breaks)
    formatted = formatted
      .split(/\n\n+/)
      .map(para => {
        para = para.trim();
        if (!para) return '';
        // Don't wrap if already has block-level HTML tags
        if (para.match(/^<(h[1-6]|div|ul|ol|pre|blockquote|hr)/)) return para;
        // Preserve single line breaks within paragraphs
        return '<p class="text-gray-700 leading-relaxed mb-4">' + para.replace(/\n/g, '<br/>') + '</p>';
      })
      .filter(p => p)
      .join('\n');
      
    return formatted;
  } catch (error) {
    console.error('Error in formatPRDMarkdown:', error);
    return '<div class="text-gray-700 whitespace-pre-wrap">' + content + '</div>';
  }
};

/**
 * Clean PRD content by removing artifacts and malformed data
 */
export const cleanPRDContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  try {
    return content
      // Remove CSS class artifacts
      .replace(/\b\d+\s+[a-z-]+-[a-z0-9-]+/g, '')
      .replace(/\b[a-z-]+-[a-z0-9-]+(?=\s)/g, '')
      // Remove empty HTML attributes
      .replace(/\s+(class|style|id)=""/g, '')
      // Clean up excessive whitespace but preserve paragraph breaks
      .replace(/\n\s+\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch (error) {
    console.error('Error in cleanPRDContent:', error);
    return content;
  }
};

/**
 * Extract a simple table of contents from markdown
 */
export interface PRDHeading {
  id: string;
  text: string;
  level: number; // 1..5
}

export const buildPRDTableOfContents = (content: string): PRDHeading[] => {
  if (!content || typeof content !== 'string') return [];
  const headings: PRDHeading[] = [];
  const lines = content.split(/\n/);
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  for (const line of lines) {
    const m = line.match(/^(#{1,5})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const rawText = m[2].trim();
      headings.push({ id: slugify(rawText), text: rawText, level });
    }
  }
  return headings;
};
