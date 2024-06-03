const fs = require('fs').promises;

const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

module.exports = async function seed(config, db) {

  try {

    let allowedDomains = process.env.NODE_ENV === 'development' ? ['localhost', ] : [];
    let apiDomain = process.env.API_DOMAIN || removeProtocol(process.env.API_URL) || '';
    allowedDomains.push(apiDomain);
    let apiDomainWithoutPortnumber = apiDomain.replace(/:\d+/, '');
    if (apiDomain != apiDomainWithoutPortnumber) allowedDomains.push(apiDomainWithoutPortnumber);

    console.log('    add plannen insturen project');
    let project = await db.Project.create({
      id: 2,
      name: 'Plannen',
      title: 'Plannen insturen',
      config: {
        allowedDomains,
        auth: {
          default: 'openstad',
          provider: {
            openstad: {
              adapter: 'openstad',
              clientId: 'uniquecode',
              clientSecret: 'uniquecode123'
            },
            anonymous: {
              adapter: 'openstad',
              clientId: 'anonymous',
              clientSecret: 'anonymous123'
            },
          }
        },
        votes: {
          isActive: true,
          requiredUserRole: 'anonymous',
          isViewable: true,
          withExisting: 'replace',
          maxResources: 10000,
          minResources: 1,
          minBudget: 100,
          maxBudget: 80000,
          voteType: 'likes',
          voteValues: [
            {
              label: 'I like',
              value: 'yes'
            },
            {
              label: 'Don\'t know',
              value: 'mayby'
            },
            {
              label: 'I do not like',
              value: 'no'
            }
          ]
        },
      },
      emailConfig: {
        notifications: {
          fromAddress: 'nobody@openstad.dev',
          projectmanagerAddress: 'unknown@nowhere',
          projectadminAddress: 'unknown@nowhere',
        },
      },
    });
    project = await project.update({
      'config': {
        'votes': {
          'isActive': true,
          'requiredUserRole': 'anonymous',
          'isViewable': true
        }
      }
    });

    console.log('    add begroot project');
    project = await db.Project.create({
      id: 3,
      name: 'Begroten',
      title: 'Begroten',
      config: {
        allowedDomains,
        auth: {
          default: 'openstad',
          provider: {
            openstad: {
              adapter: 'openstad',
              clientId: 'uniquecode',
              clientSecret: 'uniquecode123'
            },
            anonymous: {
              adapter: 'openstad',
              clientId: 'anonymous',
              clientSecret: 'anonymous123'
            },
          }
        },
        votes: {
          isViewable: true,
          isActive: true,
          requiredUserRole: "member",
          mustConfirm: false,
          withExisting: "replace",
          voteType: "budgeting",
          minBudget: 1000,
          maxBudget: 20000,
        }
      },
      emailConfig: {
        notifications: {
          fromAddress: 'nobody@openstad.dev',
          projectmanagerAddress: 'unknown@nowhere',
          projectadminAddress: 'unknown@nowhere',
        },
      },
    });

    console.log('    add keuzewijzer project');
    project = await db.Project.create({
      id: 4,
      name: 'Keuzewijzer',
      title: 'Keuzewijzer',
      config: {
        allowedDomains,
        auth: {
          default: 'openstad',
          provider: {
            openstad: {
              adapter: 'openstad',
              clientId: 'uniquecode',
              clientSecret: 'uniquecode123'
            },
            anonymous: {
              adapter: 'openstad',
              clientId: 'anonymous',
              clientSecret: 'anonymous123'
            },
          }
        },
        votes: {
          isActive: true,
          requiredUserRole: 'anonymous',
          isViewable: true,
          maxResources: 10000,
          minResources: 1,
          minBudget: 100,
          maxBudget: 80000,
          voteType: 'budgeting',
          withExisting: 'error',
        }
      },
      emailConfig: {
        notifications: {
          fromAddress: 'nobody@openstad.dev',
          projectmanagerAddress: 'unknown@nowhere',
          projectadminAddress: 'unknown@nowhere',
        },
      },
    });

    console.log('    add 4 member users');
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

    await db.User.create({
      projectId: 3,
      role: 'admin',
      name: 'User one',
    });

    await db.User.create({
      projectId: 3,
      role: 'member',
      name: 'User two',
    });

    console.log('    10 resources');
    let resource1 = await db.Resource.create({
      userId: 2,
      projectId: 2,
      title: 'Lorem ipsum dolor',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque a sollicitudin velit, ac vehicula nibh.',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque a sollicitudin velit, ac vehicula nibh. Sed nec est convallis, interdum ex id, tempus mauris. Nulla facilisi. Quisque placerat condimentum est. Sed condimentum ex a orci dignissim ultrices. Nulla aliquam placerat ornare. Nulla condimentum, risus id commodo finibus, leo mauris tincidunt purus, non viverra augue ligula et sapien. Nunc pulvinar, eros at feugiat facilisis, quam tellus elementum metus, a sodales neque nibh non magna. Integer iaculis, nisl aliquet tempor hendrerit, lacus quam sollicitudin lectus, sed consectetur eros turpis sit amet nunc. Aenean eu neque at libero eleifend fringilla. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec quis posuere lacus, vitae eleifend magna. Nunc egestas sollicitudin ipsum, maximus tincidunt leo facilisis at. In rhoncus eget libero sit amet aliquam.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.01.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource2 = await db.Resource.create({
      userId: 2,
      projectId: 2,
      title: 'Etiam euismod odio',
      summary: 'Etiam euismod odio ac augue blandit, quis ultricies ipsum ultrices. Nulla ornare odio et nisi.',
      description: 'Etiam euismod odio ac augue blandit, quis ultricies ipsum ultrices. Nulla ornare odio et nisi tempor rhoncus. Maecenas et venenatis arcu. Proin efficitur neque sit amet enim suscipit laoreet. Mauris vehicula tristique lorem, eu imperdiet erat ornare eget. Quisque consectetur interdum tincidunt. Vestibulum ultricies arcu eleifend pharetra finibus. Fusce nec justo magna. Aliquam erat volutpat. Vivamus sollicitudin a sapien a auctor. Aenean id augue quis ex laoreet sodales.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.02.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource3 = await db.Resource.create({
      userId: 2,
      projectId: 2,
      title: 'Quisque et viverra',
      summary: 'Quisque et viverra nisi. Nullam augue sapien, feugiat finibus erat a, varius congue dolor. Integer.',
      description: 'Quisque et viverra nisi. Nullam augue sapien, feugiat finibus erat a, varius congue dolor. Integer arcu urna, porta eget lacus a, imperdiet mattis ex. Curabitur eu urna eu nisl blandit scelerisque sed nec diam. Maecenas et sapien risus. Duis eget iaculis massa, et tempor tellus. Ut diam est, euismod in enim in, commodo rhoncus sapien.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.03.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource4 = await db.Resource.create({
      userId: 2,
      projectId: 2,
      title: 'Ut eu porttitor',
      summary: 'Ut eu porttitor odio. Aliquam nec volutpat diam. Etiam eget tempor lacus, sed aliquet lectus.',
      description: 'Ut eu porttitor odio. Aliquam nec volutpat diam. Etiam eget tempor lacus, sed aliquet lectus. Nullam sollicitudin urna ex, eget tempor leo ullamcorper non. Nullam dapibus et libero consequat euismod. Donec dui est, tempor ut lobortis ac, euismod quis nibh. In hac habitasse platea dictumst. Quisque malesuada ex mauris, ut aliquam lectus tristique id. Sed a ultrices arcu. Cras velit enim, euismod vel dictum eu, sodales eu tellus. In sit amet tristique purus, ac mollis turpis. Aliquam erat volutpat. Integer sit amet nisi tempus, maximus arcu a, venenatis urna.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.04.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource5 = await db.Resource.create({
      userId: 2,
      projectId: 2,
      title: 'Pellentesque consectetur eros',
      summary: 'Pellentesque consectetur eros at tempus viverra. In hac habitasse platea dictumst. Aenean egestas urna sapien.',
      description: 'Pellentesque consectetur eros at tempus viverra. In hac habitasse platea dictumst. Aenean egestas urna sapien, porttitor pretium ante pharetra ut. Curabitur gravida ex sed felis vestibulum imperdiet. Pellentesque rutrum posuere tortor non placerat. Aliquam ornare massa id lacus vulputate, a rutrum sapien mattis. Proin purus nisl, lacinia in porttitor a, vulputate at diam. Sed fermentum augue in ipsum interdum, nec molestie diam placerat.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.05.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource6 = await db.Resource.create({
      userId: 2,
      projectId: 3,
      title: 'Vestibulum ante ipsum',
      summary: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce ornare.',
      description: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce ornare felis id lacinia sodales. Vivamus augue ligula, ullamcorper ac volutpat non, scelerisque at neque. Nulla laoreet, sapien ac iaculis sodales, massa lacus auctor felis, consequat gravida lorem erat sed metus. Fusce lacus mauris, cursus id magna ullamcorper, lacinia eleifend mauris. Etiam scelerisque molestie dui congue eleifend. Phasellus a tortor nibh. Ut vestibulum ut risus at finibus.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.01.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      budget: 10000,
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource7 = await db.Resource.create({
      userId: 2,
      projectId: 3,
      title: 'Nulla laoreet pretium',
      summary: 'Nulla laoreet pretium tortor at placerat. Sed in est vulputate, ullamcorper nisi id, elementum enim.',
      description: 'Nulla laoreet pretium tortor at placerat. Sed in est vulputate, ullamcorper nisi id, elementum enim. Nulla ac nisl id nibh auctor ullamcorper. In suscipit porttitor mi at sodales. Pellentesque diam elit, ornare in aliquam eget, dictum a libero. Donec sagittis dictum elit sit amet varius. Maecenas eget mauris ultricies, ullamcorper nibh sit amet, luctus ex. Cras rhoncus dolor dolor, at porta ligula bibendum sit amet. Proin hendrerit efficitur tortor eget consectetur. Curabitur vitae dictum velit. Praesent scelerisque, dui quis elementum sodales, nisi erat porttitor quam, quis feugiat erat augue vehicula dui. Praesent ultrices suscipit tellus, sit amet consectetur enim accumsan ac. Suspendisse ac porta velit.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.02.jpg`} ],
      location: {
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      budget: 11000,
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource8 = await db.Resource.create({
      userId: 2,
      projectId: 3,
      title: 'Aliquam ut magna',
      summary: 'Aliquam ut magna eget ante tempor consectetur non nec nibh. Etiam id tellus eget turpis.',
      description: 'Aliquam ut magna eget ante tempor consectetur non nec nibh. Etiam id tellus eget turpis porta egestas. Sed maximus sed nisi vel ornare. Aliquam erat volutpat. Phasellus lobortis nibh in convallis eleifend. Morbi nunc nisi, consequat nec odio a, efficitur congue ipsum. Donec nec leo id urna scelerisque rutrum. Donec pulvinar nunc nisl, at dignissim purus dapibus at. Phasellus pellentesque sem turpis, et facilisis nisl tempus at.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.03.jpg`} ],
      location: {        
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - 015 )
      },
      budget: 6000,
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource9 = await db.Resource.create({
      userId: 2,
      projectId: 3,
      title: 'Etiam ultricies dui',
      summary: 'Etiam ultricies dui non justo laoreet convallis. Aenean odio erat, molestie et odio in, imperdiet.',
      description: 'Etiam ultricies dui non justo laoreet convallis. Aenean odio erat, molestie et odio in, imperdiet consectetur mauris. Pellentesque lobortis lacus sodales, volutpat turpis vel, posuere purus. Aliquam non elementum dolor. Ut vel dolor nec purus hendrerit molestie. Sed tortor erat, facilisis vitae orci sit amet, maximus viverra diam. Ut non sem mollis, facilisis libero id, sollicitudin felis. Donec at orci fermentum, pretium nunc a, dictum mauris. In tristique quis sapien sed faucibus. Quisque posuere purus tortor, quis gravida mauris cursus ac. Integer semper turpis quis magna consectetur, blandit placerat tellus lobortis. Morbi commodo sem iaculis nunc ornare, vel lobortis enim lacinia. Sed vitae lacus ex.',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.04.jpg`} ],
      location: {        
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - 015 )
      },
      budget: 5000,
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    let resource10 = await db.Resource.create({
      userId: 2,
      projectId: 3,
      title: 'Nullam dignissim tincidunt',
      summary: 'Nullam dignissim tincidunt urna, non vehicula enim convallis vitae. Nulla enim nibh, semper et metus.',
      description: 'Nullam dignissim tincidunt urna, non vehicula enim convallis vitae. Nulla enim nibh, semper et metus quis, venenatis eleifend nisi. Phasellus sed erat est. Donec ac lobortis turpis. Nulla facilisi. Pellentesque sit amet nisi id ante maximus consequat non sit amet nisl. Sed diam metus, malesuada ac aliquet in, pulvinar ac elit. Sed feugiat a dui sit amet luctus. Morbi sit amet dignissim neque, eget blandit lorem. Suspendisse ultrices mauris felis, in fermentum metus vestibulum a. Integer congue pharetra risus a interdum. Vivamus fringilla justo ac elementum tempor. Quisque ultrices fringilla lobortis. Aliquam ullamcorper ligula eu ipsum imperdiet vestibulum. Maecenas pretium, mi eget blandit tincidunt, justo lorem ornare lorem, in vulputate diam quam mollis ligula. Etiam viverra, nisl et laoreet tristique, dui sapien volutpat leo, in euismod diam dui nec orci. ',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.05.png`} ],
      location: {        
        lat: 52.3710476 + ( Math.random() * .03 - .015 ),
        lng: 4.9005494 + ( Math.random() * .03 - .015 )
      },
      budget: 15000,
      startDate: db.sequelize.fn('now'),
      publishDate: db.sequelize.fn('now'),
    });

    console.log('      belonging to one of three themes and areas');
    let theme1 = await db.Tag.create({
      projectId: 2,
      name: 'Theme 1',
      type: 'theme',
      seqnr: 10,
      label: 'Thema 1',
      mapIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"45px\\" viewBox=\\"0 0 34 45\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>melding-map-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1196.000000, -216.000000)\\" fill-rule=\\"nonzero\\"><g id=\\"melding-map-icon\\" transform=\\"translate(1196.000000, 216.000000)\\"><path d=\\"M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z\\" id=\\"Path\\" fill=\\"#FF9100\\"></path><path d=\\"M14.5,23.5 L7,23.5 L7,21 L7.625,21 C9.00571187,21 10.125,19.8807119 10.125,18.5 L10.125,12.25 C10.125,9.48857625 12.3635763,7.25 15.125,7.25 L15.75,7.25 C15.75,6.55964406 16.3096441,6 17,6 C17.6903559,6 18.25,6.55964406 18.25,7.25 L18.875,7.25 C21.6364237,7.25 23.875,9.48857625 23.875,12.25 L23.875,18.5 C23.875,19.8807119 24.9942881,21 26.375,21 L27,21 L27,23.5 L19.5,23.5 C19.5,24.8807119 18.3807119,26 17,26 C15.6192881,26 14.5,24.8807119 14.5,23.5 Z M15.75,23.5 C15.75,24.1903559 16.3096441,24.75 17,24.75 C17.6903559,24.75 18.25,24.1903559 18.25,23.5 L15.75,23.5 Z M12.625,12.25 L12.625,18.5 C12.625,19.4107179 12.3815143,20.2645666 11.956089,21 L22.043911,21 C21.6184857,20.2645666 21.375,19.4107179 21.375,18.5 L21.375,12.25 C21.375,10.8692881 20.2557119,9.75 18.875,9.75 L15.125,9.75 C13.7442881,9.75 12.625,10.8692881 12.625,12.25 Z\\" id=\\"Shape\\" fill=\\"#000000\\"></path></g></g></g></svg>","width":34,"height":45,"anchor":[17,45]}',
      listIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"34px\\" viewBox=\\"0 0 34 34\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>melding-lijst-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1250.000000, -217.000000)\\"><g id=\\"Group-3-Copy\\" transform=\\"translate(1250.000000, 216.000000)\\"></g><g id=\\"melding-lijst-icon\\" transform=\\"translate(1250.000000, 217.000000)\\"><circle id=\\"Oval\\" fill=\\"#FF9100\\" cx=\\"17\\" cy=\\"17\\" r=\\"17\\"></circle><path d=\\"M14.5,24.5 L7,24.5 L7,22 L7.625,22 C9.00571187,22 10.125,20.8807119 10.125,19.5 L10.125,13.25 C10.125,10.4885763 12.3635763,8.25 15.125,8.25 L15.75,8.25 C15.75,7.55964406 16.3096441,7 17,7 C17.6903559,7 18.25,7.55964406 18.25,8.25 L18.875,8.25 C21.6364237,8.25 23.875,10.4885763 23.875,13.25 L23.875,19.5 C23.875,20.8807119 24.9942881,22 26.375,22 L27,22 L27,24.5 L19.5,24.5 C19.5,25.8807119 18.3807119,27 17,27 C15.6192881,27 14.5,25.8807119 14.5,24.5 Z M15.75,24.5 C15.75,25.1903559 16.3096441,25.75 17,25.75 C17.6903559,25.75 18.25,25.1903559 18.25,24.5 L15.75,24.5 Z M12.625,13.25 L12.625,19.5 C12.625,20.4107179 12.3815143,21.2645666 11.956089,22 L22.043911,22 C21.6184857,21.2645666 21.375,20.4107179 21.375,19.5 L21.375,13.25 C21.375,11.8692881 20.2557119,10.75 18.875,10.75 L15.125,10.75 C13.7442881,10.75 12.625,11.8692881 12.625,13.25 Z\\" id=\\"Shape\\" fill=\\"#000000\\" fill-rule=\\"nonzero\\"></path></g></g></g></svg>","width":34,"height":34}',
      color: 'black',
      backgroundColor: '#FF9100'
    });

    let theme2 = await db.Tag.create({
      projectId: 2,
      name: 'Theme 2',
      type: 'theme',
      seqnr: 20,
      label: 'Thema 2',
      mapIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"45px\\" viewBox=\\"0 0 34 45\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>bewonersvraag-map-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1189.000000, -294.000000)\\"><g id=\\"bewonersvraag-map-icon\\" transform=\\"translate(1189.000000, 294.000000)\\"><path d=\\"M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z\\" id=\\"Path\\" fill=\\"#E50082\\" fill-rule=\\"nonzero\\"></path><path d=\\"M21.7704918,11.6065574 L11.9344262,11.6065574 L11.9344262,10.6229508 L21.7704918,10.6229508 L21.7704918,11.6065574 Z M19.147541,12.5901639 L11.9344262,12.5901639 L11.9344262,13.5737705 L19.147541,13.5737705 L19.147541,12.5901639 Z M25.704918,8 L25.704918,16.5245902 L8,16.5245902 L8,8 L25.704918,8 Z M24.3934426,9.31147541 L9.31147541,9.31147541 L9.31147541,15.2131148 L24.3934426,15.2131148 L24.3934426,9.31147541 Z M19.8032787,19.8032787 L19.8032787,16.5245902 L16.5245902,16.5245902 L19.8032787,19.8032787 Z M22.7540984,25.0491803 L20.3278689,25.0491803 C18.9508197,25.0491803 17.9672131,25.6393443 17.9672131,27.4098361 L17.9672131,28 L25.1803279,28 L25.1803279,27.4098361 C25.1803279,25.6393443 24.1311475,25.0491803 22.7540984,25.0491803 Z M21.5737705,24.393443 C22.5515861,24.393443 23.3442627,23.6007664 23.3442627,22.6229508 C23.3448932,21.6339856 22.562105,20.8222052 21.5737705,20.7868852 C20.5741245,20.8208005 19.7716201,21.6233049 19.7377049,22.6229508 C19.7730249,23.6112853 20.5848053,24.3940735 21.5737705,24.393443 Z\\" id=\\"Shape\\" fill=\\"#FFFFFF\\"></path></g></g></g></svg>","width":34,"height":45,"anchor":[17,45]}',
      listIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"34px\\" viewBox=\\"0 0 34 34\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>bewonersvraag-lijst-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1243.000000, -294.000000)\\"><g id=\\"Group-3-Copy-2\\" transform=\\"translate(1243.000000, 294.000000)\\"></g><g id=\\"bewonersvraag-lijst-icon\\" transform=\\"translate(1243.000000, 294.000000)\\"><circle id=\\"Oval\\" fill=\\"#E50082\\" cx=\\"17\\" cy=\\"17\\" r=\\"17\\"></circle><path d=\\"M21.7704918,10.6065574 L11.9344262,10.6065574 L11.9344262,9.62295082 L21.7704918,9.62295082 L21.7704918,10.6065574 Z M19.147541,11.5901639 L11.9344262,11.5901639 L11.9344262,12.5737705 L19.147541,12.5737705 L19.147541,11.5901639 Z M25.704918,7 L25.704918,15.5245902 L8,15.5245902 L8,7 L25.704918,7 Z M24.3934426,8.31147541 L9.31147541,8.31147541 L9.31147541,14.2131148 L24.3934426,14.2131148 L24.3934426,8.31147541 Z M19.8032787,18.8032787 L19.8032787,15.5245902 L16.5245902,15.5245902 L19.8032787,18.8032787 Z M22.7540984,24.0491803 L20.3278689,24.0491803 C18.9508197,24.0491803 17.9672131,24.6393443 17.9672131,26.4098361 L17.9672131,27 L25.1803279,27 L25.1803279,26.4098361 C25.1803279,24.6393443 24.1311475,24.0491803 22.7540984,24.0491803 Z M21.5737705,23.393443 C22.5515861,23.393443 23.3442627,22.6007664 23.3442627,21.6229508 C23.3448932,20.6339856 22.562105,19.8222052 21.5737705,19.7868852 C20.5741245,19.8208005 19.7716201,20.6233049 19.7377049,21.6229508 C19.7730249,22.6112853 20.5848053,23.3940735 21.5737705,23.393443 Z\\" id=\\"Shape\\" fill=\\"#FFFFFF\\"></path></g></g></g></svg>","width":34,"height":34}',
      color: 'white',
      backgroundColor: '#E50082'
    });

    let theme3 = await db.Tag.create({
      projectId: 2,
      name: 'Theme 3',
      type: 'theme',
      seqnr: 30,
      label: 'Thema 3',
      mapIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"45px\\" viewBox=\\"0 0 34 45\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>Path</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1196.000000, -348.000000)\\"><g id=\\"plan-map-icon\\" transform=\\"translate(1196.000000, 348.000000)\\"><path d=\\"M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z\\" id=\\"Path\\" fill=\\"#00A03C\\" fill-rule=\\"nonzero\\"></path><path d=\\"M7.1946205,10.7093812 C7.067608,10.7642594 6.98974466,10.8940316 7.00109327,11.0319266 L7.00109327,26.5141047 L7.13011143,26.772141 L7.51716588,26.772141 L12.6133829,24.0627598 C12.7403954,24.0078816 12.8182587,23.8781094 12.8069101,23.7402145 L12.8069101,8.32254538 L12.6778919,8.06450908 L12.2908375,8.06450908 L7.1946205,10.7093812 Z M13.9680734,8.32254538 L14.0970916,8.06450908 L14.484146,8.06450908 L19.8383993,10.7738903 C19.9654118,10.8287685 20.0432752,10.9585407 20.0319266,11.0964356 L20.0319266,26.5786138 C20.0415796,26.6695457 20.0187263,26.7609587 19.9674175,26.8366501 L19.580363,26.8366501 L14.1616007,24.1272689 C14.0345882,24.0723907 13.9567248,23.9426184 13.9680734,23.8047235 L13.9680734,8.32254538 Z M26.4828341,8 L26.8698886,8 L26.9989067,8.2580363 L26.9989067,23.7402145 C27.0102553,23.8781094 26.932392,24.0078816 26.8053795,24.0627598 L21.7091625,26.772141 L21.3221081,26.772141 L21.1930899,26.5141047 L21.1930899,11.0319266 C21.1817413,10.8940316 21.2596046,10.7642594 21.3866171,10.7093812 L26.4828341,8 Z\\" id=\\"Shape\\" fill=\\"#FFFFFF\\"></path></g></g></g></svg>","width":34,"height":45,"anchor":[17,45]}',
      listIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"34px\\" viewBox=\\"0 0 34 34\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>plan-lijst-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1250.000000, -348.000000)\\"><g id=\\"Group-3-Copy-3\\" transform=\\"translate(1250.000000, 348.000000)\\"></g><g id=\\"plan-lijst-icon\\" transform=\\"translate(1250.000000, 348.000000)\\"><circle id=\\"Oval\\" fill=\\"#00A03C\\" cx=\\"17\\" cy=\\"17\\" r=\\"17\\"></circle><path d=\\"M7.1946205,10.7093812 C7.067608,10.7642594 6.98974466,10.8940316 7.00109327,11.0319266 L7.00109327,26.5141047 L7.13011143,26.772141 L7.51716588,26.772141 L12.6133829,24.0627598 C12.7403954,24.0078816 12.8182587,23.8781094 12.8069101,23.7402145 L12.8069101,8.32254538 L12.6778919,8.06450908 L12.2908375,8.06450908 L7.1946205,10.7093812 Z M13.9680734,8.32254538 L14.0970916,8.06450908 L14.484146,8.06450908 L19.8383993,10.7738903 C19.9654118,10.8287685 20.0432752,10.9585407 20.0319266,11.0964356 L20.0319266,26.5786138 C20.0415796,26.6695457 20.0187263,26.7609587 19.9674175,26.8366501 L19.580363,26.8366501 L14.1616007,24.1272689 C14.0345882,24.0723907 13.9567248,23.9426184 13.9680734,23.8047235 L13.9680734,8.32254538 Z M26.4828341,8 L26.8698886,8 L26.9989067,8.2580363 L26.9989067,23.7402145 C27.0102553,23.8781094 26.932392,24.0078816 26.8053795,24.0627598 L21.7091625,26.772141 L21.3221081,26.772141 L21.1930899,26.5141047 L21.1930899,11.0319266 C21.1817413,10.8940316 21.2596046,10.7642594 21.3866171,10.7093812 L26.4828341,8 Z\\" id=\\"Shape\\" fill=\\"#FFFFFF\\"></path></g></g></g></svg>","width":34,"height":34}',
      color: 'white',
      backgroundColor: '#00A03C'
    });

    let area1 = await db.Tag.create({
      projectId: 2,
      name: 'Area 1',
      type: 'area',
      seqnr: 10,
    });

    let area2 = await db.Tag.create({
      projectId: 2,
      name: 'Area 2',
      type: 'area',
      seqnr: 20,
    });

    let area3 = await db.Tag.create({
      projectId: 2,
      name: 'Area 3',
      type: 'area',
      seqnr: 30,
    });

    resource1.addTag(theme1);
    resource2.addTag(theme1);
    resource3.addTag(theme2);
    resource4.addTag(theme2);
    resource5.addTag(theme3);

    resource1.addTag(area2);
    resource2.addTag(area3);
    resource3.addTag(area3);
    resource4.addTag(area1);
    resource5.addTag(area1);

    let theme4 = await db.Tag.create({
      projectId: 3,
      name: 'Theme 1',
      type: 'theme',
      seqnr: 10,
    });

    let theme5 = await db.Tag.create({
      projectId: 3,
      name: 'Theme 2',
      type: 'theme',
      seqnr: 20,
    });

    let theme6 = await db.Tag.create({
      projectId: 3,
      name: 'Theme 3',
      type: 'theme',
      seqnr: 30,
    });

    resource6.addTag(theme4);
    resource7.addTag(theme5);
    resource8.addTag(theme6);
    resource9.addTag(theme4);
    resource10.addTag(theme6);

    console.log('      belonging to a status');
    let status1 = await db.Status.findOne({
      where: { projectId: 2, name: 'open' }
    })
    await status1.update({
      projectId: 2,
      label: 'Open',
      addToNewResources: true,
      mapIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"39\\" height=\\"50\\" viewBox=\\"0 0 39 50\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M19.1038 0C29.6577 0 38.2075 8.46671 38.2075 18.9181C38.2075 33.1786 21.7544 47.7273 21.0432 48.3035L19.1038 50L17.1643 48.3035C16.4532 47.7273 0 33.1786 0 18.9181C0 8.46831 8.54983 0 19.1038 0ZM32.3245 18.9181C32.3083 11.6837 26.4091 5.84187 19.1038 5.82586C11.7984 5.84187 5.89922 11.6837 5.88306 18.9181C5.88306 27.3367 14.1581 37.2439 19.0876 42.1095C23.1767 38.1242 32.3245 27.993 32.3245 18.9181Z\\" fill=\\"green\\"></path><path d=\\"M19.104 5.82568C26.4093 5.84169 32.3086 11.6836 32.3247 18.9179C32.3247 27.9928 23.1769 38.124 19.0879 42.1093C14.1584 37.2437 5.8833 27.3366 5.8833 18.9179C5.89946 11.6836 11.7987 5.84169 19.104 5.82568ZM25.5689 18.9179C25.5689 15.3807 22.6759 12.5158 19.104 12.5158C15.5322 12.5158 12.6391 15.3807 12.6391 18.9179C12.6391 22.455 15.5322 25.3199 19.104 25.3199C22.6759 25.3199 25.5689 22.455 25.5689 18.9179Z\\" fill=\\"white\\"></path><path d=\\"M19.1038 25.3202C22.6743 25.3202 25.5687 22.4539 25.5687 18.9182C25.5687 15.3824 22.6743 12.5161 19.1038 12.5161C15.5333 12.5161 12.6389 15.3824 12.6389 18.9182C12.6389 22.4539 15.5333 25.3202 19.1038 25.3202Z\\" fill=\\"green\\"></path></svg>","width":34,"height":45,"anchor":[17,45]}',
      listIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"34px\\" viewBox=\\"0 0 34 34\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>melding-lijst-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1250.000000, -217.000000)\\"><g id=\\"Group-3-Copy\\" transform=\\"translate(1250.000000, 216.000000)\\"></g><g id=\\"melding-lijst-icon\\" transform=\\"translate(1250.000000, 217.000000)\\"><circle id=\\"Oval\\" fill=\\"#008800\\" cx=\\"17\\" cy=\\"17\\" r=\\"17\\"></circle><path d=\\"M14.5,24.5 L7,24.5 L7,22 L7.625,22 C9.00571187,22 10.125,20.8807119 10.125,19.5 L10.125,13.25 C10.125,10.4885763 12.3635763,8.25 15.125,8.25 L15.75,8.25 C15.75,7.55964406 16.3096441,7 17,7 C17.6903559,7 18.25,7.55964406 18.25,8.25 L18.875,8.25 C21.6364237,8.25 23.875,10.4885763 23.875,13.25 L23.875,19.5 C23.875,20.8807119 24.9942881,22 26.375,22 L27,22 L27,24.5 L19.5,24.5 C19.5,25.8807119 18.3807119,27 17,27 C15.6192881,27 14.5,25.8807119 14.5,24.5 Z M15.75,24.5 C15.75,25.1903559 16.3096441,25.75 17,25.75 C17.6903559,25.75 18.25,25.1903559 18.25,24.5 L15.75,24.5 Z M12.625,13.25 L12.625,19.5 C12.625,20.4107179 12.3815143,21.2645666 11.956089,22 L22.043911,22 C21.6184857,21.2645666 21.375,20.4107179 21.375,19.5 L21.375,13.25 C21.375,11.8692881 20.2557119,10.75 18.875,10.75 L15.125,10.75 C13.7442881,10.75 12.625,11.8692881 12.625,13.25 Z\\" id=\\"Shape\\" fill=\\"#000000\\" fill-rule=\\"nonzero\\"></path></g></g></g></svg>","width":34,"height":34}',
      color: 'black',
      backgroundColor: '#008800'
    });

    let status2 = await db.Status.create({
      projectId: 2,
      name: 'closed',
      seqnr: 100,
      label: 'Gesloten',
      mapIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"39\\" height=\\"50\\" viewBox=\\"0 0 39 50\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path d=\\"M19.1038 0C29.6577 0 38.2075 8.46671 38.2075 18.9181C38.2075 33.1786 21.7544 47.7273 21.0432 48.3035L19.1038 50L17.1643 48.3035C16.4532 47.7273 0 33.1786 0 18.9181C0 8.46831 8.54983 0 19.1038 0ZM32.3245 18.9181C32.3083 11.6837 26.4091 5.84187 19.1038 5.82586C11.7984 5.84187 5.89922 11.6837 5.88306 18.9181C5.88306 27.3367 14.1581 37.2439 19.0876 42.1095C23.1767 38.1242 32.3245 27.993 32.3245 18.9181Z\\" fill=\\"red\\"></path><path d=\\"M19.104 5.82568C26.4093 5.84169 32.3086 11.6836 32.3247 18.9179C32.3247 27.9928 23.1769 38.124 19.0879 42.1093C14.1584 37.2437 5.8833 27.3366 5.8833 18.9179C5.89946 11.6836 11.7987 5.84169 19.104 5.82568ZM25.5689 18.9179C25.5689 15.3807 22.6759 12.5158 19.104 12.5158C15.5322 12.5158 12.6391 15.3807 12.6391 18.9179C12.6391 22.455 15.5322 25.3199 19.104 25.3199C22.6759 25.3199 25.5689 22.455 25.5689 18.9179Z\\" fill=\\"white\\"></path><path d=\\"M19.1038 25.3202C22.6743 25.3202 25.5687 22.4539 25.5687 18.9182C25.5687 15.3824 22.6743 12.5161 19.1038 12.5161C15.5333 12.5161 12.6389 15.3824 12.6389 18.9182C12.6389 22.4539 15.5333 25.3202 19.1038 25.3202Z\\" fill=\\"green\\"></path></svg>","width":34,"height":45,"anchor":[17,45]}',
      listIcon: '{"html":"<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><svg width=\\"34px\\" height=\\"34px\\" viewBox=\\"0 0 34 34\\" version=\\"1.1\\" xmlns=\\"http://www.w3.org/2000/svg\\" xmlns:xlink=\\"http://www.w3.org/1999/xlink\\"><title>melding-lijst-icon</title><g id=\\"Stijlen-en-interacties\\" stroke=\\"none\\" stroke-width=\\"1\\" fill=\\"none\\" fill-rule=\\"evenodd\\"><g id=\\"Icons\\" transform=\\"translate(-1250.000000, -217.000000)\\"><g id=\\"Group-3-Copy\\" transform=\\"translate(1250.000000, 216.000000)\\"></g><g id=\\"melding-lijst-icon\\" transform=\\"translate(1250.000000, 217.000000)\\"><circle id=\\"Oval\\" fill=\\"#880000\\" cx=\\"17\\" cy=\\"17\\" r=\\"17\\"></circle><path d=\\"M14.5,24.5 L7,24.5 L7,22 L7.625,22 C9.00571187,22 10.125,20.8807119 10.125,19.5 L10.125,13.25 C10.125,10.4885763 12.3635763,8.25 15.125,8.25 L15.75,8.25 C15.75,7.55964406 16.3096441,7 17,7 C17.6903559,7 18.25,7.55964406 18.25,8.25 L18.875,8.25 C21.6364237,8.25 23.875,10.4885763 23.875,13.25 L23.875,19.5 C23.875,20.8807119 24.9942881,22 26.375,22 L27,22 L27,24.5 L19.5,24.5 C19.5,25.8807119 18.3807119,27 17,27 C15.6192881,27 14.5,25.8807119 14.5,24.5 Z M15.75,24.5 C15.75,25.1903559 16.3096441,25.75 17,25.75 C17.6903559,25.75 18.25,25.1903559 18.25,24.5 L15.75,24.5 Z M12.625,13.25 L12.625,19.5 C12.625,20.4107179 12.3815143,21.2645666 11.956089,22 L22.043911,22 C21.6184857,21.2645666 21.375,20.4107179 21.375,19.5 L21.375,13.25 C21.375,11.8692881 20.2557119,10.75 18.875,10.75 L15.125,10.75 C13.7442881,10.75 12.625,11.8692881 12.625,13.25 Z\\" id=\\"Shape\\" fill=\\"#000000\\" fill-rule=\\"nonzero\\"></path></g></g></g></svg>","width":34,"height":34}',
      color: 'black',
      backgroundColor: '#880000',
      extraFunctionality: {
        editableByUser: false,
        canComment: false,
      }
    });

    resource1.addStatus(status1);
    resource2.addStatus(status1);
    resource3.addStatus(status2);
    resource4.addStatus(status1);
    resource5.addStatus(status1);

    
    let status3 = await db.Status.findOne({
      where: { projectId: 3, name: 'open' }
    });
    await status3.update({
      addToNewResources: true,
    });

    resource6.addStatus(status3);
    resource7.addStatus(status3);
    resource8.addStatus(status3);
    resource9.addStatus(status3);
    resource10.addStatus(status3);

    console.log('      with 5 likes');
    await db.Vote.create({
      userId: 1,
      resourceId: 1,
      opinion: 'no',
    });

    await db.Vote.create({
      userId: 2,
      resourceId: 1,
      opinion: 'yes',
    });
 	  
    await db.Vote.create({
      userId: 3,
      resourceId: 1,
      opinion: 'yes',
    });
 	  
    await db.Vote.create({
      userId: 2,
      resourceId: 2,
      opinion: 'yes',
    });

    await db.Vote.create({
      userId: 3,
      resourceId: 2,
      opinion: 'no',
    });

    console.log('    6 comments');

    await db.Comment.create({
      userId: 2,
      resourceId: 1,
      description: 'In id vestibulum leo. Integer a justo quis est porttitor auctor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Pellentesque porta laoreet scelerisque. Etiam laoreet ultrices est, vitae malesuada magna tempor eu.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 2,
      resourceId: 1,
      parentId: 1,
      sentiment: 'for',
      description: 'Sed egestas sapien nec tristique cursus. Nunc euismod tempus nisl, sit amet malesuada velit. Vivamus nec nulla eleifend, congue dolor quis, dignissim est. Maecenas rhoncus tellus et augue efficitur tincidunt. Ut euismod libero vel lorem semper.',
    });

    await db.Comment.create({
      userId: 3,
      resourceId: 1,
      description: 'Aliquam tincidunt enim et arcu dictum, mollis consequat ligula feugiat. Cras vel imperdiet eros. Nulla finibus sed metus a mattis. Aenean lobortis fringilla felis id congue. Cras lacus justo, imperdiet in tellus vitae, volutpat pretium dolor.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 3,
      resourceId: 1,
      description: 'Curabitur vestibulum ex sem, in tempor mi ullamcorper vitae. Aenean dui magna, auctor in eleifend nec, elementum quis massa. Etiam quis eros sapien. Mauris ornare mi ut justo pretium, quis mollis sapien pulvinar. Maecenas feugiat sapien.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 2,
      resourceId: 2,
      description: 'Mauris a vestibulum justo, a mattis purus. Phasellus auctor eros vitae augue dictum aliquam. Pellentesque quis pulvinar est, sed congue metus. Morbi volutpat velit libero, ac condimentum justo egestas ac. Integer eu sollicitudin mauris. Curabitur sed.',
      sentiment: 'for',
    });

    await db.Comment.create({
      userId: 2,
      resourceId: 1,
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

    console.log('    five widgets');
    await db.Widget.create({
      projectId: 2,
      type: 'likes',
      description: 'Likes op plannen',
      config: {"title":"Likes op plannen","variant":"medium","yesLabel":"Is goed","noLabel":"Liever niet","hideCounters":false},
    });

    await db.Widget.create({
      projectId: 2,
      type: 'resourceoverview',
      description: 'Plannen overzicht',
      config: {"displaySorting":true,"defaultSorting":"createdAt_desc","sorting":[{"value":"createdAt_desc","label":"Nieuwste eerst"},{"value":"createdAt_asc","label":"Oudste eerst"}],"displaySearch":true,"displaySearchText":false,"textActiveSearch":"Je ziet hier zoekresultaten voor [zoekterm]","tagGroups":[{"type":"theme","multiple":true,"label":"Thema"},{"type":"area","multiple":true,"label":"Gebied"}],"displayTagFilters":true,"displayTagGroupName":false,"displayBanner":true,"titleMaxLength":"100","descriptionMaxLength":"100","summaryMaxLength":"100","displayTitle":true,"displayDescription":false,"displaySummary":true,"displayArguments":true,"displayVote":true,"itemLink":"/plan?osid=[id]","resourceType":"resource","displayType":"cardrow","rawInput":"","projectId":"2"},
    });

    await db.Widget.create({
      projectId: 2,
      type: 'resourcedetail',
      description: 'Plan detail',
      config: {"displayImage":true,"displayUser":true,"displayBudget":true,"displayDescription":true,"displayTitle":true,"displayDate":true,"displaySummary":true,"displayLocation":true,"displayBudgetDocuments":false,"projectId":"2","resourceIdRelativePath":"/plan?osid=[id]","commentsWidget":{"useSentiments":["for","against"]}},
    });

    await db.Widget.create({
      projectId: 2,
      type: 'resourcesmap',
      description: 'Kaart met plannen',
      config: {},
    });

    await db.Widget.create({
      projectId: 3,
      type: 'begrootmodule',
      description: 'Begroot widget',
      config: {"displayPriceLabel":true,"showVoteCount":true,"originalResourceUrl":"http://a.bc","displayRanking":false,"notEnoughBudgetText":"Niet genoeg budget","showOriginalResource":false,"displaySearch":true,"displaySearchText":true,"textActiveSearch":"Je ziet hier zoekresultaten voor [zoekterm]","displayTagFilters":false},
    });

    console.log('    a choices-guide');
    await db.ChoicesGuide.create({
      projectId: 2,
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
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.01.jpg` } ],
      type: 'a-to-b',
      dimensions: '["x"]',
      values: `{ "A": { "questionImage": [ "${process.env.IMAGE_APP_URL}/image/forum.romanum.04.jpg" ], "questionText": "Ik vind dat de gemeente verantwoordelijk is voor het verduurzamen van Amsterdam. ", "label": "AA", "labelAbove": "AAAA", "labelBelow": "Weinig" }, "B": { "questionImage": [ "https://image.openstad.amsterdam.nl/image/2bf220c6ff23dd524c78a49eb68aa7cb" ], "questionText": "De Amsterdammers moeten zelf kunnen bepalen hoe we samen een duurzame en gezonde stad worden. De gemeente moet het mogelijk maken.", "label": "BB", "labelBbove": "B", "labelBelow": "Veel", "labelAbove": "BBBB" } }`,
      seqnr: 20,
    });

    await db.ChoicesGuideQuestion.create({
      questionGroupId: 1,
      title: 'Vraag 3',
      description: 'Wat is je favoriete hoek van een vierkant',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.02.jpg` } ],
      type: 'enum-radio',
      dimensions: '["x","y"]',
      values: '[ { "text": "Linksboven", "value": { "x": "0", "y": "0" } }, { "text": "Linksonder", "value": { "x": 0, "y": 100 } }, { "text": "Rechtsboven", "value": { "x": 100, "y": 0 } }, { "text": "Rechtsonder", "value": { "x": 100, "y": 100 } } ]',
      seqnr: 30,
    });

    await db.ChoicesGuideQuestion.create({
      questionGroupId: 1,
      title: 'Vraag 23',
      description: 'Is het leuk om deze vraag te beantwoorden?',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/zand.03.j` } ],
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
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.01.jpg` } ],
      answers: '{ "35": { "x": 0, "y": 0 }, "36": { "x": "0", "y": 0 }, "37": { "x": 0, "y": 0 } }', 
      seqnr: 10,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'Rechts Boven',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.02.jpg` } ],
      answers: '{ "35": { "x": 100, "y": 0 }, "36": { "x": 100, "y": 0 }, "37": { "x": 100, "y": 0 } }', 
      seqnr: 20,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'links onder',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.03.jpg` } ],
      answers: '{ "35": { "x": 0, "y": 100 }, "36": { "x": 0, "y": 100 }, "37": { "x": 0, "y": 100 } }', 
      seqnr: 30,
    });

    await db.ChoicesGuideChoice.create({
      questionGroupId: 1,
      title: 'rechts onder',
      images: [ { url: `${process.env.IMAGE_APP_URL}/image/forum.romanum.04.jpg` } ],
      answers: '{ "35": { "x": 100, "y": 100 }, "36": { "x": 100, "y": 100 }, "37": { "x": 100, "y": 100 } }', 
      seqnr: 40,
    });  

  } catch(err) {
    console.log(err);
  }
  
}








