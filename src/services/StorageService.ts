import type { Itinerary } from '../types';

class StorageService {
  private readonly STORAGE_KEY = 'travel_itineraries';

  getAllItineraries(): Itinerary[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      
      const parsed = JSON.parse(data);
      
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.error('Invalid data format in localStorage');
        return [];
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to load itineraries:', error);
      
      if (error instanceof DOMException) {
        if (error.name === 'SecurityError') {
          throw new Error('ストレージへのアクセスが拒否されました。プライベートモードを無効にしてください。');
        }
      }
      
      if (error instanceof SyntaxError) {
        console.error('Corrupted data in localStorage, clearing...');
        // Clear corrupted data
        try {
          localStorage.removeItem(this.STORAGE_KEY);
        } catch {
          // Ignore if we can't clear
        }
        throw new Error('保存されたデータが破損しています。データをクリアしました。');
      }
      
      return [];
    }
  }

  getItinerary(id: string): Itinerary | null {
    const itineraries = this.getAllItineraries();
    return itineraries.find(item => item.id === id) || null;
  }

  saveItinerary(itinerary: Itinerary): void {
    try {
      const itineraries = this.getAllItineraries();
      const index = itineraries.findIndex(item => item.id === itinerary.id);
      
      if (index >= 0) {
        itineraries[index] = itinerary;
      } else {
        itineraries.push(itinerary);
      }
      
      const dataString = JSON.stringify(itineraries);
      
      // Check approximate size before saving
      const sizeInBytes = new Blob([dataString]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 4) {
        throw new Error('データサイズが大きすぎます（最大4MB）。古いデータを削除してください。');
      }
      
      localStorage.setItem(this.STORAGE_KEY, dataString);
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'QuotaExceededError') {
          throw new Error('ストレージの容量が不足しています。古いデータを削除してください。');
        }
        if (error.name === 'SecurityError') {
          throw new Error('ストレージへのアクセスが拒否されました。プライベートモードを無効にしてください。');
        }
      }
      
      // Re-throw if it's already our custom error
      if (error instanceof Error && error.message.includes('データサイズが大きすぎます')) {
        throw error;
      }
      
      throw new Error('データの保存に失敗しました。ブラウザの設定を確認してください。');
    }
  }

  deleteItinerary(id: string): void {
    try {
      const itineraries = this.getAllItineraries();
      const filtered = itineraries.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'SecurityError') {
          throw new Error('ストレージへのアクセスが拒否されました。プライベートモードを無効にしてください。');
        }
      }
      throw new Error('データの削除に失敗しました。ブラウザの設定を確認してください。');
    }
  }

  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default new StorageService();
