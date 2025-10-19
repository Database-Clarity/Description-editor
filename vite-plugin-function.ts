import { parse, type AST } from 'svelte/compiler';

function convertToAbsolutePath(path: string, id: string) {
  if (path.startsWith('./')) {
    const beginning = id.substring(0, id.lastIndexOf('/'))
    const ending = path.substring(2)
    return `${beginning}/${ending}`
  }

  if (path.startsWith('../')) {
    const parentDirectoryCount = path.match(/\.\.\//g)!.length

    let beginning = id
    for (let i = 0; i < parentDirectoryCount; i++) {
      beginning = beginning.substring(0, beginning.lastIndexOf('/'))
    }

    const ending = path.substring(parentDirectoryCount * 3)
    return `${beginning}/${ending}`
  }

  if (path.startsWith('$lib/')) {
    const beginning = id.substring(0, id.indexOf('/src/lib/'))
    const ending = path.substring(5)
    return `${beginning}/src/lib/${ending}`
  }

  // TODO: handle custom aliases

  return null
}

export function getImports(instance: AST.Root['instance'] | null, id: string) {
  const body = instance?.content.body
  if (!body) return null

  const imports: Map<string, {
    importedFrom: string,
    importedAs: string,
  }> = new Map()

  for (let i = 0; i < body.length; i++) {
    // skip non-import statements
    const importStatement = body[i]
    if (importStatement.type !== 'ImportDeclaration') continue
    
    // @ts-ignore // importKind is missing in the type definition
    if (importStatement.importKind !== 'value') continue

    // check if the import is a default import // TODO: allow other types of imports
    if (importStatement.specifiers.length !== 1 || importStatement.specifiers[0].type !== 'ImportDefaultSpecifier') continue

    const importedFrom = convertToAbsolutePath(importStatement.source.value as string, id)
    if (!importedFrom) continue

    imports.set(importStatement.specifiers[0].local.name, {
      importedFrom,
      importedAs: importStatement.specifiers[0].local.name
    })
  }

  return imports.size !== 0 ? imports : null
}

export const getStyles = (cssAst: AST.Root['css'] | undefined) => {
  if (!cssAst) return null

  const styleInfo: Map<string, {
    componentName: string
    className: string,
    style: string,
    start: number,
    end: number,
  }> = new Map()

  for (let i = 0; i < cssAst.children.length; i++) {
    const children = cssAst.children[i];

    // check if it is :component
    if (children.type !== 'Rule') continue
    const pseudoClassSelector = children.prelude.children[0].children[0].selectors[0]
    if (pseudoClassSelector.type !== 'PseudoClassSelector') continue
    if (pseudoClassSelector.name !== 'component') continue
    if (!pseudoClassSelector.args) continue

    // get component name and class name
    const selectors = pseudoClassSelector.args.children[0].children[0].selectors
    const componentName = selectors.find((x) => x.type === 'TypeSelector')?.name
    const className = selectors.find((x) => x.type === 'ClassSelector')?.name
    if (!componentName || !className) continue
    
    // get style block
    const openBraceIndex = children.block.start - cssAst.content.start
    const closeBraceIndex = children.block.end - cssAst.content.start
    const styleBlock = cssAst.content.styles.slice(openBraceIndex, closeBraceIndex)

    styleInfo.set(componentName, {
      componentName,
      className,
      style: `.${className} ${styleBlock}`,
      start: children.block.start,
      end: children.block.end
    })
  }

  return styleInfo.size !== 0 ? styleInfo : null
}

export function shouldSkipFile(code: string, id: string) {
  // ignore .svelte-kit and node_modules folders
  // TODO: maybe allow node_modules
  if (id.includes('.svelte-kit') || id.includes('node_modules')) return true

  // ignore non-svelte files
  if (id.endsWith('.svelte')) {
    // ignore files without <style> tag
    if (code.indexOf('<style') === -1) return true

    // // ignore files without :component
    if (code.indexOf(':component') === -1) return true

    // // ignore files without component with class attribute
    const match = code.match(/<[A-Z]+\w*? [\s\S]+?[^=]>/g)
    if (match === null) return true
    if (match.findIndex((s) => s.includes('class=')) !== -1) return false
  }
  return true
}

function extractClassAttributes(attributes: AST.BaseElement['attributes'] ) {
  let classNames: string[] = []

  const processExpressionTag = (expression: AST.ExpressionTag['expression']) => {
    if (expression.type === 'Literal' && typeof expression.value === 'string') {
      classNames = classNames.concat(cleanStringSplit(expression.value))
      return
    }

    if (expression.type === 'ConditionalExpression') {
      processExpressionTag(expression.consequent)
      processExpressionTag(expression.alternate)
      return
    }
  }

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];

    if (attribute.type !== 'Attribute') continue
    if (attribute.name !== 'class') continue

    // no clue what is this for
    if (typeof attribute.value === 'boolean') continue

    // if it's not array it will be ExpressionTag
    if (!Array.isArray(attribute.value)) {
      processExpressionTag(attribute.value.expression)
      continue
    }

    for (let i = 0; i < attribute.value.length; i++) {
      const value = attribute.value[i]
      if (value.type === 'Text') {
        Object.assign(classNames, cleanStringSplit(value.data))
        continue
      }
      if (value.type === 'ExpressionTag') processExpressionTag(value.expression)
    }
  }

  return classNames.length !== 0 ? classNames : null
}

