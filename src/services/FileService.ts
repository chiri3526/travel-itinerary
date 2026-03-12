import type { Itinerary } from '../types';
import { format } from 'date-fns';

class FileService {
  exportToJSON(itinerary: Itinerary): void {
    try {
      const jsonString = JSON.stringify(itinerary, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const fileName = `${itinerary.title}_${format(new Date(), 'yyyyMMdd')}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('エクスポートに失敗しました。ブラウザの設定を確認してください。');
    }
  }

  async importFromJSON(file: File): Promise<Itinerary> {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!file.name.endsWith('.json')) {
        reject(new Error('JSONファイルを選択してください。'));
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('ファイルサイズが大きすぎます（最大10MB）。'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          
          if (!jsonString || jsonString.trim() === '') {
            reject(new Error('ファイルが空です。'));
            return;
          }

          const data = JSON.parse(jsonString);
          
          if (this.validateImportData(data)) {
            resolve(data as Itinerary);
          } else {
            reject(new Error('ファイル形式が正しくありません。有効な行程表ファイルを選択してください。'));
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            reject(new Error('JSONファイルの形式が正しくありません。ファイルが破損している可能性があります。'));
          } else {
            reject(new Error('ファイルの読み込みに失敗しました。'));
          }
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込み中にエラーが発生しました。もう一度お試しください。'));
      };
      
      reader.readAsText(file);
    });
  }

  validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['id', 'title', 'startDate', 'endDate', 'items', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate field types
    if (typeof data.id !== 'string' || data.id.trim() === '') {
      console.error('Invalid id field');
      return false;
    }
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      console.error('Invalid title field');
      return false;
    }
    if (typeof data.startDate !== 'string' || data.startDate.trim() === '') {
      console.error('Invalid startDate field');
      return false;
    }
    if (typeof data.endDate !== 'string' || data.endDate.trim() === '') {
      console.error('Invalid endDate field');
      return false;
    }
    if (!Array.isArray(data.items)) {
      console.error('Invalid items field - must be an array');
      return false;
    }
    if (typeof data.createdAt !== 'string' || data.createdAt.trim() === '') {
      console.error('Invalid createdAt field');
      return false;
    }
    if (typeof data.updatedAt !== 'string' || data.updatedAt.trim() === '') {
      console.error('Invalid updatedAt field');
      return false;
    }

    // Validate date formats
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid date format');
        return false;
      }
    } catch {
      console.error('Date parsing failed');
      return false;
    }

    // Validate items array
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item || typeof item !== 'object') {
        console.error(`Invalid item at index ${i}`);
        return false;
      }
      if (typeof item.id !== 'string' ||
          typeof item.date !== 'string' ||
          typeof item.time !== 'string' ||
          typeof item.content !== 'string' ||
          typeof item.amount !== 'number' ||
          typeof item.note !== 'string') {
        console.error(`Invalid item fields at index ${i}`);
        return false;
      }
      
      // Validate amount is not negative
      if (item.amount < 0) {
        console.error(`Negative amount at item index ${i}`);
        return false;
      }
    }

    return true;
  }

  // MD形式でエクスポート
  exportToMarkdown(itinerary: Itinerary): void {
    try {
      const markdown = this.convertToMarkdown(itinerary);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const fileName = `${itinerary.title}_${format(new Date(), 'yyyyMMdd')}.md`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('エクスポートに失敗しました。');
    }
  }

  // テンプレートMDファイルをダウンロード
  downloadTemplate(): void {
    const template = `# 旅行名

**開始日**: 2024-01-01
**終了日**: 2024-01-03

---

## 2024-01-01

### 09:00 | 出発
- **金額**: 0
- **備考**: 自宅から出発

### 12:00 | 昼食
- **金額**: 1500
- **備考**: 駅前のレストラン

---

## 2024-01-02

### 10:00 | 観光
- **金額**: 2000
- **備考**: 入場料

### 18:00 | 夕食
- **金額**: 3000
- **備考**: ホテル近くの居酒屋

---

## 使い方

1. 「# 旅行名」の後に旅行のタイトルを記入
2. 「**開始日**」と「**終了日**」を YYYY-MM-DD 形式で記入
3. 各日付ごとに「## YYYY-MM-DD」の形式で日付を記入
4. 各項目は「### HH:MM | 内容」の形式で記入
5. 金額と備考は「- **金額**: 数値」「- **備考**: テキスト」の形式で記入
6. 金額や備考が不要な場合は省略可能
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

  // ItineraryをMarkdown形式に変換
  private convertToMarkdown(itinerary: Itinerary): string {
    let markdown = `# ${itinerary.title}\n\n`;
    markdown += `**開始日**: ${itinerary.startDate}\n`;
    markdown += `**終了日**: ${itinerary.endDate}\n\n`;
    markdown += `---\n\n`;

    // 日付ごとにグループ化
    const itemsByDate = new Map<string, typeof itinerary.items>();
    itinerary.items.forEach(item => {
      if (!itemsByDate.has(item.date)) {
        itemsByDate.set(item.date, []);
      }
      itemsByDate.get(item.date)!.push(item);
    });

    // 日付順にソート
    const sortedDates = Array.from(itemsByDate.keys()).sort();

    sortedDates.forEach(date => {
      markdown += `## ${date}\n\n`;
      const items = itemsByDate.get(date)!;
      
      // 時間順にソート
      items.sort((a, b) => a.time.localeCompare(b.time));

      items.forEach(item => {
        markdown += `### ${item.time || '時間未設定'} | ${item.content || '内容未設定'}\n`;
        if (item.amount > 0) {
          markdown += `- **金額**: ${item.amount}\n`;
        }
        if (item.note) {
          markdown += `- **備考**: ${item.note}\n`;
        }
        markdown += `\n`;
      });

      markdown += `---\n\n`;
    });

    return markdown;
  }

  // MD形式からインポート
  async importFromMarkdown(file: File): Promise<Itinerary> {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
        reject(new Error('Markdownファイル（.md）を選択してください。'));
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('ファイルサイズが大きすぎます（最大10MB）。'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const markdown = event.target?.result as string;
          
          if (!markdown || markdown.trim() === '') {
            reject(new Error('ファイルが空です。'));
            return;
          }

          const itinerary = this.parseMarkdown(markdown);
          resolve(itinerary);
        } catch (error) {
          reject(new Error(error instanceof Error ? error.message : 'ファイルの解析に失敗しました。'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込み中にエラーが発生しました。'));
      };
      
      reader.readAsText(file);
    });
  }

  // Markdownを解析してItineraryに変換
  private parseMarkdown(markdown: string): Itinerary {
    const lines = markdown.split('\n');
    let title = '';
    let startDate = '';
    let endDate = '';
    const items: Itinerary['items'] = [];
    
    let currentDate = '';
    let currentTime = '';
    let currentContent = '';
    let currentAmount = 0;
    let currentNote = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // タイトル
      if (line.startsWith('# ') && !title) {
        title = line.substring(2).trim();
        continue;
      }

      // 開始日
      if (line.startsWith('**開始日**:')) {
        startDate = line.split(':')[1].trim();
        continue;
      }

      // 終了日
      if (line.startsWith('**終了日**:')) {
        endDate = line.split(':')[1].trim();
        continue;
      }

      // 日付（## YYYY-MM-DD）
      if (line.startsWith('## ')) {
        // 前の項目を保存
        if (currentDate && currentContent) {
          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            date: currentDate,
            time: currentTime,
            content: currentContent,
            amount: currentAmount,
            note: currentNote,
          });
        }
        
        currentDate = line.substring(3).trim();
        currentTime = '';
        currentContent = '';
        currentAmount = 0;
        currentNote = '';
        continue;
      }

      // 項目（### HH:MM | 内容）
      if (line.startsWith('### ')) {
        // 前の項目を保存
        if (currentDate && currentContent) {
          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            date: currentDate,
            time: currentTime,
            content: currentContent,
            amount: currentAmount,
            note: currentNote,
          });
        }

        const itemLine = line.substring(4).trim();
        const parts = itemLine.split('|');
        
        if (parts.length >= 2) {
          currentTime = parts[0].trim();
          currentContent = parts[1].trim();
        } else {
          currentTime = '';
          currentContent = itemLine;
        }
        
        currentAmount = 0;
        currentNote = '';
        continue;
      }

      // 金額
      if (line.startsWith('- **金額**:')) {
        const amountStr = line.split(':')[1].trim();
        currentAmount = parseInt(amountStr) || 0;
        continue;
      }

      // 備考
      if (line.startsWith('- **備考**:')) {
        currentNote = line.split(':')[1].trim();
        continue;
      }
    }

    // 最後の項目を保存
    if (currentDate && currentContent) {
      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        date: currentDate,
        time: currentTime,
        content: currentContent,
        amount: currentAmount,
        note: currentNote,
      });
    }

    // バリデーション
    if (!title) {
      throw new Error('旅行名が見つかりません。「# 旅行名」の形式で記入してください。');
    }
    if (!startDate) {
      throw new Error('開始日が見つかりません。「**開始日**: YYYY-MM-DD」の形式で記入してください。');
    }
    if (!endDate) {
      throw new Error('終了日が見つかりません。「**終了日**: YYYY-MM-DD」の形式で記入してください。');
    }

    const now = new Date().toISOString();
    
    return {
      id: `itinerary-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title,
      startDate,
      endDate,
      items,
      createdAt: now,
      updatedAt: now,
    };
  }
}

export default new FileService();
