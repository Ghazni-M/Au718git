
export interface Product {
  id: string;
  name: string;
  category: string;
  karat: string;
  weight?: string;
  price?: string;
  image?: string;
  images?: string[];
  description: string;
  status?: 'published' | 'draft';
  stock?: number;
}

export interface Review {
  id: string;
  user: string;
  comment: string;
  rating: number;
}

export const REVIEWS: Review[] = [
  { id: '1', user: 'Ada O.', comment: 'Exquisite quality and the delivery to Lagos was incredibly fast. Highly recommended!', rating: 5 },
  { id: '2', user: 'David K.', comment: 'The 24K bars are a great investment. Authenticity was verified and the service is top-notch.', rating: 5 },
  { id: '3', user: 'Mercy E.', comment: 'Got a custom piece designed and it turned out exactly as I imagined. Thank you AU718!', rating: 5 },
];
