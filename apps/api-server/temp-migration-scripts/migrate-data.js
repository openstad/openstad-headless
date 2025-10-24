const mysql = require('mysql2/promise');
const db = require('../src/db');

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
    getUsers: `SELECT * FROM users WHERE siteId = ${originalSiteId} AND deletedAt IS NULL`,
    getIdeas: `SELECT * FROM ideas WHERE siteId = ${originalSiteId} AND deletedAt IS NULL`,
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
            console.log(`======> DEBUG: replacing ${oldImageUrlPrefix} with ${newImageUrlPrefix}`)
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

    console.log("// //////");
    console.log("// STEP 1: Get old users");
    console.log("// //////");

    console.log("Running the following query: ", sqlQueries.getUsers)
    const [oldUsers] = await legacyDbConnection.execute(sqlQueries.getUsers);
    console.log(`Query returned ${oldUsers.length} users.`);

    console.log("// //////");
    console.log("// STEP 2: Get old ideas");
    console.log("// //////");

    console.log("Running the following query: ", sqlQueries.getIdeas)
    const [oldIdeas] = await legacyDbConnection.execute(sqlQueries.getIdeas);
    console.log(`Query returned ${oldIdeas.length} ideas.`);

    console.log("// //////");
    console.log("// STEP 3: Get old votes");
    console.log("// //////");

    console.log("// //////");
    console.log("// STEP 4: Write new users");
    console.log("// //////");

    console.log("Start writing new users")
    const newUsers = []
    const oldToNewUserIdMap = new Map()
    try {
        const writeNewUsersPromises = oldUsers.map(async (oldUser) => {
            const newUser = await db.User.create(getNewUserData(oldUser));
            newUsers.push(newUser)
            oldToNewUserIdMap.set(oldUser.id, newUser.id)
        })
        await Promise.all(writeNewUsersPromises);
    } catch (err) {
        console.error("Error writing new users to the new database:", err.message);
    } finally {
        console.log(`${newUsers.length} out of ${oldUsers.length} users are written to the new database: ${newUsers.length == oldUsers.length ? "GOOD" : "NOT ALL USERS ARE MIGRATED"}`)
    }

    console.log("// //////");
    console.log("// STEP 5: Write new resources");
    console.log("// //////");

    console.log("Start writing new resources")
    const newResources = []
    const oldIdeaToNewResourceIdMap = new Map()
    try {
        const writeNewResourcesPromises = oldIdeas.map(async (oldIdea) => {
            const newResource = await db.Resource.create(getNewResourceData(oldIdea, oldToNewUserIdMap.get(oldIdea.userId), oldToNewUserIdMap.get(oldIdea.modBreakUserId)))
            newResources.push(newResource)
            oldIdeaToNewResourceIdMap.set(oldIdea.id, newResource.id)
        })
        await Promise.all(writeNewResourcesPromises);
    } catch (err) {
        console.error("Error writing new resources to the new database:", err.message);
    } finally {
        console.log(`${newResources.length} out of ${oldIdeas.length} resources are written to the new database: ${newResources.length == oldIdeas.length ? "GOOD" : "NOT ALL IDEAS ARE MIGRATED"}`)
    }

} catch (err) {
    console.error("Error connecting to the database:", err.message);
} finally {
    await legacyDbConnection.end();
    console.log("Database connection closed.");
  }
}

migrateData();