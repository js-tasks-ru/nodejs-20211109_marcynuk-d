const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.data = '';
  }

  _transform(chunk, encoding, callback) {
    const chunkStr = chunk.toString();
    const isSplitIncluded = chunkStr.match(os.EOL);

    if (isSplitIncluded) {
      const strArray = chunkStr.split(os.EOL);
      const lastItemIndex = strArray.length - 1;
      strArray.forEach((str, index) => {
        if (index < lastItemIndex) {
          this.push(this.data + str);
        } else {
          this.data = str;
        }
      });
      return callback(null);
    }
    this.data = this.data + chunkStr;
    callback(null);
  }

  _flush(callback) {
    if (this.data) {
      this.push(this.data);
    }
    this.data = '';
    callback(null);
  }
}

module.exports = LineSplitStream;
