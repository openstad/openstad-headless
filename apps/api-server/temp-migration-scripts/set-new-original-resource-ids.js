const db = require('../src/db');
const { retrieveArg } = require('./utils')

const declaredArgs = {
    indienenProjectId: "indienen-project-id",
    stemmenProjectId: "stemmen-project-id",
}

const indienenProjectId = retrieveArg(declaredArgs.indienenProjectId);
const stemmenProjectId = retrieveArg(declaredArgs.stemmenProjectId);

async function setNewOriginalResourceIds() {
    const indienResourceOldToNewIdMap = new Map()
    const indienResources = await db.Resource.findAll({ where: { projectId: indienenProjectId } })

    indienResources.forEach(indienResource => {
        if (indienResource.extraData.originalOldOpenStadId) {
            indienResourceOldToNewIdMap.set(indienResource.extraData.originalOldOpenStadId, indienResource.id)
        }
    });

    const stemmenResources = await db.Resource.findAll({ where: { projectId: stemmenProjectId } })

    const updatedStemmenResourcesPromises = stemmenResources.map(async (stemmenResource) => {
        if (indienResourceOldToNewIdMap.has(stemmenResource.extraData.originalId)) {
            const newExtraDataData = {
                ...stemmenResource.extraData,
                originalId: indienResourceOldToNewIdMap.get(stemmenResource.extraData.originalId),
                originalOldOpenStadoriginalId: stemmenResource.extraData.originalId,
            }
            const newStemmenResourceData = {
                ...stemmenResource,
                extraData: newExtraDataData,
            }
            const updatedStemmenResource = await db.Resource.update(newStemmenResourceData, {
                where: {
                    id: stemmenResource.id
                }
            })
            return updatedStemmenResource
        }
    })
    const stemmenResourcedUpdatedWIthNewOriginalId = await Promise.all(updatedStemmenResourcesPromises)

    console.log("Completed setting new originalId's")
}

setNewOriginalResourceIds()