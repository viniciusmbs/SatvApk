import { Channel, ChannelEpg, EpgProgram } from '../types';

// Normalizador de nomes para correspondência tolerante entre canais do IPTV e o XML do Claro TV EPG
export function cleanChannelName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/\b(hd|fhd|sd|4k|br|brasil|online|live|tv)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Mapa de equivalências diretas comuns entre nomes na lista e IDs no Claro EPG
const DIRECT_EPG_MAP: Record<string, string> = {
  band: 'band.br',
  bandsp: 'band.br',
  globo: 'globo.br',
  globomg: 'globo.br',
  globorj: 'globo.br',
  globosp: 'globo.br',
  globoes: 'globo.br',
  record: 'record.br',
  recordmg: 'record.br',
  recordtv: 'record.br',
  sbt: 'sbt.br',
  sbtmg: 'sbt.br',
  redetv: 'redetv.br',
  tvcultura: 'cultura.br',
  cultura: 'cultura.br',
  tvbrasil: 'tvbrasil.br',
  futura: 'futura.br',
  arte1: 'arte1.br',
  discoverychannel: 'discovery.br',
  discovery: 'discovery.br',
  discoverykids: 'discoverykids.br',
  discoveryhh: 'discoveryhh.br',
  discoveryscience: 'discoveryscience.br',
  discoverytheater: 'discoverytheater.br',
  discoveryturbo: 'discoveryturbo.br',
  turbo: 'discoveryturbo.br',
  discoveryworld: 'discoveryworld.br',
  animalplanet: 'animalplanet.br',
  history: 'history.br',
  historychannel: 'history.br',
  history2: 'history2.br',
  natgeo: 'natgeo.br',
  nationalgeographic: 'natgeo.br',
  natgeowild: 'natgeowild.br',
  investigacaodiscovery: 'id.br',
  tlc: 'tlc.br',
  foodnetwork: 'foodnetwork.br',
  hgtv: 'hgtv.br',
  espn: 'espn.br',
  espn2: 'espn2.br',
  espn3: 'espn3.br',
  espn4: 'espn4.br',
  espn5: 'espn5.br',
  espn6: 'espn6.br',
  sportv: 'sportv.br',
  sporttv: 'sportv.br',
  sportv2: 'sportv2.br',
  sporttv2: 'sportv2.br',
  sportv3: 'sportv3.br',
  sporttv3: 'sportv3.br',
  bandsports: 'bandsports.br',
  combate: 'combate.br',
  premiere: 'premiere.br',
  canaloff: 'off.br',
  off: 'off.br',
  megapix: 'megapix.br',
  space: 'space.br',
  tnt: 'tnt.br',
  tntseries: 'tntseries.br',
  tntnovelas: 'tntnovelas.br',
  warner: 'warner.br',
  warnerchannel: 'warner.br',
  universal: 'universal.br',
  universaltv: 'universal.br',
  sony: 'sony.br',
  sonychannel: 'sony.br',
  axn: 'axn.br',
  paramount: 'paramount.br',
  telecinepremium: 'telecinepremium.br',
  telecineaction: 'telecineaction.br',
  telecinetouch: 'telecinetouch.br',
  telecinefun: 'telecinefun.br',
  telecinepipoca: 'telecinepipoca.br',
  telecinecult: 'telecinecult.br',
  hbo: 'hbo.br',
  hbo2: 'hbo2.br',
  hbofamily: 'hbofamily.br',
  hbopop: 'hbopop.br',
  hboplus: 'hboplus.br',
  hbosignature: 'hbosignature.br',
  hboxtreme: 'hboxtreme.br',
  hbomundi: 'hbomundi.br',
  canalbrasil: 'canalbrasil.br',
  cinemax: 'cinemax.br',
  cartoonnetwork: 'cartoonnetwork.br',
  cartoonito: 'cartoonito.br',
  gloob: 'gloob.br',
  nickelodeon: 'nickelodeon.br',
  disney: 'disney.br',
  disneychannel: 'disney.br',
  disneyjunior: 'disneyjunior.br',
  tooncast: 'tooncast.br',
  gnt: 'gnt.br',
  multishow: 'multishow.br',
  viva: 'viva.br',
  comedycentral: 'comedycentral.br',
  globonews: 'globonews.br',
  cnnbrasil: 'cnnbrasil.br',
  bandnews: 'bandnews.br',
  jovempan: 'jovempan.br',
  jovempannews: 'jovempan.br',
  bis: 'bis.br',
  mtv: 'mtv.br',
};

