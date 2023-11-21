import { readFileSync, writeFileSync } from 'fs'
import { sync } from 'glob'

function replaceDefaultInSvelteFiles(directory, fileName, newName) {
  const svelteFiles = sync(`${directory}/**/*.svelte`)

  svelteFiles.forEach((file) => {
    console.log(file)
    const data = readFileSync(file, 'utf8')

    const reg = new RegExp('import(?<name>.+)from.+?' + fileName + '.svelte')
    const name = data?.match(reg)?.groups?.name.trim()
    if (!name) return

    const updatedData = data
      .replace(`import ${name} from`, `import ${newName} from`)
      .replaceAll(`<${name}`, `<${newName}`)
      .replaceAll(`</${name}>`, `</${newName}>`)

    console.log(updatedData)

    writeFileSync(file, updatedData, 'utf8')
  })
}

replaceDefaultInSvelteFiles('src', 'fileName', 'newName')
