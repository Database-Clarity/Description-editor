import { images } from '../extensions/images'

function newLines(text: string) {
  // each line should be surrounded in <div> tag
  return text
    .split('\n')
    .map((line) => {
      if (line.startsWith('•')) {
        return `<li>${line.replace('•', '').trim()}</li>`
      } else {
        return `<div>${line}</div>`
      }
    })
    .join('\n')
}

function convertImgTags(text: string) {
  // arch for example should be <span class="arch">󒰀</span>
  // use images object to convert it

  return text
    .replace(/<arc\/>/g, `<span class="${images.arc.class}">${images.arc.img}</span>`)
    .replace(/<void\/>/g, `<span class="${images.void.class}">${images.void.img}</span>`)
    .replace(/<solar\/>/g, `<span class="${images.solar.class}">${images.solar.img}</span>`)
    .replace(/<stasis\/>/g, `<span class="${images.stasis.class}">${images.stasis.img}</span>`)
    .replace(/<strand\/>/g, `<span class="${images.strand.class}">${images.strand.img}</span>`)
    .replace(/<primary\/>/g, `<span class="${images.primary.class}">${images.primary.img}</span>`)
    .replace(/<special\/>/g, `<span class="${images.special.class}">${images.special.img}</span>`)
    .replace(/<heavy\/>/g, `<span class="${images.heavy.class}">${images.heavy.img}</span>`)
    .replace(/<warlock\/>/g, `<span class="${images.warlock.class}">${images.warlock.img}</span>`)
    .replace(/<hunter\/>/g, `<span class="${images.hunter.class}">${images.hunter.img}</span>`)
    .replace(/<titan\/>/g, `<span class="${images.titan.class}">${images.titan.img}</span>`)
}

function convertComments(text: string) {
  // comments are lines that start with // or are surrounded by /* and */

  return text
    .replace(/\/\*(.*)\*\//g, (_, match) => `<span class="comment">${match.trim()}</span>`)
    .replace(/\/\/(.*)/g, '<span class="comment">$1</span>')
}

function convertColorTags(text: string) {
  // color tags are <blue something /> <green other  /> <purple more  /> <yellow just  />
  // text is actual text that will be displayed
  // <blue any /> will be converted to <span class="blue">any text</span>

  return text
    .replace(/<blue (.+?)\/>/g, `<span class="blue">$1</span>`)
    .replace(/<green (.+?)\/>/g, `<span class="green">$1</span>`)
    .replace(/<purple (.+?)\/>/g, `<span class="purple">$1</span>`)
    .replace(/<yellow (.+?)\/>/g, `<span class="yellow">$1</span>`)
    .replace(/<pvp (.+?)\/>/g, `<span class="pvp">$1</span>`)
    .replace(/<pve (.+?)\/>/g, `<span class="pve">$1</span>`)
}

function convertLinks(text: string) {
  // convert links to <a> tags
  // <link Empowering Buff [#DamageBuffs] />
  // will be converted to <a href="https://url.d2clarity.com/DamageBuffs">Empowering Buff</a>

  const links = [
    { name: 'DamageBuffs', url: 'https://url.d2clarity.com/DamageBuffs' },
    { name: 'CombatantScaling', url: 'https://url.d2clarity.com/combatant-scaling' },
    { name: 'CombatantClassifications', url: 'https://url.d2clarity.com/combatants' },
  ]

  return text.replace(/<link (.+?)\/>/g, (_, link: string) => {
    const linkMarker = link.match(/\[#(.+)\]/)?.[1]
    const linkUrl = links.find((link) => link.name === linkMarker)?.url
    const linkText = link.replace(`[#${linkMarker}]`, '').trim()

    console.log(linkMarker, linkUrl, linkText)

    if (linkUrl) {
      return `<a href="${linkUrl}">${linkText}</a>`
    } else {
      return link
    }
  })
}

function convertTitles(text: string) {
  return text.replace(/<title (.+?)\/>/g, (_, link) => {
    const linkMarker = link.match(/\[(.+)\]/)[1]
    const linkText = link.replace(`[${linkMarker}]`, '').trim()

    return `<span name="${linkMarker}" class="tooltip">${linkText}</span>`
  })
}

function convertEnhanced(text: string) {
  text.match(/(#e\${.+?})/g)?.forEach((match) => {
    const { operator, number, variable } =
      match.match(/#e\${(?<number>-?\d+\.?\d*?) ?(?<operator>[/*\-+]) ?#(?<variable>.+?)}/)?.groups || {}

    const variableValue = text.match(new RegExp(`var ${variable} = (.*)*?<`))?.[1]

    if (!number || !variable || !operator || !variableValue) {
      return
    }

    let value

    if (operator === '+') {
      value = Number(number) + Number(variableValue)
    } else if (operator === '-') {
      value = Number(number) - Number(variableValue)
    } else if (operator === '*') {
      value = Number(number) * Number(variableValue)
    } else if (operator === '/') {
      value = Number(number) / Number(variableValue)
    }

    if (!value) {
      value = 'invalid math expression'
    } else {
      value = value = Math.round((value + Number.EPSILON) * 100) / 100
    }

    text = text.replace(
      `#e\${${number} ${operator} #${variable}}`,
      `<span class="enhanced">${number}<span class="arrow">󒱀</span>${value}</span>`
    )
    text = text.replace(
      `#e\${${number}${operator}#${variable}}`,
      `<span class="enhanced">${number}<span class="arrow">󒱀</span>${value}</span>`
    )
  })

  text.match(/<div>#e(.+?)<\/div>/g)?.forEach((match) => {
    text = text.replace(match, `<span class="enhanced">${match.replace('#e', '').trim()}</span>`)
  })

  text = text.replace('<div>enhanced (</div>', '')
  text = text.replace('<div>)</div>', '')
  text = text.replace(/<div>var .+<\/div>/g, '')

  return text
}

export function converter(string: string) {
  console.log(string)

  const convertedNewLineToDiv = newLines(string)
  const convertedImgTags = convertImgTags(convertedNewLineToDiv)
  const convertedComments = convertComments(convertedImgTags)
  const convertedColorTags = convertColorTags(convertedComments)
  const convertedLinks = convertLinks(convertedColorTags)
  const convertedVariables = convertEnhanced(convertedLinks)
  const convertedTitles = convertTitles(convertedVariables)

  console.log(convertedTitles)

  return convertedTitles.trim()
}
