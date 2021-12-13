const CryptoJS = require('crypto-js')

class Block {
  // block mempunyai atribut index, previousHash, timestamp, data, dan hash
  constructor(index, previousHash, timestamp, data, hash) {
    this.index = index
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.data = data
    this.hash = hash
  }
}

// fungsi untuk menghitung hash
const calculateHash = (index, prevHash, timestamp, data) => {
  return CryptoJS.SHA256(index + prevHash + timestamp + data).toString()
}

// fungsi untuk mendapatkan block terakhir
const latestBlock = () => {
  return blockchain[blockchain.length - 1]
}

// fungsi untuk mendapatkan timestamp
const timestamp = () => {
  return new Date().getTime()
}

// genesis untuk block pertama pada blockchain
const genesis = new Block(
  0,
  '',
  1638105751888,
  {
    voter: 'genesis block',
    vote: 'genesis block',
    origin: 'genesis block',
  },
  calculateHash(0, '', 1638105751888, { votersID: '', vote: '', origin: '' })
)

// inisiasi array of blockchain, dengan block pertama genesis
const blockchain = [genesis]

// fungsi untuk menampilkan blockchain
const getBlocks = () => {
  return blockchain
}

// membuat block baru
const newBlock = (data) => {
  const newIndex = latestBlock().index + 1
  const prevHash = latestBlock().hash
  const newTimestamp = timestamp()
  const block = new Block(
    newIndex,
    prevHash,
    newTimestamp,
    data,
    calculateHash(newIndex, prevHash, newTimestamp, data)
  )
  // masukan block baru ke dalam blockchain
  blockchain.push(block)
  console.log(data.voter)
}

// coba input block
newBlock({
  voter: "contoh@gmail.com",
  vote: "02",
  origin: "192.168.1.187",
})

// export module
module.exports = { getBlocks, newBlock }
