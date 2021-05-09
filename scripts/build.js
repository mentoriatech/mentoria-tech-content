#!/usr/bin/env node

const fs = require('fs')
const domain = process.argv[2]
const rootPath = `${process.cwd()}/dashboard/journeys`

const recursiveBuild = (items, path) => items.reduce((acc, curr) => {
    const info = fs.readFileSync(`${path}/${curr}/info.json`, 'utf-8')
    const parsedInfo = JSON.parse(info)
    const fullChildren = fs.readdirSync(`${path}/${curr}`)
    
    let children = fullChildren.filter((child) => !child.includes('.json'))
    
    if (children.length) {
      const followingPath = `${path}/${curr}`
      children = recursiveBuild(children, followingPath)
    }
    
    const result = { ...parsedInfo, children }

    return { ...acc, [curr]: result } 
  }, {})

const saveData = (data) => {
  const files = Object.keys(data).map((file) => 
    fs.writeFileSync(`${process.cwd()}/public/${file}.json`, JSON.stringify(data[file], null, 2)))
  
  return Promise.allSettled(files)
}

const dashboardBuild = () => {
  const items = fs.readdirSync(rootPath)
  try {
    const data = recursiveBuild(items, rootPath)

    saveData(data)

  } catch(error) {
    throw new Error(error)
  }
}

const buildMap = {
  dashboard: dashboardBuild,
}

const buildContent = () => {
  if (!domain) {
    throw new Error('Please provide domain')
  }
  return buildMap[domain]()
}

module.exports = buildContent()
