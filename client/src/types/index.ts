export interface User {
  id?: number;
  username: string;
  room: string;
  toxicityScore: number;
}

export interface Message {
  id?: number;
  text: string;
  username: string;
  room: string;
  isModified: boolean;
  timestamp: string;
}
