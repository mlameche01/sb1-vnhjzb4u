import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';

const FRN_CONTRACT = '0xbff1721bc1009E842eD701cD7AA72ecfbCBB29DA';
const POLYGON_RPC = 'https://polygon-rpc.com';

export default function WalletBar() {
  const [address, setAddress] = useState('');
  const [pol, setPol] = useState('0');
  const [frn, setFrn] = useState('0');

  const loadBalances = async (wallet: string) => {
    const nativeRes = await fetch(POLYGON_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [wallet, 'latest'], id: 1 })
    });
    const nativeData = await nativeRes.json();
    const native = parseInt(nativeData.result, 16) / 1e18;
    setPol(native.toFixed(3));

    const data = '0x70a08231000000000000000000000000' + wallet.replace('0x', '');
    const tokenRes = await fetch(POLYGON_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to: FRN_CONTRACT, data }, 'latest'], id: 2 })
    });
    const tokenData = await tokenRes.json();
    const token = parseInt(tokenData.result, 16) / 1e18;
    setFrn(token.toFixed(2));
  };

  const connect = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return alert('Installe MetaMask');
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setAddress(accounts[0]);
    loadBalances(accounts[0]);
  };

  useEffect(() => {
    if (address) loadBalances(address);
  }, [address]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 mb-6">
      <div>
        <p className="text-white font-semibold">Wallet Polygon</p>
        <p className="text-xs text-gray-400">FRN Token activé</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-white">{pol} POL</p>
          <p className="text-sm text-green-400">{frn} FRN</p>
        </div>
        <button onClick={connect} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-white text-sm">
          <Wallet className="w-4 h-4" />
          {address ? address.slice(0, 6) + '...' : 'Connect'}
        </button>
      </div>
    </div>
  )
}
