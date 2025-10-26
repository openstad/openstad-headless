const db = require('../src/db');
const { retrieveArg } = require('./utils')

const declaredArgs = {
    projectId: "project-id",
}

const projectId = retrieveArg(declaredArgs.projectId);

async function setTags() {
    const resources = await db.Resource.findAll({ where: { projectId } })
    
    console.log(`Found ${resources.length} resources for projectId ${projectId}`)

    const areaSet = new Set()
    const themeSet = new Set()

    const areaNameToIdMap = new Map()
    const themeNameToIdMap = new Map()

    resources.forEach(resource => {
        const area = resource.extraData.area
        const theme = resource.extraData.theme
        if (area) {
            areaSet.add(area)
        }
        if (theme) {
            themeSet.add(theme)
        }
    });

    console.log(`Found ${areaSet.size} unique area's:`)
    areaSet.forEach(area => {
        console.log(area)
    })

    console.log(`Found ${themeSet.size} unique themes:`)
    themeSet.forEach(theme => {
        console.log(theme)
    })

    // //////
    // Area tags
    // //////

    let areaTags
    const getAreaTagsPromises = Array.from(areaSet).map(async (area, index) => {
        const tagData = {
            projectId,
            name: area,
            type: "gebied",
            seqnr: (index + 1) * 10,
            addToNewResources: 0,
            label: area,
            extraData: { originalOldOpenStadArea: area},
        }

        let tag
        let created
        [tag, created] = await db.Tag.findOrCreate({
            where: tagData
        })

        return tag
    })
    areaTags = await Promise.all(getAreaTagsPromises)

    areaTags.forEach((areaTag) => {
        areaNameToIdMap.set(areaTag.name, areaTag)
    })

    let resourcesUpdatedWithAreaTags
    const updateResourcesWithAreaTagsPromises = resources.map(async (resource) => {
        if (resource.extraData.area) {
            return resource.addTag(areaNameToIdMap.get(resource.extraData.area))
        }
    })
    resourcesUpdatedWithAreaTags = await Promise.all(updateResourcesWithAreaTagsPromises)

    console.log(`${resourcesUpdatedWithAreaTags.length} resources got an area-tag assigned.`)

    // //////
    // Theme tags
    // //////

    let themeTags
    const getThemeTagsPromises = Array.from(themeSet).map(async (theme, index) => {
        const tagData = {
            projectId,
            name: theme,
            type: "thema",
            seqnr: (index + 1) * 10,
            addToNewResources: 0,
            label: theme,
            extraData: { originalOldOpenStadTheme: theme},
        }

        let tag
        let created
        [tag, created] = await db.Tag.findOrCreate({
            where: tagData
        })

        return tag
    })
    themeTags = await Promise.all(getThemeTagsPromises)

    themeTags.forEach((themeTag) => {
        themeNameToIdMap.set(themeTag.name, themeTag)
    })

    let resourcesUpdatedWithThemeTags
    const updateResourcesWithThemeTagsPromises = resources.map(async (resource) => {
        if (resource.extraData.theme) {
            return resource.addTag(themeNameToIdMap.get(resource.extraData.theme))
        }
    })
    resourcesUpdatedWithThemeTags = await Promise.all(updateResourcesWithThemeTagsPromises)

    console.log(`${resourcesUpdatedWithThemeTags.length} resources got an theme-tag assigned.`)
}

setTags()