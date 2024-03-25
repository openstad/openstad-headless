let query = 'https://admin.os20.nlsvgtr.nl/projects?openstadlogintoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImF1dGhQcm92aWRlciI6Im9wZW5zdGFkIiwiaWF0IjoxNzEwOTM4OTA5LCJleHAiOjE3MjY2NjM3MDl9.oHrcERVbcawGfxkA7gqhIn1TKOfb3CpeLzhg6pEFcP8'
query = query.replace(/(?:\?|&)openstadlogintoken=(?:.(?!&|$))+./, '');

console.log(query);
