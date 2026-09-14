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

export interface CustomLogosMap {
  [key: string]: string;
}

export interface EpgProgram {
  title: string;
  desc?: string;
  category?: string;
  start: string;
  stop: string;
  startTime: number;
  stopTime: number;
  progressPercent?: number;
}

export interface ChannelEpg {
  channelName: string;
  epgChannelId: string;
  currentProgram: EpgProgram | null;
  nextProgram: EpgProgram | null;
  upcoming: EpgProgram[];
}

export type ViewMode = 'grid' | 'epg';
