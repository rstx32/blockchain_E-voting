import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config({ path: './config/.env' })
const apiUrl = process.env.API_URL

const getCandidates = async (req, res) => {
  const candidates = await fetch(`http://${apiUrl}/getcandidates`)
  return await candidates.json()
}

const getVoterPasswd = async (id) => {
  const voter = await fetch(`http://${apiUrl}/voter/passwd/${id}`)
  return await voter.json()
}

const getVoterPubKey = async (id) => {
  const voter = await fetch(`http://${apiUrl}/voter/pubkey/${id}`)
  return await voter.json()
}

const getVoter = async (id) => {
  const voter = await fetch(`http://${apiUrl}/voter/${id}`)
  return await voter.json()
}

export { getCandidates, getVoterPasswd, getVoterPubKey, getVoter }
