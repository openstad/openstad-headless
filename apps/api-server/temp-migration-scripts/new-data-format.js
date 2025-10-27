const getNewApiUserData = (oldUserData, newAuthUserId, anonymizeUsers, newProjectId) => {
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
        idpUser: newAuthUserId ? {"provider": "openstad", "identifier": newAuthUserId} : {},
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

const getNewResourceData = (oldIdeaData, userId, modBreakUserId, oldImageUrlPrefix, newImageUrlPrefix, newProjectId) => {
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
        originalOldOpenStadStatus: oldIdeaData.status,
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

module.exports = { getNewApiUserData, getNewResourceData, getNewVoteData, getNewCommentData }