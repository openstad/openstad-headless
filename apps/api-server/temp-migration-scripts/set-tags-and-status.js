const db = require('../src/db');
const { retrieveArg } = require('./utils')

const declaredArgs = {
    projectId: "project-id",
}

const projectId = retrieveArg(declaredArgs.projectId);

async function setTagsAndStatus() {
    const resources = await db.Resource.findAll({ where: { projectId } })
    
    console.log(`Found ${resources.length} resources for projectId ${projectId}`)

    const areaSet = new Set()
    const themeSet = new Set()
    const statusSet = new Set()

    const areaNameToIdMap = new Map()
    const themeNameToIdMap = new Map()
    const statusNameToIdMap = new Map()

    resources.forEach(resource => {
        const area = resource.extraData.area
        const theme = resource.extraData.theme
        const status = resource.extraData.originalOldOpenStadStatus
        if (area) {
            areaSet.add(area)
        }
        if (theme) {
            themeSet.add(theme)
        }
        if (status) {
            statusSet.add(status)
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

    console.log(`Found ${statusSet.size} unique statuses:`)
    statusSet.forEach(status => {
        console.log(status)
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

    console.log("Completed area-tag assignment.")

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

    console.log("Completed theme-tag assignment.")

    // //////
    // Status
    // //////

    let statuses
    const getStatusPromises = Array.from(statusSet).map(async (status, index) => {
        const statusData = {
            projectId,
            name: status,
            seqnr: (index + 1) * 10,
            addToNewResources: 0,
            extraData: { originalOldOpenStadStatus: status},
            extraFunctionality: {}
        }

        let returnedStatus
        let created
        [returnedStatus, created] = await db.Status.findOrCreate({
            where: statusData
        })

        return returnedStatus
    })
    statuses = await Promise.all(getStatusPromises)

    statuses.forEach((status) => {
        statusNameToIdMap.set(status.name, status)
    })

    let resourcesUpdatedWithStatus
    const updateResourcesWithStatusPromises = resources.map(async (resource) => {
        if (resource.extraData.originalOldOpenStadStatus) {
            return resource.addStatus(statusNameToIdMap.get(resource.extraData.originalOldOpenStadStatus))
        }
    })
    resourcesUpdatedWithStatus = await Promise.all(updateResourcesWithStatusPromises)

    console.log("Completed status assignment.")
}

setTagsAndStatus()