import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { chromium, type Browser } from 'playwright';
import { countWords } from './utils/text.js';
import { withTimeout } from './utils/retry.js';

export interface ExtractionResult {
  content: string;
  wordCount: number;
}

export class PlaywrightArticleExtractor {
  private browser: Browser | null = null;

  constructor(
    private readonly timeoutMs: number,
    private readonly minWordCount: number
  ) {}

  private async getBrowser(): Promise<Browser> {
    if (this.browser == null) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async extract(url: string): Promise<ExtractionResult | null> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const task = async (): Promise<ExtractionResult | null> => {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: this.timeoutMs,
        });

        const html = await page.content();
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const parsed = reader.parse();
        const content = (parsed?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const wordCount = countWords(content);

        if (!content || wordCount < this.minWordCount) {
          return null;
        }

        return { content, wordCount };
      };

      return await withTimeout(
        task(),
        this.timeoutMs,
        `Extraction timeout after ${this.timeoutMs}ms`
      );
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  async close(): Promise<void> {
    if (this.browser != null) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
