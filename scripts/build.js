#!/usr/bin/env node

const fs = require('fs')
const domain = process.argv[2]
let path = `${process.cwd()}/dashboard/journeys`

const recursiveData = (items) => {

  return items.map((item) => {
    path = `${path}/${item}`

    const info = fs.readFileSync(`${path}/info.json`, 'utf-8')
    const parsedInfo = JSON.parse(info)
    const children = fs.readdirSync(path)

    const filteredChildren = children.filter((child) => !child.includes('.json'))
    console.log('🚀 ~ file: build.js ~ line 17 ~ returnitems.map ~ filteredChildren', filteredChildren);

    if (filteredChildren.length) {
      return {
        ...parsedInfo,
        children: recursiveData(filteredChildren)
      }
    }

    return {
      ...parsedInfo,
      children
    }
  })
}

const dashboardBuild = () => {
  const items = fs.readdirSync(path)

  try {
    const teste = recursiveData(items)

    console.log('🚀 ~ file: build.js ~ line 26 ~ dashboardBuild ~ teste', JSON.stringify(teste, null, 2));
  


  } catch(error) {
  console.log('🚀 ~ file: build.js ~ line 14 ~ dashboardBuild ~ error', error);

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
