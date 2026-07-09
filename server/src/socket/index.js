let ioInstance = null;

module.exports = {
  getIO: () => ioInstance,
  setIO: (io) => { ioInstance = io; },
};
