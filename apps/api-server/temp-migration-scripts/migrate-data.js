const mysql = require('mysql2/promise');
const db = require('../src/db');
const { argument } = require('../src/util/sanitize');

const declaredArgs = {
    originalSiteId: "original-site-id",
    newProjectId: "new-project-id",
    oldImageUrlPrefix: "old-image-url-prefix",
    newImageUrlPrefix: "new-image-url-prefix",
    anonymizeUsers: "anonymize-users"
}

const givenArgs = process.argv

const retrieveArg = (argToRetrieve) => {
    const totalArgWithKeyAndValue = givenArgs.find(arg => arg.startsWith(argToRetrieve))
    let valueFromArg = null
    if (totalArgWithKeyAndValue) {
        valueFromArg = totalArgWithKeyAndValue.split("=")[1]
    }
    return valueFromArg
}
const originalSiteId = retrieveArg(declaredArgs.originalSiteId);
const newProjectId = retrieveArg(declaredArgs.newProjectId);
const oldImageUrlPrefix = retrieveArg(declaredArgs.oldImageUrlPrefix);
const newImageUrlPrefix = retrieveArg(declaredArgs.newImageUrlPrefix);
const anonymizeUsers = retrieveArg(declaredArgs.anonymizeUsers) == "no" ? false : true;

const sqlQueries = {
    getUsers: (siteId) => `SELECT * FROM users WHERE siteId = ${siteId} AND deletedAt IS NULL`,
    getIdeas: (siteId) => `SELECT * FROM ideas WHERE siteId = ${siteId} AND deletedAt IS NULL`,
    getVotes: (ideaId) => `SELECT * FROM votes WHERE ideaId = ${ideaId}`,
    getArguments: (ideaId) => `SELECT * FROM arguments WHERE ideaId = ${ideaId}`,
}

const getNewUserData = (oldUserData) => {
    let firstname = null;
    let lastname = null;

    if (oldUserData.firstName || oldUserData.lastName) {
        if (anonymizeUsers) {
            firstname = "Geanonimiseerde gebruiker";
            lastname = `${oldUserData.id}`;
        } else {
            firstname = oldUserData.firstName;
            lastname = oldUserData.lastName;
        }
    }

    const newAddress = oldUserData.streetName ? `${oldUserData.streetName} ${oldUserData.houseNumber}${oldUserData.suffix}` : null;
    const newPostcode = oldUserData.zipCode ? oldUserData.zipCode : oldUserData.postcode;

    return {
        projectId: newProjectId,
        idpUser: {}, // TODO
        role: oldUserData.role,
        email: anonymizeUsers ? null : oldUserData.email,
        nickName: anonymizeUsers? null : oldUserData.nickName,
        name: firstname || lastname ? (`${firstname} ${lastname}`).trim() : null,
        firstname,
        lastname,
        listableByRole: oldUserData.listableByRole,
        detailsViewableByRole: oldUserData.detailsViewableByRole,
        phoneNumber: anonymizeUsers ? null : oldUserData.phoneNumber,
        address: anonymizeUsers ? null : newAddress,
        city: anonymizeUsers ? null : oldUserData.city,
        postcode: anonymizeUsers ? null : newPostcode,
        isNotifiedAboutAnonymization: oldUserData.isNotifiedAboutAnonymization,
        createdAt: oldUserData.createdAt,
        extraData: {
            originalOldOpenStadUserId: oldUserData.id,
            originalOldOpenStadSiteId: oldUserData.siteId,
            originalOldOpenStadExternalUserId: oldUserData.externalUserId,
            originalOldOpenStadComplete: oldUserData.complete,
            originalOldOpenStadUserDidHaveZipCode: oldUserData.zipCode ? 'yes' : 'no',
            originalOldOpenStadUserDidHavePostcode: oldUserData.postcode ? 'yes' : 'no',
            originalOldOpenStadSignedUpForNewsletter: oldUserData.signedUpForNewsletter,
            ...oldUserData.extraData
        }
    }
}

const getNewResourceData = (oldIdeaData, userId, modBreakUserId) => {
    let images = []
    
    oldIdeaData.extraData.images.forEach(imageUrl => {
        let newImageUrl = imageUrl
        if (oldImageUrlPrefix && newImageUrlPrefix) {
            newImageUrl = newImageUrl.replace(oldImageUrlPrefix, newImageUrlPrefix)
        }
        images.push({"url": newImageUrl})
    });

    let location = null
    if (oldIdeaData.location?.x && oldIdeaData.location?.y) {
        location = {
            lat: oldIdeaData.location.x,
            lng: oldIdeaData.location.y
      }
    }
    
    return {
      userId,
      projectId: newProjectId,
      title: oldIdeaData.title,
      summary: oldIdeaData.summary,
      description: oldIdeaData.description,
      images,
      location,
      budget: oldIdeaData.budget,
      modBreak: oldIdeaData.modBreak,
      modBreakUserId, 
      modBreakDate: oldIdeaData.modBreakDate,
      startDate: oldIdeaData.startDate,
      publishDate: oldIdeaData.publishDate,
      createdAt: oldIdeaData.createdAt,
      viewableByRole: oldIdeaData.viewableByRole,
      sort: oldIdeaData.sort,
      extraData: {
        originalOldOpenStadId: oldIdeaData.id,
        originalOldOpenStadTypeId: oldIdeaData.typeId,
        originalOldOpenStadUserId: oldIdeaData.userId,
        originalOldOpenStadSiteId: oldIdeaData.siteId,
        originalOldOpenStadModBreakUserId: oldIdeaData.modBreakUserId,
        ...oldIdeaData.extraData
      }
    }
}

