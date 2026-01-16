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
}

export default new FileService();
