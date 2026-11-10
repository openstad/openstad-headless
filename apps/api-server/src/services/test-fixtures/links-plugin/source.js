const items = [{ id: 'a1', label: 'Fixture item', group: 'Fixture' }];

module.exports = {
  async search() {
    return items;
  },
  async get({ ids }) {
    return items.filter((item) => ids.includes(item.id));
  },
};
