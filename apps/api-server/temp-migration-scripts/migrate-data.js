const mysql = require('mysql2/promise');
const db = require('../src/db');
const { retrieveArg, getDbPassword } = require('./utils')
const { getNewApiUserData, getNewResourceData, getNewVoteData, getNewCommentData } = require('./new-data-format')

const declaredArgs = {
    originalSiteId: "original-site-id",
    newProjectId: "new-project-id",
    oldImageUrlPrefix: "old-image-url-prefix",
    newImageUrlPrefix: "new-image-url-prefix",
    anonymizeUsers: "anonymize-users",
    newAuthDbName: "new-auth-db-name",
}

const originalSiteId = retrieveArg(declaredArgs.originalSiteId);
const newProjectId = retrieveArg(declaredArgs.newProjectId);
const oldImageUrlPrefix = retrieveArg(declaredArgs.oldImageUrlPrefix);
const newImageUrlPrefix = retrieveArg(declaredArgs.newImageUrlPrefix);
const anonymizeUsers = retrieveArg(declaredArgs.anonymizeUsers) == "no" ? false : true;
const newAuthDbName = retrieveArg(declaredArgs.newAuthDbName) || "auth";

const sqlQueries = {
    getApiUsers: `SELECT * FROM users WHERE siteId = ? AND deletedAt IS NULL`,
    getIdeas: `SELECT * FROM ideas WHERE siteId = ? AND deletedAt IS NULL`,
    getVotes: `SELECT * FROM votes WHERE ideaId = ?`,
    getArguments: `SELECT * FROM arguments WHERE ideaId = ?`,
    getAuthUser: `SELECT * FROM users WHERE email = ?`,
    createAuthUser: `INSERT INTO users (email, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
}

let legacyApiDbConnection;
let legacyAuthDbConnection;
let newAuthDbConnection;

async function migrateData() {
  try {
    const ssl = {
        rejectUnauthorized: false
    }

    if (process.env.DB_REQUIRE_SSL) {
        ssl.rejectUnauthorized = true;
        ssl.require = true;
    }

    legacyApiDbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: await getDbPassword(),
      database: "apilegacy",
      ssl,
    });

    legacyAuthDbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: await getDbPassword(),
      database: "authlegacy",
      ssl,
    });

    newAuthDbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: await getDbPassword(),
      database: newAuthDbName,
      ssl,
    });

    console.log("")
    console.log("// //////");
    console.log("// STEP 1: Get old (api) users");
    console.log("// //////");
    console.log("")

    const [oldUsers] = await legacyApiDbConnection.execute(sqlQueries.getApiUsers, [originalSiteId]);
    console.log(`Query returned ${oldUsers.length} old users.`);

    console.log("")
    console.log("// //////");
    console.log("// STEP 2: Get old ideas");
    console.log("// //////");
    console.log("")

    const [oldIdeas] = await legacyApiDbConnection.execute(sqlQueries.getIdeas, [originalSiteId]);
    console.log(`Query returned ${oldIdeas.length} old ideas.`);

    console.log("")
    console.log("// //////");
    console.log("// STEP 3: Get old votes");
    console.log("// //////");
    console.log("")

    let oldVotes;
    try {
        const getOldVotesPromises = oldIdeas.map(async (oldIdea) => {
            const [oldVotesForSingleIdea] = await legacyApiDbConnection.execute(sqlQueries.getVotes, [oldIdea.id]);
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
            const [oldArgumentsForSingleIdea] = await legacyApiDbConnection.execute(sqlQueries.getArguments, [oldIdea.id]);
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

    let newApiUsers
    let oldToNewApiUserIdMap
    const existingNewAuthUsers = []
    const createdNewAuthUsers = []

    const getAuthUserId = async (oldUser) => {
        try {
            const [existingNewAuthUser] = await newAuthDbConnection.execute(sqlQueries.getAuthUser, [oldUser.email])
            if (existingNewAuthUser.length > 0) {
                existingNewAuthUsers.push(existingNewAuthUser[0])
                return existingNewAuthUser[0].id
            } else {
                const name = (`${oldUser.firstName} ${oldUser.lastName}`).trim()
                const now = new Date();
                const mysqlDatetime = now.toISOString().slice(0, 19).replace('T', ' ');
                const [createdNewAuthUser] = await newAuthDbConnection.execute(sqlQueries.createAuthUser, [oldUser.email, name, mysqlDatetime, mysqlDatetime])
                createdNewAuthUsers.push(createdNewAuthUser)
                return createdNewAuthUser.insertId
            }
        } catch (err) {
            console.error("Error in getting or creating the userId from the new auth database: ", err.message)
            throw err;
        }
    }

    try {
        const writenewApiUsersPromises = oldUsers.map(async (oldUser) => {
            const authUserId = oldUser.email && !anonymizeUsers ? await getAuthUserId(oldUser) : null;
            const newUser = await db.User.create(getNewApiUserData(oldUser, authUserId, anonymizeUsers, newProjectId));
            return { newUser, oldUser };
        })
        const results = await Promise.all(writenewApiUsersPromises);
        newApiUsers = results.map(result => result.newUser)
        oldToNewApiUserIdMap = new Map(results.map(result => [result.oldUser.id, result.newUser.id]))

    } catch (err) {
        console.error("Error writing new users to the new database:", err.message);
        throw err;
    } finally {
        console.log(`${newApiUsers.length} out of ${oldUsers.length} users are written to the new api-database: ${newApiUsers.length == oldUsers.length ? "GOOD" : "NOT ALL USERS ARE MIGRATED"}`)
        console.log(`${existingNewAuthUsers.length} users already existed in the auth-database.`)
        console.log(`${createdNewAuthUsers.length} users were created in the auth-database.`)
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
                    oldToNewApiUserIdMap.get(oldIdea.userId),
                    oldToNewApiUserIdMap.get(oldIdea.modBreakUserId),
                    oldImageUrlPrefix,
                    newImageUrlPrefix,
                    newProjectId
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
                    oldToNewApiUserIdMap.get(oldVote.userId)
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
                    oldToNewApiUserIdMap.get(oldArgument.userId)
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
                oldToNewApiUserIdMap.get(oldArgument.userId),
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
    await legacyApiDbConnection.end();
    await legacyAuthDbConnection.end();
    await newAuthDbConnection.end();
    console.log("Database connections closed.");
  }
}

migrateData();