function download(blob, filename) {
  let url = ''
  if (typeof blob === 'string') {
    url = blob
  } else {
    url = URL.createObjectURL(blob)
  }
  let a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export {
  download
}
