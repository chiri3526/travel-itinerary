export interface ItineraryItem {
  id: string;
  date: string;
  time: string;
  content: string;
  amount: number;
  note: string;
}

export interface Itinerary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}
