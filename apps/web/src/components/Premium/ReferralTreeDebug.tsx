import { useReferralTree } from "../../hooks/useReferralTree";

export default function ReferralTreeDebug() {
  const { data, isLoading, error } = useReferralTree(
    "0x960fceed1a0ac2cc22e6e7bd6876ca527d31d268",
    3
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Referral Tree Debug</h2>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Meta Data:</h3>
        <pre className="text-sm">{JSON.stringify(data?.meta, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Raw Nodes ({data?.data.length} nodes):</h3>
        <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(data?.data, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Tree Structure Analysis:</h3>
        <div className="text-sm space-y-1">
          {data?.data.map((node, index) => (
            <div key={index} className="border-b pb-1">
              <div>Node {index + 1}: {node.address}</div>
              <div>Depth: {node.depth}</div>
              <div>Parent: {node.parent || "None"}</div>
              <div>Left Child: {node.leftChild || "None"}</div>
              <div>Right Child: {node.rightChild || "None"}</div>
              <div>Balance: {node.balance}</div>
              <div>Points: {node.point}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 