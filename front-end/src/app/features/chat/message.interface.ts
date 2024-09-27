export interface Message {
  data: Record<string, string>;
  type: 'sent' | 'received';
}
