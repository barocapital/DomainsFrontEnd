import {
    useAccount,
    useConnect,
    useDisconnect,
    usePrepareContractWrite
  } from 'wagmi'

export function Profile() {
    const { config } = usePrepareContractWrite({
        address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ internalType: 'uint32', name: 'tokenId', type: 'uint32' }],
            outputs: [],
          },
        ],
        functionName: 'mint',
        args: [parseInt(0)],
        enabled: Boolean(0),
      })
  const { address, connector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =useConnect()
  const { disconnect } = useDisconnect()
  if (isConnected) {
    return (
      <div>
        <div>{ address}</div>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )
  }
  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}
 
      {error && <div>{error.message}</div>}
    </div>
  )
}