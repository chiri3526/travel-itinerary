import type { Itinerary, ItineraryItem } from '../types';

class ItineraryService {
  createItinerary(data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>): Itinerary {
    const now = new Date().toISOString();
    return {
      ...data,
      id: this.generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
  }

  validateDates(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  calculateTotalAmount(items: ItineraryItem[]): number {
    return items.reduce((total, item) => total + (item.amount || 0), 0);
  }

  groupItemsByDate(items: ItineraryItem[]): Map<string, ItineraryItem[]> {
    const grouped = new Map<string, ItineraryItem[]>();
    
    items.forEach(item => {
      const date = item.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(item);
    });
    
    return grouped;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export default new ItineraryService();
