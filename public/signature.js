async function proses() {
  const form = document.getElementById('formVoting')
  const signature = document.getElementById('signature')
  const candidate = document.getElementById('candidateID')

  try {
    function str2ab(str) {
      const buf = new ArrayBuffer(str.length)
      const bufView = new Uint8Array(buf)
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i)
      }
      return buf
    }
  
    function ab2str(buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf))
    }
  
    function importPrivateKey(pem) {
      const pemHeader = '-----BEGIN PRIVATE KEY-----'
      const pemFooter = '-----END PRIVATE KEY-----'
      const pemContents = pem.substring(
        pemHeader.length,
        pem.length - pemFooter.length
      )
      const binaryDerString = window.atob(pemContents)
      const binaryDer = str2ab(binaryDerString)
  
      return window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        true,
        ['sign']
      )
    }
  
    function getMessageEncoding() {
      let message = candidate.value
      let enc = new TextEncoder()
      return enc.encode(message)
    }
  
    const privKey = await importPrivateKey(privateKey)
    let encoded = getMessageEncoding()
    let sig = await window.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privKey,
      encoded
    )
  
    const exportedAsString = ab2str(sig)
    const exportedAsBase64 = window.btoa(exportedAsString)
  
    signature.value = exportedAsBase64
    form.submit()
  } catch (error) {
    console.log(error)
  }
}
