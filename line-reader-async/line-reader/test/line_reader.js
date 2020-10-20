import { eachLine, open } from '../lib/line_reader';
import { equal, ok } from 'assert';
import { createReadStream } from 'fs';
var testFilePath = __dirname + '/data/normal_file.txt';
var windowsFilePath = __dirname + '/data/windows_file.txt';
var windowsBufferOverlapFilePath = __dirname + '/data/windows_buffer_overlap_file.txt';
var unixFilePath = __dirname + '/data/unix_file.txt';
var macOs9FilePath = __dirname + '/data/mac_os_9_file.txt';
var separatorFilePath = __dirname + '/data/separator_file.txt';
var multiSeparatorFilePath = __dirname + '/data/multi_separator_file.txt';
var multibyteFilePath = __dirname + '/data/multibyte_file.txt';
var emptyFilePath = __dirname + '/data/empty_file.txt';
var oneLineFilePath = __dirname + '/data/one_line_file.txt';
var oneLineFileNoEndlinePath = __dirname + '/data/one_line_file_no_endline.txt';
var threeLineFilePath = __dirname + '/data/three_line_file.txt';
var testSeparatorFile = ['foo', 'bar\n', 'baz\n'];
var testFile = [
  'Jabberwocky',
  '',
  '’Twas brillig, and the slithy toves',
  'Did gyre and gimble in the wabe;',
  '',
  ''
];
var testBufferOverlapFile = [
  'test',
  'file'
];

