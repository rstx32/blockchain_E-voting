import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config({ path: './config/.env' })

const getCandidates = async (req, res) => {
  const candidates = await fetch(`http://${process.env.API_URL}/getcandidates`)
  return await candidates.json()
}

const getVoterPasswd = async (id) => {
  const voter = await fetch(`http://${process.env.API_URL}/voter/passwd/${id}`)
  return await voter.json()
}

const getVoterPubKey = async (id) => {
  const voter = await fetch(`http://${process.env.API_URL}/voter/pubkey/${id}`)
  return await voter.json()
}

const getVoter = async (id) => {
  const voter = await fetch(`http://${process.env.API_URL}/voter/${id}`)
  return await voter.json()
}

export { getCandidates, getVoterPasswd, getVoterPubKey, getVoter }
