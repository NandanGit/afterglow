// Binary plist encoder for macOS Terminal.app theme files

export class PlistUID {
  readonly value: number;
  constructor(value: number) {
    this.value = value;
  }
}

export class PlistFloat {
  readonly value: number;
  constructor(value: number) {
    this.value = value;
  }
}

export type PlistValue =
  | null
  | boolean
  | number
  | string
  | Uint8Array
  | PlistUID
  | PlistFloat
  | PlistValue[]
  | { [key: string]: PlistValue };

// --- Binary plist encoder ---

function flatten(root: PlistValue): PlistValue[] {
  const objects: PlistValue[] = [];
  const seen = new Map<PlistValue, number>();

  function visit(val: PlistValue): number {
    if (val !== null && typeof val === 'object' && !(val instanceof Uint8Array) && !(val instanceof PlistUID) && !(val instanceof PlistFloat)) {
      if (seen.has(val)) return seen.get(val)!;
    }
    const idx = objects.length;
    objects.push(val);
    if (val !== null && typeof val === 'object' && !(val instanceof Uint8Array) && !(val instanceof PlistUID) && !(val instanceof PlistFloat)) {
      seen.set(val, idx);
    }

    if (Array.isArray(val)) {
      for (const item of val) visit(item);
    } else if (val !== null && typeof val === 'object' && !(val instanceof Uint8Array) && !(val instanceof PlistUID) && !(val instanceof PlistFloat)) {
      const dict = val as { [key: string]: PlistValue };
      for (const key of Object.keys(dict)) {
        visit(key);
        visit(dict[key]);
      }
    }
    return idx;
  }

  visit(root);
  return objects;
}

function encodeInt(value: number, byteCount: number): Uint8Array {
  const buf = new Uint8Array(byteCount);
  for (let i = byteCount - 1; i >= 0; i--) {
    buf[i] = value & 0xff;
    value = Math.floor(value / 256);
  }
  return buf;
}

function intBytes(value: number): number {
  if (value < 0x100) return 1;
  if (value < 0x10000) return 2;
  return 4;
}

function refSize(objectCount: number): number {
  if (objectCount < 0x100) return 1;
  if (objectCount < 0x10000) return 2;
  return 4;
}

export function encodeBinaryPlist(root: PlistValue): Uint8Array {
  const objects = flatten(root);
  const objectCount = objects.length;
  const objRefSize = refSize(objectCount);
  const offsetMap = new Map<PlistValue, number>();

  // Build object index map
  for (let i = 0; i < objects.length; i++) {
    if (!offsetMap.has(objects[i])) {
      offsetMap.set(objects[i], i);
    }
  }

  function getRef(val: PlistValue): number {
    // For primitives we need to find by index
    for (let i = 0; i < objects.length; i++) {
      if (objects[i] === val) return i;
    }
    return 0;
  }

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 8; // "bplist00" header

  // Header
  chunks.push(new TextEncoder().encode('bplist00'));

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    const encoded = encodeObject(objects[i], objRefSize, getRef);
    chunks.push(encoded);
    currentOffset += encoded.length;
  }

  // Offset table
  const offsetTableOffset = currentOffset;
  const offsetSize = intBytes(currentOffset);
  for (const off of offsets) {
    const buf = encodeInt(off, offsetSize);
    chunks.push(buf);
    currentOffset += buf.length;
  }

  // Trailer (32 bytes)
  const trailer = new Uint8Array(32);
  trailer[6] = offsetSize;
  trailer[7] = objRefSize;
  // Object count (8 bytes at offset 8)
  const objCountBuf = encodeInt(objectCount, 8);
  trailer.set(objCountBuf, 8);
  // Top object (8 bytes at offset 16) = 0
  // Offset table offset (8 bytes at offset 24)
  const offTableBuf = encodeInt(offsetTableOffset, 8);
  trailer.set(offTableBuf, 24);
  chunks.push(trailer);

  // Concatenate all chunks
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