describe("lineReader", function() {
  describe("eachLine", function() {
    it("should read lines using the default separator", function(done) {
      var i = 0;

      eachLine(testFilePath, function(line, last) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(6, i);
        done();
      });
    });

    it("should read windows files by default", function(done) {
      var i = 0;

      eachLine(windowsFilePath, function(line, last) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(6, i);
        done();
      });
    });

    it("should handle \\r\\n overlapping buffer window correctly", function(done) {
      var i = 0;
      var bufferSize = 5;

      eachLine(windowsBufferOverlapFilePath, {bufferSize: bufferSize}, function(line, last) {
        equal(testBufferOverlapFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 2) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(2, i);
        done();
      });
    });

    it("should read unix files by default", function(done) {
      var i = 0;

      eachLine(unixFilePath, function(line, last) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(6, i);
        done();
      });
    });

    it("should read mac os 9 files by default", function(done) {
      var i = 0;

      eachLine(macOs9FilePath, function(line, last) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(6, i);
        done();
      });
    });

    it("should allow continuation of line reading via a callback", function(done) {
      var i = 0;

      eachLine(testFilePath, function(line, last, cb) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 6) {
          ok(last);
        } else {
          ok(!last);
        }

        process.nextTick(cb);
      }, function(err) {
        ok(!err);
        equal(6, i);
        done();
      });
    });

    it("should separate files using given separator", function(done) {
      var i = 0;
      eachLine(separatorFilePath, {separator: ';'}, function(line, last) {
        equal(testSeparatorFile[i], line);
        i += 1;
      
        if (i === 3) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(3, i);
        done();
      });
    });

    it("should separate files using given separator with more than one character", function(done) {
      var i = 0;
      eachLine(multiSeparatorFilePath, {separator: '||'}, function(line, last) {
        equal(testSeparatorFile[i], line);
        i += 1;
      
        if (i === 3) {
          ok(last);
        } else {
          ok(!last);
        }
      }, function(err) {
        ok(!err);
        equal(3, i);
        done();
      });
    });

    it("should allow early termination of line reading", function(done) {
      var i = 0;
      eachLine(testFilePath, function(line, last) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 2) {
          return false;
        }
      }, function(err) {
        ok(!err);
        equal(2, i);
        done();
      });
    });

    it("should allow early termination of line reading via a callback", function(done) {
      var i = 0;
      eachLine(testFilePath, function(line, last, cb) {
        equal(testFile[i], line, 'Each line should be what we expect');
        i += 1;

        if (i === 2) {
          cb(false);
        } else {
          cb();
        }

      }, function(err) {
        ok(!err);
        equal(2, i);
        done();
      });
    });

    it("should not call callback on empty file", function(done) {
      eachLine(emptyFilePath, function(line) {
        ok(false, "Empty file should not cause any callbacks");
      }, function(err) {
        ok(!err);
        done()
      });
    });

    it("should error when the user tries calls nextLine on a closed LineReader", function(done) {
      open(oneLineFilePath, function(err, reader) {
        ok(!err);
        reader.close(function(err) {
          ok(!err);
          reader.nextLine(function(err, line) {
            ok(err, "nextLine should have errored because the reader is closed");
            done();
          });
        });
      });
    });

    it("should work with a file containing only one line", function(done) {
      eachLine(oneLineFilePath, function(line, last) {
        return true;
      }, function(err) {
        ok(!err);
        done();
      });
    });

    it("should work with a file containing only one line and no endline character.", function(done) {
      var count = 0; var isDone = false;
      eachLine(oneLineFileNoEndlinePath, function(line, last) {
        equal(last, true, 'last should be true');
        return true;
      }, function(err) {
        ok(!err);
        done();
      });
    });

    it("should close the file when eachLine finishes", function(done) {
      var reader;
      eachLine(oneLineFilePath, function(line, last) {
        return false;
      }, function(err) {
        ok(!err);
        ok(reader.isClosed());
        done();
      }).getReader(function(_reader) {
        reader = _reader;
      });
    });

    it("should close the file if there is an error during eachLine", function(done) {
      eachLine(testFilePath, {bufferSize: 10}, function(line, last) {
      }, function(err) {
        equal('a test error', err.message);
        ok(reader.isClosed());
        done();
      }).getReader(function(_reader) {
        reader = _reader;

        reader.getReadStream().read = function() {
          throw new Error('a test error');
        };
      });
    });
  });

  describe("open", function() {
    it("should return a reader object and allow calls to nextLine", function(done) {
      open(testFilePath, function(err, reader) {
        ok(!err);
        ok(reader.hasNextLine());
      
        ok(reader.hasNextLine(), 'Calling hasNextLine multiple times should be ok');
      
        reader.nextLine(function(err, line) {
          ok(!err);
          equal('Jabberwocky', line);
          ok(reader.hasNextLine());
          reader.nextLine(function(err, line) {
            ok(!err);
            equal('', line);
            ok(reader.hasNextLine());
            reader.nextLine(function(err, line) {
              ok(!err);
              equal('’Twas brillig, and the slithy toves', line);
              ok(reader.hasNextLine());
              reader.nextLine(function(err, line) {
                ok(!err);
                equal('Did gyre and gimble in the wabe;', line);
                ok(reader.hasNextLine());
                reader.nextLine(function(err, line) {
                  ok(!err);
                  equal('', line);
                  ok(reader.hasNextLine());
                  reader.nextLine(function(err, line) {
                    ok(!err);
                    equal('', line);
                    ok(!reader.hasNextLine());
                    reader.nextLine(function(err, line) {
                      ok(err);
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    it("should work with a file containing only one line", function(done) {
      open(oneLineFilePath, function(err, reader) {
        ok(!err);
        reader.close(function(err) {
          ok(!err);
          done();
        });
      });
    });

    it("should read multibyte characters on the buffer boundary", function(done) {
      open(multibyteFilePath, {separator: '\n', encoding: 'utf8', bufferSize: 2}, function(err, reader) {
        ok(!err);
        ok(reader.hasNextLine());
        reader.nextLine(function(err, line) {
          ok(!err);
          equal('ふうりうの初やおくの田植うた', line,
                       "Should read multibyte characters on buffer boundary");
          reader.close(function(err) {
            ok(!err);
            done();
          });
        });
      });
    });

    it("should support opened streams", function() {
      var readStream = createReadStream(testFilePath);

      open(readStream, function(err, reader) {
        ok(!err);
        ok(reader.hasNextLine());
      
        ok(reader.hasNextLine(), 'Calling hasNextLine multiple times should be ok');
      
        reader.nextLine(function(err, line) {
          ok(!err);
          equal('Jabberwocky', line);
        });
      });
    });

    it("should handle error while opening read stream", function() {
      open('a file that does not exist', function(err, reader) {
        ok(err);
        ok(reader.isClosed());
      });
    });

    describe("hasNextLine", function() {
      it("should return true when buffer is empty but not at EOF", function(done) {
        open(threeLineFilePath, {separator: '\n', encoding: 'utf8', bufferSize: 36}, function(err, reader) {
          ok(!err);
          reader.nextLine(function(err, line) {
            ok(!err);
            equal("This is line one.", line);
            ok(reader.hasNextLine());
            reader.nextLine(function(err, line) {
              ok(!err);
              equal("This is line two.", line);
              ok(reader.hasNextLine());
              reader.nextLine(function(err, line) {
                ok(!err);
                equal("This is line three.", line);
                ok(!reader.hasNextLine());
                reader.close(function(err) {
                  ok(!err);
                  done();
                })
              });
            });
          });
        });
      });
    });
  });
});
