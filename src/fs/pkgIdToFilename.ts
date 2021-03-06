import path = require('path')
import normalize = require('normalize-path')

export default function pkgIdToFilename (pkgId: string) {
  if (pkgId.indexOf('file:') !== 0) return pkgId

  return `local/${encodeURIComponent(normalize(path.resolve(pkgId.slice(5))))}`
}
