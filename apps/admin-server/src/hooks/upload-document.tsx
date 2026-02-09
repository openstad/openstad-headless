import {validateProjectNumber} from "../lib/validateProjectNumber";

function prepareDocument(document: any) {
  const formData = new FormData();
  formData.append('document', document);
  formData.append('documentname', 'testName');
  formData.append('description', 'testDescription');

  return formData;
}

export async function UploadDocument(data: any, project?: string) {
  let document = prepareDocument(data);

  const projectNumber: number | undefined = validateProjectNumber(project);

  const response = await fetch(`/api/openstad/api/project/${projectNumber}/upload/document`, {
    method: 'POST',
    body: document
  })

  return await response.json();
}