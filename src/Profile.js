import {
    useAccount,
    useConnect,
    useDisconnect,
    usePrepareContractWrite
  } from 'wagmi'

export function Profile() {
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