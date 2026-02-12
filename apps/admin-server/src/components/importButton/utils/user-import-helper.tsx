export async function processUserId(
  project: string,
  value: any,
  createUser: (user: any) => Promise<any>
): Promise<number | undefined> {
  const originalUserId = value['user.id'] || value?.user?.id;
  
  if (!originalUserId) {
    return undefined;
  }

  try {
    const userResponse = await fetch(`/api/openstad/api/user/${originalUserId}`);
    
    if (!userResponse.ok) {
      return originalUserId;
    }
    
    const originalUser = await userResponse.json();

    if (originalUser.idpUser?.identifier && originalUser.idpUser?.provider) {
      const projectUsersResponse = await fetch(`/api/openstad/api/project/${project}/user`);
      
      if (projectUsersResponse.ok) {
        const projectUsers = await projectUsersResponse.json();
        const existingUser = projectUsers.find((u: any) => 
          u.idpUser?.identifier === originalUser.idpUser.identifier &&
          u.idpUser?.provider === originalUser.idpUser.provider
        );
        
        if (existingUser) {
          return existingUser.id;
        }
      }
    }

    const createdUser = await createUser({
      ...originalUser,
      projectId: parseInt(project),
    });
    
    return createdUser.id;

  } catch (error) {
    console.error('Error processing userId:', error);
    return originalUserId;
  }
}

export function extractUniqueUserIds(values: any[]): Set<number> {
  const unique = new Set<number>();
  
  values.forEach(row => {
    const userId = row['user.id'] || row?.user?.id;
    if (userId) unique.add(userId);
  });
  
  return unique;
}

export async function prepareUsers(
  uniqueUserIds: Set<number>,
  project: string,
  createUser: (user: any) => Promise<any>
): Promise<Map<number, number>> {
  const mapping = new Map<number, number>();
  
  for (const originalUserId of Array.from(uniqueUserIds)) {
    const newUserId = await processUserId(project, { 'user.id': originalUserId }, createUser);
    if (newUserId) mapping.set(originalUserId, newUserId);
  }
  
  return mapping;
}