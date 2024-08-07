module.exports = {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: process.env.EXPRESS_SECRET
    }
  },
  methods: (self) => {
    return {
      /**
       * In order to run multiple instances, we have to overwrite the listen function of
       * ApostropheCMS V3. It will otherwise run a listen command to express and this will cause an error
       * since our top level is managing express
       */
      async listen() {
      }
    };
  }
};
