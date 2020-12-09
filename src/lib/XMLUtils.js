'use strict'

const xml2js = require('xml2js')

const padStr = '  '

function pad(num, str) {
  str = str || padStr

  let o = ''

  if (num > 0) {
    for (let i = 0; i < num; i++) {
      o = o + str
    }
  }

  return o
}

exports.pad = pad

const xmlSubstChars = { '<': '&lt;', '>': '&gt;', '&': '&amp;' }
const xmlSubstRegexp = /[<>&]/g
const replaceXMLChar = (chr) => xmlSubstChars[chr]

function escapeXMLString(str) {
  return str.replace(xmlSubstRegexp, replaceXMLChar)
}

function wrapWithElement(name, data, indentLevel) {
  indentLevel = indentLevel || Number(data) || 0

  if (Array.isArray(name)) {
    return name.map((item) => wrapWithElement(item[0], item[1], indentLevel + 1)).join('')
  }

  let o = ''

  if (typeof data !== 'undefined' && data !== null) {
    o = pad(indentLevel) + '<' + name + '>'

    if (Array.isArray(data)) {
      o += '\n' + wrapWithElement(data, indentLevel) + pad(indentLevel, '  ')
    } else {
      if (data instanceof Date) {
        let y = data.getFullYear()
        let m = data.getMonth() + 1
        let d = data.getDate()

        m = m < 10 ? '0' + m : m
        d = d < 10 ? '0' + d : d
        o += y + '-' + m + '-' + d
      } else {
        o += escapeXMLString(String(data))
      }
    }

    o += '</' + name + '>\n'
  }

  return o
}

exports.wrapWithElement = wrapWithElement

async function xml2obj(xml, objList) {
  const xmlObj = await xml2js.parseStringPromise(xml)
  const o = {}
  Object.keys(objList).forEach((keyPath) => {
    const path = keyPath.split('.')

    let found = true
    let p = xmlObj

    for (let i = 0; i < path.length; i++) {
      if (p.hasOwnProperty(path[i])) {
        console.log('>>', path[i])
        p = p[path[i]]
      } else {
        found = false
        break
      }
    }

    if (found) {
      o[objList[keyPath]] = p[0]
    }
  })
  return o
}

exports.xml2obj = xml2obj
