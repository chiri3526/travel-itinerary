import { format } from 'date-fns';
import type { Itinerary } from '../types';
import { getSafeCoverImage } from '../utils/coverImage';

const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ITEMS = 200;
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 200;
const MAX_NOTE_LENGTH = 500;

type ImportedItem = {
  id: string;
  date: string;
  time: string;
  content: string;
  amount: number;
  note: string;
};

class FileService {
  exportToJSON(itinerary: Itinerary): void {
    try {
      const jsonString = JSON.stringify(itinerary, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const fileName = `${this.buildSafeFileName(itinerary.title)}_${format(new Date(), 'yyyyMMdd')}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('JSON のエクスポートに失敗しました。');
    }
  }

  async importFromJSON(file: File): Promise<Itinerary> {
    return new Promise((resolve, reject) => {
      if (!file.name.toLowerCase().endsWith('.json')) {
        reject(new Error('JSON ファイルを選択してください。'));
        return;
      }

      if (file.size > MAX_IMPORT_FILE_BYTES) {
        reject(new Error('ファイルサイズは 10MB 以下にしてください。'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result;
          if (typeof jsonString !== 'string' || jsonString.trim() === '') {
            reject(new Error('JSON ファイルが空です。'));
            return;
          }

          const data = JSON.parse(jsonString);
          resolve(this.normalizeImportedItinerary(data));
        } catch (error) {
          if (error instanceof SyntaxError) {
            reject(new Error('JSON の形式が正しくありません。'));
            return;
          }
          reject(error instanceof Error ? error : new Error('JSON の読み込みに失敗しました。'));
        }
      };
      reader.onerror = () => reject(new Error('JSON ファイルを読み込めませんでした。'));
      reader.readAsText(file);
    });
  }

  exportToMarkdown(itinerary: Itinerary): void {
    try {
      const markdown = this.convertToMarkdown(itinerary);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const fileName = `${this.buildSafeFileName(itinerary.title)}_${format(new Date(), 'yyyyMMdd')}.md`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Markdown のエクスポートに失敗しました。');
    }
  }

  downloadTemplate(): void {
    const template = `# 旅行プラン

**開始日**: 2026-04-17
**終了日**: 2026-04-19

---

## 2026-04-17

### 09:00 | 出発
- **金額**: 0
- **メモ**: 自宅から空港へ移動

### 12:00 | 昼食
- **金額**: 1500
- **メモ**: 駅前のレストラン

---

## 2026-04-18

### 10:00 | 観光
- **金額**: 2000
- **メモ**: 入場チケットを事前購入
`;

    const blob = new Blob([template], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const fileName = `itinerary_template_${format(new Date(), 'yyyyMMdd')}.md`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async importFromMarkdown(file: File): Promise<Itinerary> {
    return new Promise((resolve, reject) => {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith('.md') && !lowerName.endsWith('.markdown')) {
        reject(new Error('Markdown ファイルを選択してください。'));
        return;
      }

      if (file.size > MAX_IMPORT_FILE_BYTES) {
        reject(new Error('ファイルサイズは 10MB 以下にしてください。'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const markdown = event.target?.result;
          if (typeof markdown !== 'string' || markdown.trim() === '') {
            reject(new Error('Markdown ファイルが空です。'));
            return;
          }

          resolve(this.parseMarkdown(markdown));
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Markdown の読み込みに失敗しました。'));
        }
      };
      reader.onerror = () => reject(new Error('Markdown ファイルを読み込めませんでした。'));
      reader.readAsText(file);
    });
  }

  private buildSafeFileName(title: string): string {
    const normalized = Array.from(title.trim())
      .map((char) => {
        const code = char.charCodeAt(0);
        if ('<>:"/\\|?*'.includes(char) || code < 32) {
          return '_';
        }
        return char;
      })
      .join('');
    return normalized.slice(0, 80) || 'itinerary';
  }

  private generateId(prefix: 'itinerary' | 'item'): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private assertDate(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`${fieldName} は YYYY-MM-DD 形式で指定してください。`);
    }
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`${fieldName} が不正です。`);
    }
    return value;
  }

  private normalizeText(value: unknown, fieldName: string, maxLength: number, allowEmpty = false): string {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} が不正です。`);
    }

    const normalized = value.trim();
    if (!allowEmpty && normalized.length === 0) {
      throw new Error(`${fieldName} を入力してください。`);
    }
    if (normalized.length > maxLength) {
      throw new Error(`${fieldName} は ${maxLength} 文字以内にしてください。`);
    }
    return normalized;
  }

