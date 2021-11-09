// const profile = {
//   name: "Raphael",
//   age: 39,
//   hobbies: ['computer', 'movies', 'travel'],
//   account: true
// };

async function createAuction(event, context) {
  return {
    statusCode: 200,
    //body: JSON.stringify(profile),
    //body: JSON.stringify({ event, context }),
    body: JSON.stringify({ event, context }),
  };
}

export const handler = createAuction;


