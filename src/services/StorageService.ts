import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Itinerary } from '../types';

class StorageService {
  private readonly COLLECTION_NAME = 'itineraries';

  async getAllItineraries(userId: string): Promise<Itinerary[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const itineraries: Itinerary[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        itineraries.push({
          id: doc.id,
          title: data.title,
          startDate: data.startDate,
          endDate: data.endDate,
          items: data.items || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      
      return itineraries;
    } catch (error) {
      console.error('Failed to load itineraries:', error);
      throw new Error('データの読み込みに失敗しました。');
    }
  }

  async getItinerary(id: string, userId: string): Promise<Itinerary | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      // Check if the itinerary belongs to the user
      if (data.userId !== userId) {
        throw new Error('アクセス権限がありません。');
      }
      
      return {
        id: docSnap.id,
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        items: data.items || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Failed to load itinerary:', error);
      throw new Error('データの読み込みに失敗しました。');
    }
  }

  async saveItinerary(itinerary: Itinerary, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, itinerary.id);
      await setDoc(docRef, {
        ...itinerary,
        userId,
      });
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      throw new Error('データの保存に失敗しました。');
    }
  }

  async deleteItinerary(id: string, userId: string): Promise<void> {
    try {
      // First verify ownership
      const itinerary = await this.getItinerary(id, userId);
      if (!itinerary) {
        throw new Error('データが見つかりません。');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      throw new Error('データの削除に失敗しました。');
    }
  }

  async clearAll(userId: string): Promise<void> {
    try {
      const itineraries = await this.getAllItineraries(userId);
      const deletePromises = itineraries.map((itinerary) =>
        deleteDoc(doc(db, this.COLLECTION_NAME, itinerary.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Failed to clear all itineraries:', error);
      throw new Error('データのクリアに失敗しました。');
    }
  }
}

export default new StorageService();
