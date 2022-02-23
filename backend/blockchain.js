const SHA256 = require('crypto-js').SHA256

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
  return SHA256(index + prevHash + timestamp + data).toString()
}

// fungsi untuk menghitung hash (parameter : block)
const blockCalculateHash = (block) => {
  return SHA256(
    block.index + block.previousHash + block.timestamp + block.data
  ).toString()
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
  addBlock(block)
}

// menambahkan block ke dalam blockchain
const addBlock = (block) => {
  if (isStructureValid(block) && isBlockValid(latestBlock(), block)) {
    blockchain.push(block)
  }
}

// memvalidasi isi tipe data block
const isStructureValid = (block) => {
  return (
    typeof block.index === 'number' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'number' &&
    typeof block.data === 'object' &&
    typeof block.data.voter === 'string' &&
    typeof block.data.vote === 'string' &&
    typeof block.data.origin === 'string' &&
    typeof block.hash === 'string'
  )
}

// memvalidasi block baru
// 1. cek struktur block
// 2. cek apakah index block baru lebih besar dari block sebelumnya
// 3. cek apakah newBlock.prevHash sama dengan hash block sebelumnya
// 4. cek ulang hash block
const isBlockValid = (prevBlock, newBlock) => {
  if (!isStructureValid(newBlock)) {
    console.log(`invalid block structure!`)
    return false
  } else if (prevBlock.index + 1 !== newBlock.index) {
    console.log('invalid index block')
    return false
  } else if (newBlock.previousHash !== prevBlock.hash) {
    console.log('invalid previous hash')
    return false
  } else if (blockCalculateHash(newBlock) !== newBlock.hash) {
    console.log(`invalid block hash`)
    return false
  }
  return true
}

// validasi blockchain, parameter : blockchain[]
// cek genesis kemudian cek block satu per satu
const isBlockchainValid = (blockchain) => {
  const isGenesisValid = () => {
    return SHA256(blockchain[0]).toString() === SHA256(genesis).toString()
  }

  if (!isGenesisValid()) {
    console.log(`genesis invalid`)
    return false
  }

  for (let i = 1; i < blockchain.length; i++) {
    if (!isBlockValid(blockchain[i - 1], blockchain[i])) {
      return false
    }
  }

  return true
}

// coba input block
newBlock({
  voter: 'contoh@gmail.com',
  vote: '02',
  origin: '192.168.1.187',
})
const prev = latestBlock()

newBlock({
  voter: 'contoh2@gmail.com',
  vote: '01',
  origin: '192.168.1.182',
})
const next = latestBlock()

isBlockchainValid(blockchain)

// export module
module.exports = { getBlocks, newBlock }
