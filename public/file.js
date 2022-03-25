inputButton.addEventListener('change', function () {
  let voter = document.getElementById('voterID').value
  let filename = this.files[0].name
  let filenameShould = `${voter}-private_key.pem`

  if (filename !== filenameShould) {
    window.alert('nama file tidak sesuai dengan voter! => ' + filenameShould)
  } else {
    var fr = new FileReader()
    fr.onload = function () {
      const check = fr.result
      if (
        check.length !== 1678 &&
        !check.includes('-----BEGIN PRIVATE KEY-----') &&
        !check.includes('-----END PRIVATE KEY-----')
      ) {
        window.alert('isi private key tidak sah!')
      } else {
        privateKey = check
        console.log(privateKey)
      }
    }
    fr.readAsText(this.files[0])
  }
})