export function formatTimeBrasilia(timestampMs: number): string {
  if (!timestampMs) return '--:--';
  const date = new Date(timestampMs);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export interface RawEpgProgram {
  start: number;
  stop: number;
  title: string;
  desc?: string;
  category?: string;
}

export interface RawEpgResponse {
  updatedAt: number;
  channelCount: number;
  programmes: Record<string, RawEpgProgram[]>;
}

// Busca os dados do EPG da API local com fallback para o raw GitHub
export async function fetchEpgData(): Promise<Record<string, RawEpgProgram[]>> {
  try {
    const res = await fetch('/api/epg');
    if (res.ok) {
      const data: RawEpgResponse = await res.json();
      if (data && data.programmes) {
        return data.programmes;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar /api/epg, tentando fallback direto...', e);
  }

  return {};
}

// Encontra a melhor chave de canal do EPG correspondente ao nome do canal
export function findBestEpgChannelKey(
  channelName: string,
  availableKeys: string[]
): string | null {
  const cleanName = cleanChannelName(channelName);
  if (!cleanName) return null;

  // 1. Tenta mapa direto
  if (DIRECT_EPG_MAP[cleanName]) {
    const directTarget = DIRECT_EPG_MAP[cleanName];
    const match = availableKeys.find(
      (k) => cleanChannelName(k) === cleanChannelName(directTarget) || k.toLowerCase().includes(directTarget.toLowerCase())
    );
    if (match) return match;
  }

  // 2. Tenta igualdade exata limpa
  for (const key of availableKeys) {
    const cleanKey = cleanChannelName(key);
    if (cleanKey === cleanName) return key;
  }

  // 3. Tenta inclusão mútua
  for (const key of availableKeys) {
    const cleanKey = cleanChannelName(key);
    if (cleanKey.length >= 3 && cleanName.length >= 3) {
      if (cleanKey.includes(cleanName) || cleanName.includes(cleanKey)) {
        return key;
      }
    }
  }

  return null;
}

// Constrói o ChannelEpg para um canal com os programas atuais e futuros
export function buildChannelEpg(
  channel: Channel,
  allProgrammes: Record<string, RawEpgProgram[]>,
  now = Date.now()
): ChannelEpg {
  const keys = Object.keys(allProgrammes);
  const matchedKey = findBestEpgChannelKey(channel.name, keys);

  if (!matchedKey || !allProgrammes[matchedKey] || allProgrammes[matchedKey].length === 0) {
    return {
      channelName: channel.name,
      epgChannelId: '',
      currentProgram: null,
      nextProgram: null,
      upcoming: [],
    };
  }

  const rawList = allProgrammes[matchedKey];
  // Ordena por horário de início
  const sorted = [...rawList].sort((a, b) => a.start - b.stop);

  let currentRaw: RawEpgProgram | null = null;
  let nextRaw: RawEpgProgram | null = null;
  const upcomingRaw: RawEpgProgram[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (now >= p.start && now < p.stop) {
      currentRaw = p;
      if (sorted[i + 1]) {
        nextRaw = sorted[i + 1];
      }
      for (let j = i + 1; j < Math.min(sorted.length, i + 6); j++) {
        upcomingRaw.push(sorted[j]);
      }
      break;
    } else if (p.start > now) {
      // Nenhum programa marcado exatamente agora, pega o próximo
      if (!currentRaw) {
        currentRaw = p;
        if (sorted[i + 1]) nextRaw = sorted[i + 1];
        break;
      }
    }
  }

  const mapProgram = (raw: RawEpgProgram): EpgProgram => {
    const totalDuration = raw.stop - raw.start;
    const elapsed = Math.max(0, now - raw.start);
    const progressPercent =
      totalDuration > 0
        ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)))
        : 0;

    return {
      title: raw.title,
      desc: raw.desc,
      category: raw.category,
      start: formatTimeBrasilia(raw.start),
      stop: formatTimeBrasilia(raw.stop),
      startTime: raw.start,
      stopTime: raw.stop,
      progressPercent,
    };
  };

  return {
    channelName: channel.name,
    epgChannelId: matchedKey,
    currentProgram: currentRaw ? mapProgram(currentRaw) : null,
    nextProgram: nextRaw ? mapProgram(nextRaw) : null,
    upcoming: upcomingRaw.map(mapProgram),
  };
}