function nodeFilter(node: AST.Fragment["nodes"][number]) {
  const type = node.type
  if (
    type === 'Comment' || 
    type === 'ConstTag' || // {#const name = expression}
    type === 'DebugTag' || // {#debug}
    type === 'ExpressionTag' || // {expression}
    type === 'SvelteBody' ||
    type === 'SvelteDocument' ||
    type === 'SvelteWindow' ||
    type === 'Text' ||  // regular text
    type === 'HtmlTag' || // {@html html string value}
    type === 'RenderTag' // {@render snippet}
  ) return null
  return node
}

export type ComponentInfo = {
  name: string,
  classNames: string[],
}

export function getComponentInfo(nodes: AST.Fragment["nodes"], componentInfo: Map<string, ComponentInfo> = new Map()) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodeFilter(nodes[i])
    if (node == null) continue
    
    if (node.type === 'Component') {
      const classNames = extractClassAttributes(node.attributes)
      if (classNames) {
        componentInfo.set(node.name, {
          name: node.name,
          classNames,
        })
      }
    }

    if (node.type === 'IfBlock') {
      getComponentInfo(node.consequent.nodes, componentInfo)
      if (node.alternate) {
        getComponentInfo(node.alternate.nodes, componentInfo)
      }
      continue
    }

    if (node.type === 'AwaitBlock') {
      if (node.pending) {
        getComponentInfo(node.pending.nodes, componentInfo)
      }
      if (node.then) {
        getComponentInfo(node.then.nodes, componentInfo)
      }
      if (node.catch) {
        getComponentInfo(node.catch.nodes, componentInfo)
      }
      continue
    }

    if ('fragment' in node) {
      getComponentInfo(node.fragment.nodes, componentInfo)
      continue
    }

    // handles Each and snippet 
    if ('body' in node) {
      getComponentInfo(node.body.nodes, componentInfo)
      continue
    }
  }
  return componentInfo
}

/**
 * Splits sting on empty space and returns array with non empty strings
 * @param string 
 * @returns string[]
 */
function cleanStringSplit(string: string) {
  if (!string) return []
  return string.split(' ').flatMap((s) => {
    if (s === '') return []
    return s
  })
}


function testPlugin(): Plugin {
  let devServer = false
  let reloadModule: (path: string) => Promise<void>
  let getModuleById: (id: string) => ModuleNode | undefined

  return {
    configResolved(config) {
     if (config.command === 'serve') {
        devServer = true
      }
    },

    handleHotUpdate(ctx) {},
    name: 'force-hmr-plugin',
    enforce: 'pre',
    configureServer(server) {
      reloadModule = async (path) => {
        const module = await server.moduleGraph.ensureEntryFromUrl(path)
        if(!module) return

        server.reloadModule(module);
      }
      getModuleById = (id: string) => server.moduleGraph.getModuleById(id)
    },
    transform(code, id) {
      if (devServer) {
        return transformDevServer(code, id, reloadModule, getModuleById)
      } else {
        return transformBuild()
      }
    }
  };
}

let reloading = new Map<string, string>()

function transformDevServer(code: string, id: string, reloadModule: (path: string) => Promise<void>, getModuleById: (id: string) => ModuleNode | undefined) {


  if (reloading.has(id)) {
    console.log('reloading')
    // const ast = parse(code, { modern: true })
    
    // const start = code.slice(0, ast.css?.content.start)
    // const end = code.slice(ast.css?.content.start)

    
    console.log(code);
    

    const newCode = `${reloading.get(id)}\n${code}`

    // // console.log(start)
    reloading.delete(id)
    
    return newCode
  }




  // if (shouldSkipFile(code, id)) return null
  
  if (!id.endsWith('EditorButton.svelte')) return null
  console.log('------------------------------------------------------------------------------------------');
  
  const ast = parse(code, { modern: true })

  const stylesInfo = getStyles(ast.css)
  const componentInfo = getComponentInfo(ast.fragment.nodes)
  const componentImports = getImports(ast.instance, id)

  stylesInfo?.forEach((styleInfo, componentName) => {
    if (!componentInfo.has(componentName)) return 
    if (!componentImports?.has(componentName)) return

    // remove style from code
    code.replace(styleInfo.style, '')

    console.log(componentInfo.get(componentName)?.name)
    
    reloading.set(componentImports.get(componentName)!.importedFrom + '?svelte&type=style&lang.css', styleInfo.style)


    reloadModule(componentImports.get(componentName)!.importedFrom + '?svelte&type=style&lang.css')
    
    
  })

  return null
}

function transformBuild() {
  return null
}