function encodeObject(val: PlistValue, objRefSize: number, getRef: (v: PlistValue) => number): Uint8Array {
  if (val === null) {
    return new Uint8Array([0x00]);
  }
  if (typeof val === 'boolean') {
    return new Uint8Array([val ? 0x09 : 0x08]);
  }
  if (val instanceof PlistUID) {
    const bytes = intBytes(val.value);
    const header = 0x80 | (bytes - 1);
    const buf = new Uint8Array(1 + bytes);
    buf[0] = header;
    buf.set(encodeInt(val.value, bytes), 1);
    return buf;
  }
  if (val instanceof PlistFloat) {
    // 8-byte double
    const buf = new Uint8Array(9);
    buf[0] = 0x23; // float, 2^3 = 8 bytes
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    dv.setFloat64(1, val.value, false); // big-endian
    return buf;
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val) && val >= 0) {
      const bytes = intBytes(val);
      const sizeExp = bytes === 1 ? 0 : bytes === 2 ? 1 : 2;
      const buf = new Uint8Array(1 + bytes);
      buf[0] = 0x10 | sizeExp;
      buf.set(encodeInt(val, bytes), 1);
      return buf;
    }
    // Negative or non-integer → float
    const buf = new Uint8Array(9);
    buf[0] = 0x23;
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    dv.setFloat64(1, val, false);
    return buf;
  }
  if (typeof val === 'string') {
    const encoded = new TextEncoder().encode(val);
    const header = makeSizeHeader(0x50, encoded.length);
    const buf = new Uint8Array(header.length + encoded.length);
    buf.set(header);
    buf.set(encoded, header.length);
    return buf;
  }
  if (val instanceof Uint8Array) {
    const header = makeSizeHeader(0x40, val.length);
    const buf = new Uint8Array(header.length + val.length);
    buf.set(header);
    buf.set(val, header.length);
    return buf;
  }
  if (Array.isArray(val)) {
    const header = makeSizeHeader(0xa0, val.length);
    const buf = new Uint8Array(header.length + val.length * objRefSize);
    buf.set(header);
    let pos = header.length;
    for (const item of val) {
      buf.set(encodeInt(getRef(item), objRefSize), pos);
      pos += objRefSize;
    }
    return buf;
  }
  // Dict
  const dict = val as { [key: string]: PlistValue };
  const keys = Object.keys(dict);
  const header = makeSizeHeader(0xd0, keys.length);
  const buf = new Uint8Array(header.length + keys.length * objRefSize * 2);
  buf.set(header);
  let pos = header.length;
  for (const key of keys) {
    buf.set(encodeInt(getRef(key), objRefSize), pos);
    pos += objRefSize;
  }
  for (const key of keys) {
    buf.set(encodeInt(getRef(dict[key]), objRefSize), pos);
    pos += objRefSize;
  }
  return buf;
}

function makeSizeHeader(typeNibble: number, size: number): Uint8Array {
  if (size < 15) {
    return new Uint8Array([typeNibble | size]);
  }
  // Extended size: type nibble | 0x0f, then int encoding of size
  const sizeBytes = intBytes(size);
  const sizeExp = sizeBytes === 1 ? 0 : sizeBytes === 2 ? 1 : 2;
  const header = new Uint8Array(2 + sizeBytes);
  header[0] = typeNibble | 0x0f;
  header[1] = 0x10 | sizeExp;
  header.set(encodeInt(size, sizeBytes), 2);
  return header;
}

// --- NSColor encoder (NSKeyedArchiver) ---

function hexToRgbFloats(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export function encodeNSColor(hex: string): Uint8Array {
  const [r, g, b] = hexToRgbFloats(hex);
  const nsrgb = new TextEncoder().encode(`${r} ${g} ${b}`);

  const archive: PlistValue = {
    '$archiver': 'NSKeyedArchiver',
    '$version': 100000,
    '$top': { 'root': new PlistUID(1) },
    '$objects': [
      '$null',
      {
        '$class': new PlistUID(2),
        'NSRGB': nsrgb,
      },
      {
        '$classname': 'NSColor',
        '$classes': ['NSColor', 'NSObject'],
      },
    ],
  };

  return encodeBinaryPlist(archive);
}

// --- NSFont encoder (NSKeyedArchiver) ---

export function encodeNSFont(name: string, size: number): Uint8Array {
  const archive: PlistValue = {
    '$archiver': 'NSKeyedArchiver',
    '$version': 100000,
    '$top': { 'root': new PlistUID(1) },
    '$objects': [
      '$null',
      {
        '$class': new PlistUID(3),
        'NSName': new PlistUID(2),
        'NSSize': new PlistFloat(size),
        'NSfFlags': 16,
      },
      name,
      {
        '$classname': 'NSFont',
        '$classes': ['NSFont', 'NSObject'],
      },
    ],
  };

  return encodeBinaryPlist(archive);
}
