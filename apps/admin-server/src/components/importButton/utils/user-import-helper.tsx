import type { userType } from '@/hooks/use-users';
import type { ApiUser } from '@openstad-headless/types';

// Import row columns that reference the original user.
type UserImportRow = { 'user.id'?: number; user?: { id?: number } };

export async function processUserId(
  project: string,
  value: UserImportRow,
  createUser: (user: userType) => Promise<ApiUser>
): Promise<number | undefined> {
  const originalUserId = value['user.id'] || value?.user?.id;

  if (!originalUserId) {
    return undefined;
  }

  try {
    const userResponse = await fetch(
      `/api/openstad/api/user/${originalUserId}`
    );

    if (!userResponse.ok) {
      return originalUserId;
    }

    const originalUser: ApiUser = await userResponse.json();

    if (originalUser.idpUser?.identifier && originalUser.idpUser?.provider) {
      const projectUsersResponse = await fetch(
        `/api/openstad/api/project/${project}/user`
      );

      if (projectUsersResponse.ok) {
        const projectUsers: ApiUser[] = await projectUsersResponse.json();
        const existingUser = projectUsers.find(
          (u) =>
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

export function extractUniqueUserIds(values: UserImportRow[]): Set<number> {
  const unique = new Set<number>();

  values.forEach((row) => {
    const userId = row['user.id'] || row?.user?.id;
    if (userId) unique.add(userId);
  });

  return unique;
}

export async function prepareUsers(
  uniqueUserIds: Set<number>,
  project: string,
  createUser: (user: userType) => Promise<ApiUser>
): Promise<Map<number, number>> {
  const mapping = new Map<number, number>();

  for (const originalUserId of Array.from(uniqueUserIds)) {
    const newUserId = await processUserId(
      project,
      { 'user.id': originalUserId },
      createUser
    );
    if (newUserId) mapping.set(originalUserId, newUserId);
  }

  return mapping;
}
