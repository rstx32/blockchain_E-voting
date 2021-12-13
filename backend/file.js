const fs = require('fs')

// load kandidat
const muatKandidat = () => {
  const kandidat = fs.readFileSync('./backend/list/kandidat.json', 'utf-8')
  return JSON.parse(kandidat)
}

// load voters
const muatVoters = () => {
    const voters = fs.readFileSync('./backend/list/voters.json', 'utf-8')
    return JSON.parse(voters)
}

// autentikasi terhadap email voters
const auth = (email) => {
    const voters = muatVoters()
    return match = voters.find((m) => m.email === email)
}

// mengganti value voted -> true jika sudah melakukan voting
const voted = (email) => {
  const match = auth(email)
  match.voting = true

  const filtered = muatVoters().filter((voter) => voter.email !== email)
  filtered.push(match)

  fs.writeFileSync('./backend/list/voters.json', JSON.stringify(filtered))
}

// pengecekan apakah voters sudah melakukan voting
const isVoting = (email) => {
  const match = auth(email)
  return match.voting
}

module.exports = {muatKandidat, muatVoters, auth, voted, isVoting}