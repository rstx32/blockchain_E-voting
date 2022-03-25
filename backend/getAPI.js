import fetch from 'node-fetch'

const getCandidates = async (req, res) => {
  const candidates = await fetch('http://localhost/getcandidates')
  return await candidates.json()
}

const getVoterPasswd = async (id) => {
  const voter = await fetch(`http://localhost/voter/passwd/${id}`)
  return await voter.json()
}

const getVoterPubKey = async (id) => {
  const voter = await fetch(`http://localhost/voter/pubkey/${id}`)
  return await voter.json()
}

const getVoter = async (id) => {
  const voter = await fetch(`http://localhost/voter/${id}`)
  return await voter.json()
}

export { getCandidates, getVoterPasswd, getVoterPubKey, getVoter }
