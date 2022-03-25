import dotenv from 'dotenv'
import sha265 from 'crypto-js/sha256.js'
dotenv.config({ path: './backend/config/.env' })
const diff = parseInt(process.env.DIFFICULTY)

class Block {
  // block mempunyai atribut index, previousHash, timestamp, data, hash, difficulty, dan nonce
  constructor(index, previousHash, timestamp, data, hash, difficulty, nonce) {
    this.index = index
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.data = data
    this.hash = hash
    this.difficulty = difficulty
    this.nonce = nonce
  }
}

// fungsi untuk menghitung hash
const calculateHash = (index, prevHash, timestamp, data, difficulty, nonce) => {
  return sha265(
    index + prevHash + timestamp + data + difficulty + nonce
  ).toString()
}

// fungsi untuk menghitung hash (parameter : block)
const blockCalculateHash = (block) => {
  return sha265(
    block.index +
      block.previousHash +
      block.timestamp +
      block.data +
      block.difficulty +
      block.nonce
  ).toString()
}

// fungsi untuk mendapatkan block terakhir
const latestBlock = () => {
  return blockchain[blockchain.length - 1]
}

// fungsi untuk mendapatkan timestamp
const getTimestamp = () => {
  return new Date()
}

// genesis untuk block pertama pada blockchain
const genesis = new Block(
  0,
  '',
  new Date(1638105751888),
  'genesis block',
  calculateHash(0, '', 1638105751888, 'genesis block'),
  0,
  0
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
  const newTimestamp = getTimestamp()
  addBlock(findBlock(newIndex, prevHash, newTimestamp, data, diff))
}

// menambahkan block ke dalam blockchain
const addBlock = (block) => {
  if (
    // isStructureValid(block) &&
    isBlockValid(latestBlock(), block)
  ) {
    blockchain.push(block)
    console.log(`a new block added! ${block.hash}`)
    return true
  }
  return false
}

// memvalidasi isi tipe data block
const isStructureValid = (block) => {
  return (
    typeof block.index === 'number' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'string' &&
    typeof block.data === 'object' &&
    typeof block.data.voter === 'string' &&
    typeof block.data.vote === 'string' &&
    typeof block.data.signature === 'string' &&
    typeof block.hash === 'string' &&
    typeof block.difficulty === 'number' &&
    typeof block.nonce === 'number'
  )
}

