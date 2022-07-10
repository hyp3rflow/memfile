export interface MemFile
  extends Deno.Reader,
    Deno.ReaderSync,
    Deno.Writer,
    Deno.WriterSync,
    Deno.Seeker,
    Deno.SeekerSync,
    Deno.Closer {
  stat(): Promise<Deno.FileInfo>;
  statSync(): Deno.FileInfo;
}

export function createMemFile(base: Uint8Array): MemFile {
  let pos = 0;
  const memfile: MemFile = {
    read(p) {
      return Promise.resolve(memfile.readSync(p));
    },
    readSync(p) {
      p.set(base.subarray(pos, (pos += p.byteLength)));
      return p.length;
    },
    write(p) {
      return Promise.resolve(memfile.writeSync(p));
    },
    writeSync(p) {
      base.set(p, pos);
      pos += p.byteLength;
      return p.length;
    },
    seek(offset, whence) {
      return Promise.resolve(memfile.seekSync(offset, whence));
    },
    seekSync(offset, whence) {
      let next = pos;
      switch (whence) {
        case Deno.SeekMode.Start:
          next = offset;
          break;
        case Deno.SeekMode.Current:
          next += offset;
          break;
        case Deno.SeekMode.End:
          next = offset + base.length;
          break;
      }
      return (pos = next);
    },
    stat() {
      return Promise.resolve(memfile.statSync());
    },
    statSync() {
      return {
        isFile: true,
        isDirectory: false,
        isSymlink: false,
        size: base.length,
        atime: null,
        mtime: null,
        birthtime: null,
        dev: null,
        ino: null,
        mode: null,
        nlink: null,
        uid: null,
        gid: null,
        rdev: null,
        blksize: null,
        blocks: null,
      };
    },
    close() {},
  };
  return memfile;
}
