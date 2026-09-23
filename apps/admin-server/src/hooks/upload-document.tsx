import { assertUploadableSize, performUpload } from '@/lib/upload-limits';
import { validateProjectNumber } from '@/lib/validateProjectNumber';

function prepareDocument(document: File) {
  const formData = new FormData();
  formData.append('document', document);
  formData.append('documentname', 'testName');
  formData.append('description', 'testDescription');

  return formData;
}

export async function UploadDocument(data: File, project?: string) {
  assertUploadableSize(data);

  const document = prepareDocument(data);
  const projectNumber: number | undefined = validateProjectNumber(project);

  return performUpload(
    `/api/openstad/api/project/${projectNumber}/upload/document`,
    document
  );
}