// memvalidasi block baru
// 1. cek struktur block
// 2. cek apakah index block baru lebih besar dari block sebelumnya
// 3. cek apakah newBlock.prevHash sama dengan hash block sebelumnya
// 4. cek ulang hash block
const isBlockValid = (prevBlock, newBlock) => {
  // if (
  //   !isStructureValid(newBlock)) {
  //   console.log(`invalid block structure!`)
  //   return false
  // } else
  if (prevBlock.index + 1 !== newBlock.index) {
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
    return sha265(blockchain[0]).toString() === sha265(genesis).toString()
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

// validasi apakah enkripsi sudah sesuai dengan ketentuan
const isHashMatchDifficulty = (blockHash, difficulty) => {
  const binaryHash = hexToBinary(blockHash)
  const reqDiff = '0'.repeat(difficulty)
  return binaryHash.startsWith(reqDiff)
}

// hexadecimal to binary
const hexToBinary = (s) => {
  let ret = ''
  const lookupTable = {
    0: '0000',
    1: '0001',
    2: '0010',
    3: '0011',
    4: '0100',
    5: '0101',
    6: '0110',
    7: '0111',
    8: '1000',
    9: '1001',
    a: '1010',
    b: '1011',
    c: '1100',
    d: '1101',
    e: '1110',
    f: '1111',
  }
  for (let i = 0; i < s.length; i = i + 1) {
    if (lookupTable[s[i]]) {
      ret += lookupTable[s[i]]
    } else {
      return null
    }
  }
  return ret
}

// menemukan block dengan hash sesuai dengan ketentuan
const findBlock = (index, prevHash, timestamp, data, diff) => {
  let nonce = 0
  while (true) {
    const hash = calculateHash(index, prevHash, timestamp, data, diff, nonce)
    if (isHashMatchDifficulty(hash, diff)) {
      return new Block(index, prevHash, timestamp, data, hash, diff, nonce)
    }
    nonce++
  }
}

// test zone
const index = latestBlock().index + 1
const prevHash = latestBlock().hash
const timestamp = getTimestamp()
const data = {
  voter: `-----BEGIN RSA PUBLIC KEY-----
  MIIBCgKCAQEA1f5L+DY/dC+WYCFL4hxh7mERC1Hf1DauCgQ3hBSBKFGiw4YZRcxj
  Zy7DTei4fdpITI9lm/ZR7+Ir58VdxnCj90n/VQpvLFc8GI9iE6u7iKYZzCE97ykh
  SB4U6UnWSWYn3ngOzMV60aZ0WR5B8gmr+rgDrnVcqFT3FCmnojZERTlUYiUMKwqt
  fPLG9ggZ+lxl9fbRTIoy1smJqsXCduD+s0VeeFiFNjXAN70bhZgo7HpnAKt0Kcpy
  kAlK7cOnfiJiggVF1rD+BjUlotkv9gWnecK/DvkVsiKFEmh11Ydp3rwubYjyhJX9
  4U1/IBtSt5qsjjVRyn75WHlly4Z3gAqZYQIDAQAB
  -----END RSA PUBLIC KEY-----`,
  vote: 'jokowi',
  signature:
    'UkyOXGS1dmBiIaEJjjwgGzhfBhyXaPm/BIrN9Piv16LnW3kjDvX56a0fREFvyJdcZROPpINVVHng9eV2Ei6kDAKh2JJJp4T7vLKiLRNyZWc3LX/t8CcUpSM9QZavHkShRW4IRg38lGGCkGYb9b4XMZtRi8MPEfUv5MjBoyBY4nSpJcnCisRUjlo8pYKSSiqxhjtb4Fp0yEfcl0KFlkDSiVDpO1MRfbh0g+8FdSO0yGGezAJ1fJO7DhrZaJkLu/QA/VSgPJkgXVYkf+EamnCIwP7GrDYIyJKNqwnbsYa4ZkuX4w/msrfyI+GZCA24hNydM6X3ABtxcwO8m9lxNdoTpA==',
}
addBlock(findBlock(index, prevHash, timestamp, data, diff))

const index2 = latestBlock().index + 1
const prevHash2 = latestBlock().hash
const timestamp2 = getTimestamp()
const data2 = {
  vote: 'prabowo',
  signature:
    'IkyOXGS1dmBiIaEJjjwgGzhfBhyXaPm/BIrN9Piv16LnW3kjDvX56a0fREFvyJdcZROPpINVVHng9eV2Ei6kDAKh2JJJp4T7vLKiLRNyZWc3LX/t8CcUpSM9QZavHkShRW4IRg38lGGCkGYb9b4XMZtRi8MPEfUv5MjBoyBY4nSpJcnCisRUjlo8pYKSSiqxhjtb4Fp0yEfcl0KFlkDSiVDpO1MRfbh0g+8FdSO0yGGezAJ1fJO7DhrZaJkLu/QA/VSgPJkgXVYkf+EamnCIwP7GrDYIyJKNqwnbsYa4ZkuX4w/msrfyI+GZCA24hNydM6X3ABtxcwO8m9lxNdoTpA==',
}
addBlock(findBlock(index2, prevHash2, timestamp2, data2, diff))

const data3 = {
  voter: `-----BEGIN RSA PUBLIC KEY-----
  MIIBCgKCAQEA1f5L+DY/dC+WYCFL4hxh7mERC1Hf1DauCgQ3hBSBKFGiw4YZRcxj
  Zy7DTei4fdpITI9lm/ZR7+Ir58VdxnCj90n/VQpvLFc8GI9iE6u7iKYZzCE97ykh
  SB4U6UnWSWYn3ngOzMV60aZ0WR5B8gmr+rgDrnVcqFT3FCmnojZERTlUYiUMKwqt
  fPLG9ggZ+lxl9fbRTIoy1smJqsXCduD+s0VeeFiFNjXAN70bhZgo7HpnAKt0Kcpy
  kAlK7cOnfiJiggVF1rD+BjUlotkv9gWnecK/DvkVsiKFEmh11Ydp3rwubYjyhJX9
  4U1/IBtSt5qsjjVRyn75WHlly4Z3gAqZYQIDAQAB
  -----END RSA PUBLIC KEY-----`,
  vote: 'jokowi',
  signature: `UkyOXGS1dmBiIaEJjjwgGzhfBhyXaPm/BIrN9Piv16LnW3kjDvX56a0fREFvyJdcZROPpINVVHng9eV2Ei6kDAKh2JJJp4T7vLKiLRNyZWc3LX/t8CcUpSM9QZavHkShRW4IRg38lGGCkGYb9b4XMZtRi8MPEfUv5MjBoyBY4nSpJcnCisRUjlo8pYKSSiqxhjtb4Fp0yEfcl0KFlkDSiVDpO1MRfbh0g+8FdSO0yGGezAJ1fJO7DhrZaJkLu/QA/VSgPJkgXVYkf+EamnCIwP7GrDYIyJKNqwnbsYa4ZkuX4w/msrfyI+GZCA24hNydM6X3ABtxcwO8m9lxNdoTpA==`,
}
newBlock(data3)

// end of test zone

// export module
export { getBlocks, newBlock }

// struktur voters
// data = {
//   voter (public key/id),
//   vote,
//   signature,
// }
