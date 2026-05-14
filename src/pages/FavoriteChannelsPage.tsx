import { Radio } from 'lucide-react';

export function getFavoriteChannels() {
  return JSON.parse(localStorage.getItem('lumentv_channels') || '[]');
}

export function toggleChannel(channel: any) {
  const channels = getFavoriteChannels();
  const exists = channels.some((c: any) => c.id === channel.id);
  const next = exists ? channels.filter((c: any) => c.id !== channel.id) : [channel, ...channels];
  localStorage.setItem('lumentv_channels', JSON.stringify(next));
  return !exists;
}

export default function FavoriteChannelsPage({ onNavigate }: any) {
  const channels = getFavoriteChannels();

  return <div className="px-6 py-8">
    <h1 className="text-2xl font-bold text-white mb-6">Chaînes favorites</h1>
    <div className="space-y-4">
      {channels.map((channel: any) => (
        <button key={channel.id} onClick={() => onNavigate(`/channel/${channel.id}`)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10">
          <div>
            <p className="text-white font-semibold">{channel.title}</p>
            <p className="text-gray-400 text-sm">Créateur sauvegardé</p>
          </div>
          <Radio className="text-red-400" />
        </button>
      ))}
    </div>
  </div>
}