  private normalizeAmount(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000000) {
      throw new Error('金額が不正です。');
    }
    return Math.floor(value);
  }

  private normalizeImportedItem(item: unknown): ImportedItem {
    if (!item || typeof item !== 'object') {
      throw new Error('行程データの形式が不正です。');
    }

    const raw = item as Record<string, unknown>;
    return {
      id: this.generateId('item'),
      date: this.assertDate(raw.date, '日付'),
      time: this.normalizeText(raw.time ?? '', '時刻', 10, true),
      content: this.normalizeText(raw.content, '内容', MAX_CONTENT_LENGTH),
      amount: this.normalizeAmount(raw.amount),
      note: this.normalizeText(raw.note ?? '', 'メモ', MAX_NOTE_LENGTH, true),
    };
  }

  private normalizeImportedItinerary(data: unknown): Itinerary {
    if (!data || typeof data !== 'object') {
      throw new Error('旅程データの形式が不正です。');
    }

    const raw = data as Record<string, unknown>;
    if (!Array.isArray(raw.items)) {
      throw new Error('items は配列で指定してください。');
    }
    if (raw.items.length > MAX_ITEMS) {
      throw new Error(`行程は ${MAX_ITEMS} 件以下にしてください。`);
    }

    const startDate = this.assertDate(raw.startDate, '開始日');
    const endDate = this.assertDate(raw.endDate, '終了日');
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('終了日は開始日以降にしてください。');
    }

    const now = new Date().toISOString();
    return {
      id: this.generateId('itinerary'),
      title: this.normalizeText(raw.title, 'タイトル', MAX_TITLE_LENGTH),
      startDate,
      endDate,
      items: raw.items.map((item) => this.normalizeImportedItem(item)),
      createdAt: now,
      updatedAt: now,
      coverImage: getSafeCoverImage(typeof raw.coverImage === 'string' ? raw.coverImage : ''),
    };
  }

  private convertToMarkdown(itinerary: Itinerary): string {
    const lines: string[] = [];
    lines.push(`# ${itinerary.title}`, '');
    lines.push(`**開始日**: ${itinerary.startDate}`);
    lines.push(`**終了日**: ${itinerary.endDate}`, '', '---', '');

    const itemsByDate = new Map<string, typeof itinerary.items>();
    itinerary.items.forEach((item) => {
      if (!itemsByDate.has(item.date)) {
        itemsByDate.set(item.date, []);
      }
      itemsByDate.get(item.date)?.push(item);
    });

    Array.from(itemsByDate.keys())
      .sort()
      .forEach((date) => {
        lines.push(`## ${date}`, '');
        const items = [...(itemsByDate.get(date) ?? [])].sort((left, right) =>
          left.time.localeCompare(right.time),
        );

        items.forEach((item) => {
          lines.push(`### ${item.time || '未設定'} | ${item.content}`);
          if (item.amount > 0) {
            lines.push(`- **金額**: ${item.amount}`);
          }
          if (item.note) {
            lines.push(`- **メモ**: ${item.note}`);
          }
          lines.push('');
        });

        lines.push('---', '');
      });

    return lines.join('\n');
  }

  private parseMarkdown(markdown: string): Itinerary {
    const lines = markdown.split(/\r?\n/);
    let title = '';
    let startDate = '';
    let endDate = '';
    const items: ImportedItem[] = [];

    let currentDate = '';
    let currentTime = '';
    let currentContent = '';
    let currentAmount = 0;
    let currentNote = '';

    const pushCurrentItem = () => {
      if (!currentDate || !currentContent) {
        return;
      }
      if (items.length >= MAX_ITEMS) {
        throw new Error(`行程は ${MAX_ITEMS} 件以下にしてください。`);
      }
      items.push(
        this.normalizeImportedItem({
          date: currentDate,
          time: currentTime,
          content: currentContent,
          amount: currentAmount,
          note: currentNote,
        }),
      );
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        continue;
      }

      if (line.startsWith('# ') && !title) {
        title = line.slice(2).trim();
        continue;
      }

      if (line.startsWith('**開始日**:')) {
        startDate = line.split(':').slice(1).join(':').trim();
        continue;
      }

      if (line.startsWith('**終了日**:')) {
        endDate = line.split(':').slice(1).join(':').trim();
        continue;
      }

      if (line.startsWith('## ')) {
        pushCurrentItem();
        currentDate = line.slice(3).trim();
        currentTime = '';
        currentContent = '';
        currentAmount = 0;
        currentNote = '';
        continue;
      }

      if (line.startsWith('### ')) {
        pushCurrentItem();
        const [timePart, ...contentParts] = line.slice(4).split('|');
        currentTime = (timePart ?? '').trim();
        currentContent = contentParts.join('|').trim();
        currentAmount = 0;
        currentNote = '';
        continue;
      }

      if (line.startsWith('- **金額**:')) {
        const amountValue = Number(line.split(':').slice(1).join(':').trim());
        currentAmount = Number.isFinite(amountValue) ? amountValue : 0;
        continue;
      }

      if (line.startsWith('- **メモ**:')) {
        currentNote = line.split(':').slice(1).join(':').trim();
      }
    }

    pushCurrentItem();

    return this.normalizeImportedItinerary({
      title,
      startDate,
      endDate,
      items,
      coverImage: '',
    });
  }
}

export default new FileService();
