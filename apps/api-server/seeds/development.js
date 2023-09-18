const fs = require('fs').promises;

const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

module.exports = async function seed(config, db) {

  try {

    let allowedDomains = process.env.NODE_ENV === 'development' ? ['localhost', ] : [];
    let apiDomain = process.env.API_DOMAIN || removeProtocol(process.env.API_URL) || '';
    allowedDomains.push(apiDomain);

    console.log('  creating development data');
    console.log('    rename default project to Plannen insturen');
    let project = await db.Project.update({
      name: 'Plannen insturen',
      config: {
        allowedDomains,
        "auth": {
          "default": "openstad",
          "provider": {
            "openstad": {
              "adapter": "openstad",
              "clientId": "uniquecode",
              "clientSecret": "uniquecode123"
            },
            "anonymous": {
              "adapter": "openstad",
              "clientId": "anonymous",
              "clientSecret": "anonymous123"
            },
          }
        },
        votes: {
          isViewable: true
        }
      }
    },{
      where: { 
        id: 1
      },
    });

    console.log('    add begroot project');
    project = await db.Project.create({
      id: 2,
      name: 'Begroten',
      config: {
        allowedDomains,
        "auth": {
          "default": "openstad",
          "provider": {
            "openstad": {
              "adapter": "openstad",
              "clientId": "uniquecode",
              "clientSecret": "uniquecode123"
            },
            "anonymous": {
              "adapter": "openstad",
              "clientId": "anonymous",
              "clientSecret": "anonymous123"
            },
          }
        },
      },
    });

    console.log('    add keuzewijzer project');
    project = await db.Project.create({
      id: 3,
      name: 'Keuzewijzer',
      config: {
        allowedDomains,
        "auth": {
          "default": "openstad",
          "provider": {
            "openstad": {
              "adapter": "openstad",
              "clientId": "uniquecode",
              "clientSecret": "uniquecode123"
            },
            "anonymous": {
              "adapter": "openstad",
              "clientId": "anonymous",
              "clientSecret": "anonymous123"
            },
          }
        },
      },
    });

    console.log('    add 4 member users');
    await db.User.create({
      projectId: 1,
      role: 'admin',
      name: 'User one',
    });

    await db.User.create({
      projectId: 1,
      role: 'member',
      name: 'User two',
    });

    await db.User.create({
      projectId: 2,
      role: 'admin',
      name: 'User one',
    });

    await db.User.create({
      projectId: 2,
      role: 'member',
      name: 'User two',
    });


    console.log('    10 ideas');
    await db.Idea.create({
      userId: 2,
      projectId: 1,
      title: 'Lorem ipsum dolor',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque a sollicitudin velit, ac vehicula nibh.',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque a sollicitudin velit, ac vehicula nibh. Sed nec est convallis, interdum ex id, tempus mauris. Nulla facilisi. Quisque placerat condimentum est. Sed condimentum ex a orci dignissim ultrices. Nulla aliquam placerat ornare. Nulla condimentum, risus id commodo finibus, leo mauris tincidunt purus, non viverra augue ligula et sapien. Nunc pulvinar, eros at feugiat facilisis, quam tellus elementum metus, a sodales neque nibh non magna. Integer iaculis, nisl aliquet tempor hendrerit, lacus quam sollicitudin lectus, sed consectetur eros turpis sit amet nunc. Aenean eu neque at libero eleifend fringilla. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec quis posuere lacus, vitae eleifend magna. Nunc egestas sollicitudin ipsum, maximus tincidunt leo facilisis at. In rhoncus eget libero sit amet aliquam.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/zand.01.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 1,
      title: 'Etiam euismod odio',
      summary: 'Etiam euismod odio ac augue blandit, quis ultricies ipsum ultrices. Nulla ornare odio et nisi.',
      description: 'Etiam euismod odio ac augue blandit, quis ultricies ipsum ultrices. Nulla ornare odio et nisi tempor rhoncus. Maecenas et venenatis arcu. Proin efficitur neque sit amet enim suscipit laoreet. Mauris vehicula tristique lorem, eu imperdiet erat ornare eget. Quisque consectetur interdum tincidunt. Vestibulum ultricies arcu eleifend pharetra finibus. Fusce nec justo magna. Aliquam erat volutpat. Vivamus sollicitudin a sapien a auctor. Aenean id augue quis ex laoreet sodales.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/zand.02.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 1,
      title: 'Quisque et viverra',
      summary: 'Quisque et viverra nisi. Nullam augue sapien, feugiat finibus erat a, varius congue dolor. Integer.',
      description: 'Quisque et viverra nisi. Nullam augue sapien, feugiat finibus erat a, varius congue dolor. Integer arcu urna, porta eget lacus a, imperdiet mattis ex. Curabitur eu urna eu nisl blandit scelerisque sed nec diam. Maecenas et sapien risus. Duis eget iaculis massa, et tempor tellus. Ut diam est, euismod in enim in, commodo rhoncus sapien.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/zand.03.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 1,
      title: 'Ut eu porttitor',
      summary: 'Ut eu porttitor odio. Aliquam nec volutpat diam. Etiam eget tempor lacus, sed aliquet lectus.',
      description: 'Ut eu porttitor odio. Aliquam nec volutpat diam. Etiam eget tempor lacus, sed aliquet lectus. Nullam sollicitudin urna ex, eget tempor leo ullamcorper non. Nullam dapibus et libero consequat euismod. Donec dui est, tempor ut lobortis ac, euismod quis nibh. In hac habitasse platea dictumst. Quisque malesuada ex mauris, ut aliquam lectus tristique id. Sed a ultrices arcu. Cras velit enim, euismod vel dictum eu, sodales eu tellus. In sit amet tristique purus, ac mollis turpis. Aliquam erat volutpat. Integer sit amet nisi tempus, maximus arcu a, venenatis urna.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/zand.04.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 1,
      title: 'Pellentesque consectetur eros',
      summary: 'Pellentesque consectetur eros at tempus viverra. In hac habitasse platea dictumst. Aenean egestas urna sapien.',
      description: 'Pellentesque consectetur eros at tempus viverra. In hac habitasse platea dictumst. Aenean egestas urna sapien, porttitor pretium ante pharetra ut. Curabitur gravida ex sed felis vestibulum imperdiet. Pellentesque rutrum posuere tortor non placerat. Aliquam ornare massa id lacus vulputate, a rutrum sapien mattis. Proin purus nisl, lacinia in porttitor a, vulputate at diam. Sed fermentum augue in ipsum interdum, nec molestie diam placerat.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/zand.05.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 2,
      title: 'Vestibulum ante ipsum',
      summary: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce ornare.',
      description: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce ornare felis id lacinia sodales. Vivamus augue ligula, ullamcorper ac volutpat non, scelerisque at neque. Nulla laoreet, sapien ac iaculis sodales, massa lacus auctor felis, consequat gravida lorem erat sed metus. Fusce lacus mauris, cursus id magna ullamcorper, lacinia eleifend mauris. Etiam scelerisque molestie dui congue eleifend. Phasellus a tortor nibh. Ut vestibulum ut risus at finibus.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/forum.romanum.01.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 2,
      title: 'Nulla laoreet pretium',
      summary: 'Nulla laoreet pretium tortor at placerat. Sed in est vulputate, ullamcorper nisi id, elementum enim.',
      description: 'Nulla laoreet pretium tortor at placerat. Sed in est vulputate, ullamcorper nisi id, elementum enim. Nulla ac nisl id nibh auctor ullamcorper. In suscipit porttitor mi at sodales. Pellentesque diam elit, ornare in aliquam eget, dictum a libero. Donec sagittis dictum elit sit amet varius. Maecenas eget mauris ultricies, ullamcorper nibh sit amet, luctus ex. Cras rhoncus dolor dolor, at porta ligula bibendum sit amet. Proin hendrerit efficitur tortor eget consectetur. Curabitur vitae dictum velit. Praesent scelerisque, dui quis elementum sodales, nisi erat porttitor quam, quis feugiat erat augue vehicula dui. Praesent ultrices suscipit tellus, sit amet consectetur enim accumsan ac. Suspendisse ac porta velit.',
      extraData: {
        images: [
          'https://image.os20.nlsvgtr.nl/image/forum.romanum.02.jpg'
        ]
      },
      location: {
        type: 'Point',
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - 015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });


    await db.Idea.create({
      userId: 2,
      projectId: 2,
      title: 'Aliquam ut magna',
      summary: 'Aliquam ut magna eget ante tempor consectetur non nec nibh. Etiam id tellus eget turpis.',
      description: 'Aliquam ut magna eget ante tempor consectetur non nec nibh. Etiam id tellus eget turpis porta egestas. Sed maximus sed nisi vel ornare. Aliquam erat volutpat. Phasellus lobortis nibh in convallis eleifend. Morbi nunc nisi, consequat nec odio a, efficitur congue ipsum. Donec nec leo id urna scelerisque rutrum. Donec pulvinar nunc nisl, at dignissim purus dapibus at. Phasellus pellentesque sem turpis, et facilisis nisl tempus at.',
      "extraData": {
        "images": [
          "https://image.os20.nlsvgtr.nl/image/forum.romanum.03'jpg"
        ]
      },
      location: {        
        type: "Point",
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - 015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 2,
      title: 'Etiam ultricies dui',
      summary: 'Etiam ultricies dui non justo laoreet convallis. Aenean odio erat, molestie et odio in, imperdiet.',
      description: 'Etiam ultricies dui non justo laoreet convallis. Aenean odio erat, molestie et odio in, imperdiet consectetur mauris. Pellentesque lobortis lacus sodales, volutpat turpis vel, posuere purus. Aliquam non elementum dolor. Ut vel dolor nec purus hendrerit molestie. Sed tortor erat, facilisis vitae orci sit amet, maximus viverra diam. Ut non sem mollis, facilisis libero id, sollicitudin felis. Donec at orci fermentum, pretium nunc a, dictum mauris. In tristique quis sapien sed faucibus. Quisque posuere purus tortor, quis gravida mauris cursus ac. Integer semper turpis quis magna consectetur, blandit placerat tellus lobortis. Morbi commodo sem iaculis nunc ornare, vel lobortis enim lacinia. Sed vitae lacus ex.',
      "extraData": {
        "images": [
          "https://image.os20.nlsvgtr.nl/image/forum.romanum.04'jpg"
        ]
      },
      location: {        
        type: "Point",
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - 015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    await db.Idea.create({
      userId: 2,
      projectId: 2,
      title: 'Nullam dignissim tincidunt',
      summary: 'Nullam dignissim tincidunt urna, non vehicula enim convallis vitae. Nulla enim nibh, semper et metus.',
      description: 'Nullam dignissim tincidunt urna, non vehicula enim convallis vitae. Nulla enim nibh, semper et metus quis, venenatis eleifend nisi. Phasellus sed erat est. Donec ac lobortis turpis. Nulla facilisi. Pellentesque sit amet nisi id ante maximus consequat non sit amet nisl. Sed diam metus, malesuada ac aliquet in, pulvinar ac elit. Sed feugiat a dui sit amet luctus. Morbi sit amet dignissim neque, eget blandit lorem. Suspendisse ultrices mauris felis, in fermentum metus vestibulum a. Integer congue pharetra risus a interdum. Vivamus fringilla justo ac elementum tempor. Quisque ultrices fringilla lobortis. Aliquam ullamcorper ligula eu ipsum imperdiet vestibulum. Maecenas pretium, mi eget blandit tincidunt, justo lorem ornare lorem, in vulputate diam quam mollis ligula. Etiam viverra, nisl et laoreet tristique, dui sapien volutpat leo, in euismod diam dui nec orci. ',
      "extraData": {
        "images": [
          "https://image.os20.nlsvgtr.nl/image/forum.romanum.05'jpg"
        ]
      },
      location: {        
        type: "Point",
        coordinates: [
          52.3710476 + ( Math.random * .03 - .015 ),
          4.9005494 + ( Math.random * .03 - .015 )
        ]
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    console.log('      with 4 likes');
    await db.Vote.create({
      userId: 2,
      ideaId: 1,
      opinion: 'yes',
    });
 	  
    await db.Vote.create({
      userId: 3,
      ideaId: 1,
      opinion: 'yes',
    });
 	  
    await db.Vote.create({
      userId: 2,
      ideaId: 2,
      opinion: 'yes',
    });

    await db.Vote.create({
      userId: 3,
      ideaId: 2,
      opinion: 'no',
    });

    console.log('    6 comments');

    await db.Comment.create({
      userId: 2,
      ideaId: 1,
      description: 'In id vestibulum leo. Integer a justo quis est porttitor auctor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Pellentesque porta laoreet scelerisque. Etiam laoreet ultrices est, vitae malesuada magna tempor eu.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 2,
      ideaId: 1,
      parentId: 1,
      sentiment: 'for',
      description: 'Sed egestas sapien nec tristique cursus. Nunc euismod tempus nisl, sit amet malesuada velit. Vivamus nec nulla eleifend, congue dolor quis, dignissim est. Maecenas rhoncus tellus et augue efficitur tincidunt. Ut euismod libero vel lorem semper.',
    });

    await db.Comment.create({
      userId: 3,
      ideaId: 1,
      description: 'Aliquam tincidunt enim et arcu dictum, mollis consequat ligula feugiat. Cras vel imperdiet eros. Nulla finibus sed metus a mattis. Aenean lobortis fringilla felis id congue. Cras lacus justo, imperdiet in tellus vitae, volutpat pretium dolor.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 3,
      ideaId: 1,
      description: 'Curabitur vestibulum ex sem, in tempor mi ullamcorper vitae. Aenean dui magna, auctor in eleifend nec, elementum quis massa. Etiam quis eros sapien. Mauris ornare mi ut justo pretium, quis mollis sapien pulvinar. Maecenas feugiat sapien.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 2,
      ideaId: 2,
      description: 'Mauris a vestibulum justo, a mattis purus. Phasellus auctor eros vitae augue dictum aliquam. Pellentesque quis pulvinar est, sed congue metus. Morbi volutpat velit libero, ac condimentum justo egestas ac. Integer eu sollicitudin mauris. Curabitur sed.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 2,
      ideaId: 1,
      description: 'Mauris a vestibulum justo, a mattis purus. Phasellus auctor eros vitae augue dictum aliquam. Pellentesque quis pulvinar est, sed congue metus. Morbi volutpat velit libero, ac condimentum justo egestas ac. Integer eu sollicitudin mauris. Curabitur sed.',
      sentiment: 'against',
    });

    console.log('      with 3 likes');

    await db.CommentVote.create({
      userId: 2,
      commentId: 3,
      opinion: 'yes',
    });

    await db.CommentVote.create({
      userId: 1,
      commentId: 4,
      opinion: 'yes',
    });

    await db.CommentVote.create({
      userId: 3,
      commentId: 3,
      opinion: 'yes',
    });

    console.log('    a choices-guide');
    await db.ChoicesGuide.create({
      projectId: 3,
      title: 'Niels\' zn test keuzes',
      description: 'Basis keuzewijzer voor het testen van van alles',
      config: '{"isActive":true,"submissionType":"form","requiredUserRole":"member","withExisting":"error"}',
    });

    await db.ChoicesGuideQuestionGroup.create({
      choicesGuideId: 1,
      answerDimensions: 2,
      title: 'Vragengroep Nummer 1',
      description: 'Zonder beschrijving, maar met een <a href="https://nlsvgtr.nl" target="_blank" rel="noreferrer noopener">link</a>',
      seqnr: 10,
    });

    await db.ChoicesGuideQuestion.create({
      questionGroupId: 1,
      title: 'Vraag 1',
      description: 'Hoeveel fiducie heb je in de goede afloop??',
      images: '["https://image.os20.nlsvgtr.nl/image/zand.01.jpg"]',
      type: 'a-to-b',
      dimensions: '["x"]',
      values: '{ "A": { "questionImage": [ "https://image.openstad.amsterdam.nl/image/e68b21246380b722f9fe589b065873d4" ], "questionText": "Ik vind dat de gemeente verantwoordelijk is voor het verduurzamen van Amsterdam. ", "label": "AA", "labelAbove": "AAAA", "labelBelow": "Weinig" }, "B": { "questionImage": [ "https://image.openstad.amsterdam.nl/image/2bf220c6ff23dd524c78a49eb68aa7cb" ], "questionText": "De Amsterdammers moeten zelf kunnen bepalen hoe we samen een duurzame en gezonde stad worden. De gemeente moet het mogelijk maken.", "label": "BB", "labelBbove": "B", "labelBelow": "Veel", "labelAbove": "BBBB" } }',
      seqnr: 20,
    });

    await db.ChoicesGuideQuestion.create({
      questionGroupId: 1,
      title: 'Vraag 3',
      description: 'Wat is je favoriete hoek van een vierkant',
      images: '["https://image.os20.nlsvgtr.nl/image/zand.02.jpg"]',
      type: 'enum-radio',
      dimensions: '["x","y"]',
      values: '[ { "text": "Linksboven", "value": { "x": "0", "y": "0" } }, { "text": "Linksonder", "value": { "x": 0, "y": 100 } }, { "text": "Rechtsboven", "value": { "x": 100, "y": 0 } }, { "text": "Rechtsonder", "value": { "x": 100, "y": 100 } } ]',
      seqnr: 30,
    });

    await db.ChoicesGuideQuestion.create({
      questionGroupId: 1,
      title: 'Vraag 23',
      description: 'Is het leuk om deze vraag te beantwoorden?',
      images: 'https://image.os20.nlsvgtr.nl/image/zand.03.jpg',
      type: 'enum-radio',
      dimensions: '["y"]',
      values: '[ { "text": "Ja", "value": { "x": "0", "y": "0" } }, { "text": "Nee", "value": { "x": "100", "y": "100" } } ]',
      seqnr: 100,
    });

    await db.ChoicesGuideQuestion.create({
      questionGroupId: 1,
      title: 'Vraag 18',
      description: '',
      images: '{}',
      type: 'a-to-b',
      dimensions: '["x"]',
      values: '{ "A": { "labelBelow": "0" }, "B": { "labelBelow": "100" } }',
      seqnr: 110,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'Links Boven',
      images: '["https://image.os20.nlsvgtr.nl/image/forum.romanum.01.jpg"]',
      answers: '{ "35": { "x": 0, "y": 0 }, "36": { "x": "0", "y": 0 }, "37": { "x": 0, "y": 0 } }', 
      seqnr: 10,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'Rechts Boven',
      images: '["https://image.os20.nlsvgtr.nl/image/forum.romanum.02.jpg"]',
      answers: '{ "35": { "x": 100, "y": 0 }, "36": { "x": 100, "y": 0 }, "37": { "x": 100, "y": 0 } }', 
      seqnr: 20,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'links onder',
      images: '["https://image.os20.nlsvgtr.nl/image/forum.romanum.03.jpg"]',
      answers: '{ "35": { "x": 0, "y": 100 }, "36": { "x": 0, "y": 100 }, "37": { "x": 0, "y": 100 } }', 
      seqnr: 30,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'rechts onder',
      images: '["https://image.os20.nlsvgtr.nl/image/forum.romanum.04.jpg"]',
      answers: '{ "35": { "x": 100, "y": 100 }, "36": { "x": 100, "y": 100 }, "37": { "x": 100, "y": 100 } }', 
      seqnr: 40,
    });  

  } catch(err) {
    console.log(err);
  }
  
}








