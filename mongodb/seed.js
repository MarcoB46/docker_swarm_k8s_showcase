db.connections.insertMany([
    {
        id: 1,
        timestamp: Date.now(),
        data: "questo è un record di test per la raccolta connection"
    },
    {
        id: 2,
        timestamp: Date.now(),
        data: "provapp2"
    }
]);

// db.documents.insertMany([
//     // MongoDB adds the _id field with an ObjectId if _id is not present
//     {
//       name: 'FIRST', tags: ["TAG1", "TAG2", "TAG3"]
//     },
//     {
//       name: 'SECOND', tags: ["TAG4", "TAG5"]
//     },
//     {
//       name: 'THIRD', tags: ['TAG6']
//     }
//   ]);
  