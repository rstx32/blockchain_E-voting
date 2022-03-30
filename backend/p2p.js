import { Network, AnonymousAuth } from 'ataraxia'
import { TCPTransport, TCPPeerMDNSDiscovery } from 'ataraxia-tcp'
import { getBlocks, replaceChain, isBlockchainValid } from './blockchain.js'

const net = new Network({
  name: 'ataraxia-test',
  transports: [
    new TCPTransport({
      discovery: new TCPPeerMDNSDiscovery(),
      authentication: [new AnonymousAuth()],
    }),
  ],
})

console.log(`running node ${net.networkId}`)

net.onNodeAvailable((node) => {
  console.log(`connected to node ${node.id}`)
  console.log(`total nodes connected: `, net.nodes.length, `\n`)
  node.send('blockchain', getBlocks())
})

net.onNodeUnavailable((node) => {
  console.log(`node ${node.id} disconnected `)
  console.log(`total nodes connected: `, net.nodes.length, `\n`)
})

net.onMessage((msg) => {
  const temp = [msg]
  if (isBlockchainValid(temp)) {
    console.log(`received valid ${msg.type} from ${msg.source.id}`)
    replaceChain(msg.data)
  } else {
    console.log(`received invalid ${msg.type} from ${msg.source.id}`)
  }
})

const broadcastChain = (blockchain) => {
  net.broadcast('blockchain', blockchain)
}

export { net, broadcastChain }