const getNewVoteData = (oldVoteData, resourceId, userId) => {
    return {
        resourceId,
        userId,
        confirmed: oldVoteData.confirmed,
        ip: oldVoteData.ip,
        opinion: oldVoteData.opinion,
        checked: oldVoteData.checked,
        createdAt: oldVoteData.createdAt,
        deletedAt: oldVoteData.deletedAt,
    }
}

const getNewCommentData = (oldArgumentData, resourceId, userId, parentId) => {
    return {
        parentId,
        resourceId,
        userId,
        sentiment: oldArgumentData.sentiment,
        description: oldArgumentData.description,
        label: oldArgumentData.label,
        createdAt: oldArgumentData.createdAt,
        deletedAt: oldArgumentData.deletedAt,
    }
}

const getDbPassword = async () => {
	switch(process.env.DB_AUTH_METHOD) {
		case 'azure-auth-token':
			const { getAzureAuthToken } = require('../src/util/azure')
			return await getAzureAuthToken()
		default:
			return process.env.DB_PASSWORD
	}
}

let legacyDbConnection;

async function migrateData() {
  try { // to connect to the old legacy database
    const ssl = {
        rejectUnauthorized: false
    }

    if (process.env.DB_REQUIRE_SSL) {
        ssl.rejectUnauthorized = true;
        ssl.require = true;
    }

    // Create a connection to the legacy database
    legacyDbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: await getDbPassword(),
      database: "apilegacy",
      ssl,
    });

    console.log("Connected to the legacy MySQL database!");

    console.log("")
    console.log("// //////");
    console.log("// STEP 1: Get old users");
    console.log("// //////");
    console.log("")

    const getUsersQuery = sqlQueries.getUsers(originalSiteId)
    console.log("Running the following query: ", getUsersQuery)
    const [oldUsers] = await legacyDbConnection.execute(getUsersQuery);
    console.log(`Query returned ${oldUsers.length} old users.`);

    console.log("")
    console.log("// //////");
    console.log("// STEP 2: Get old ideas");
    console.log("// //////");
    console.log("")

    const getIdeasQuery = sqlQueries.getIdeas(originalSiteId)
    console.log("Running the following query: ", getIdeasQuery)
    const [oldIdeas] = await legacyDbConnection.execute(getIdeasQuery);
    console.log(`Query returned ${oldIdeas.length} old ideas.`);

    console.log("")
    console.log("// //////");
    console.log("// STEP 3: Get old votes");
    console.log("// //////");
    console.log("")

    let oldVotes;
    try {
        const getOldVotesPromises = oldIdeas.map(async (oldIdea) => {
            const getOldVotesQuery = sqlQueries.getVotes(oldIdea.id)
            const [oldVotesForSingleIdea] = await legacyDbConnection.execute(getOldVotesQuery);
            return oldVotesForSingleIdea
        })
        oldVotes = (await Promise.all(getOldVotesPromises)).flat()
    } catch (err) {
        console.error("Error getting old votes:", err.message);
        throw err;
    } finally {
        console.log(`Query returned ${oldVotes.length} old votes (including deleted votes).`)
    }

    console.log("")
    console.log("// //////");
    console.log("// STEP 4: Get old arguments");
    console.log("// //////");
    console.log("")

    let oldArguments;
    try {
        const getOldArgumentsPromises = oldIdeas.map(async (oldIdea) => {
            const getOldArgumentsQuery = sqlQueries.getArguments(oldIdea.id);
            const [oldArgumentsForSingleIdea] = await legacyDbConnection.execute(getOldArgumentsQuery);
            return oldArgumentsForSingleIdea
        })
        oldArguments = (await Promise.all(getOldArgumentsPromises)).flat()
    } catch (err) {
        console.error("Error getting old arguments:", err.message);
        throw err;
    } finally {
        console.log(`Query returned ${oldArguments.length} old arguments (including deleted arguments).`)
    }

    console.log("")
    console.log("// //////");
    console.log("// STEP 5: Write new users");
    console.log("// //////");
    console.log("")

    let newUsers
    let oldToNewUserIdMap
    try {
        const writeNewUsersPromises = oldUsers.map(async (oldUser) => {
            const newUser = await db.User.create(getNewUserData(oldUser));
            return { newUser, oldUser };
        })
        const results = await Promise.all(writeNewUsersPromises);
        newUsers = results.map(result => result.newUser)
        oldToNewUserIdMap = new Map(results.map(result => [result.oldUser.id, result.newUser.id]))

    } catch (err) {
        console.error("Error writing new users to the new database:", err.message);
        throw err;
    } finally {
        console.log(`${newUsers.length} out of ${oldUsers.length} users are written to the new database: ${newUsers.length == oldUsers.length ? "GOOD" : "NOT ALL USERS ARE MIGRATED"}`)
    }

    console.log("")
    console.log("// //////");
    console.log("// STEP 6: Write new resources");
    console.log("// //////");
    console.log("")

    let newResources
    let oldIdeaToNewResourceIdMap
    try {
        const writeNewResourcesPromises = oldIdeas.map(async (oldIdea) => {
            const newResource = await db.Resource.create(
                getNewResourceData(
                    oldIdea,
                    oldToNewUserIdMap.get(oldIdea.userId),
                    oldToNewUserIdMap.get(oldIdea.modBreakUserId)
                )
            )
            return { newResource, oldIdea }
        })
        const results = await Promise.all(writeNewResourcesPromises);
        newResources = results.map(result => result.newResource)
        oldIdeaToNewResourceIdMap = new Map(results.map(result => [result.oldIdea.id, result.newResource.id]))
    } catch (err) {
        console.error("Error writing new resources to the new database:", err.message);
        throw err;
    } finally {
        console.log(`${newResources.length} out of ${oldIdeas.length} resources are written to the new database: ${newResources.length == oldIdeas.length ? "GOOD" : "NOT ALL IDEAS ARE MIGRATED"}`)
    }

    console.log("")
    console.log("// //////");
    console.log("// STEP 7: Write new votes");
    console.log("// //////");
    console.log("")

    let newVotes
    try {
        const writeNewVotesPromises = oldVotes.map(async (oldVote) => {
            const newVote = await db.Vote.create(
                getNewVoteData(
                    oldVote,
                    oldIdeaToNewResourceIdMap.get(oldVote.ideaId),
                    oldToNewUserIdMap.get(oldVote.userId)
                )
            )
            return newVote
        })
        newVotes = await Promise.all(writeNewVotesPromises)
    } catch (err) {
        console.error("Error writing new votes to the new database:", err.message);
        throw err;
    } finally {
        console.log(`${newVotes.length} out of ${oldVotes.length} votes are written to the new database: ${newVotes.length == oldVotes.length ? "GOOD" : "NOT ALL VOTES ARE MIGRATED"}`)
    }

    console.log("")
    console.log("// //////");
    console.log("// STEP 8: Write new comments");
    console.log("// //////");
    console.log("")

    let newComments
    let oldArgumentToNewCommentIdMap
    let oldArgumentsWithParentId = []
    let newCommentsUpdatedWithParentId
    try {

        // First, write all new comments
        
        const writeNewCommentsPromises = oldArguments.map(async (oldArgument) => {
            const newComment = await db.Comment.create(
                getNewCommentData(
                    oldArgument,
                    oldIdeaToNewResourceIdMap.get(oldArgument.ideaId),
                    oldToNewUserIdMap.get(oldArgument.userId)
                )
            )
            return { newComment, oldArgument }
        })
        results = await Promise.all(writeNewCommentsPromises)
        newComments = results.map(result => result.newComment)
        oldArgumentToNewCommentIdMap = new Map(results.map(result => [result.oldArgument.id, result.newComment.id]))

        // Second, update comment.parentId with new commentId where needed

        oldArgumentsWithParentId = oldArguments.filter((oldArgument) => oldArgument.parentId) || null
        const updateNewCommentParentIdsPromises = oldArgumentsWithParentId.map(async (oldArgument) => {
            const updatedCommentData = getNewCommentData(
                oldArgument,
                oldIdeaToNewResourceIdMap.get(oldArgument.ideaId),
                oldToNewUserIdMap.get(oldArgument.userId),
                oldArgumentToNewCommentIdMap.get(oldArgument.parentId)
            )
            const updatedComment = await db.Comment.update(updatedCommentData, {
                where: {
                    id: oldArgumentToNewCommentIdMap.get(oldArgument.id),
                }
            })
            return updatedComment
        })
        newCommentsUpdatedWithParentId = await Promise.all(updateNewCommentParentIdsPromises)
    } catch (err) {
        console.error("Error writing new comments to the new database:", err.message);
        throw err;
    } finally {
        console.log(`${newComments.length} out of ${oldArguments.length} comments are written to the new database: ${newComments.length == oldArguments.length ? "GOOD" : "NOT ALL ARGUMENTS ARE MIGRATED"}`)
        console.log(`${newCommentsUpdatedWithParentId.length} out of ${oldArgumentsWithParentId.length} comments with a parentId are updated in the new database: ${newCommentsUpdatedWithParentId.length == oldArgumentsWithParentId.length ? "GOOD" : "NOT ALL COMMENTS WERE UPDATED WITH A PARENTID"}`)
    }

} catch (err) {
    console.error("Error while migrating data:", err.message);
} finally {
    await legacyDbConnection.end();
    console.log("Database connection closed.");
  }
}

migrateData();