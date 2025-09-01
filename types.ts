
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// Based on Botpress v1 Converse API response
export interface BotpressAction {
  type: string; // Typically 'text', but could be others
  text: string;
}

export interface BotpressConverseResponse {
  actions: BotpressAction[];
}
