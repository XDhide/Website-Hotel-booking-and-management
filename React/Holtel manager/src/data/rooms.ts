

export interface Room {
  id:             number;
  name:           string;
  type:           string;
  price:          number;
  originalPrice?: number;
  rating:         number;
  reviews:        number;
  image:          string | null;
  tags:           string[];
  available:      boolean;
  popular?:       boolean;
}

export interface Comment {
  id:     number;
  author: string;
  avatar: string;
  rating: number;
  date:   string;
  text:   string;
}

