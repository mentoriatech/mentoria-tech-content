#!/usr/bin/env node

const fs = require('fs')
const domain = process.argv[2]
const rootPath = `${process.cwd()}/dashboard/journeys`
const destPath = `${process.cwd()}/public`

const recursivelyGetJourneysContent = (items, path) => items.reduce((acc, curr) => {
    const info = fs.readFileSync(`${path}/${curr}/info.json`, 'utf-8')
    const parsedInfo = JSON.parse(info)
    const fullChildren = fs.readdirSync(`${path}/${curr}`)
    
    let children = fullChildren.filter((child) => !child.includes('.json'))

    if (children.length) {
      const followingPath = `${path}/${curr}`
      children = recursivelyGetJourneysContent(children, followingPath)
    }
    
    if (parsedInfo.children && parsedInfo.children.length) {
      children = parsedInfo.children.map((child) => JSON.parse(fs.readFileSync(`${path}/${curr}/${child}.json`, 'utf-8')))
    }

    const result = { ...parsedInfo, children }

    return { ...acc, [curr]: result }
  }, {})

const saveData = (data, path) => fs.writeFileSync(path, JSON.stringify(data, null, 2))

const getJourneysInfo = async (journeys) => {
  if (!journeys) {
    return []
  }
  
  const journeysInfo = await Promise.allSettled(journeys.map((journey) => fs.readFileSync(`${rootPath}/${journey}/info.json`, 'utf-8')))

  return journeysInfo.reduce((acc, curr) => {
    return [...acc, JSON.parse(curr.value)]
  }, [])
}

const dashboardBuild = async () => {
  
  try {
    const items = fs.readdirSync(rootPath)
    const journeys = await getJourneysInfo(items)
    const data = recursivelyGetJourneysContent(items, rootPath)
    
    Object.keys(data).map((file) => saveData(data[file], `${destPath}/${file}.json`))

    saveData(journeys, `${destPath}/journeys.json`)

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
