import sys
import hashlib


if len(sys.argv) < 2:
    print("Usage: {} <filename>".format(sys.argv[0]))
    sys.exit(1)

def md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

filename = sys.argv[1]
print("File: {}\nHash: {}".format(filename, md5(filename)))
