export interface Channel {
  id?: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  originalUrl?: string;
}

export interface GroupedChannels {
  [groupName: string]: Channel[];
}

export type ProxyMode = 'server' | 'direct';

export type PlayerMode = 'auto' | 'embed_proxy' | 'embed_direct' | 'hls_stream';

export type ClickAction = 'fullscreen' | 'popup' | 'new_tab';

export type CustomLogosMap = Record<string, string>;
