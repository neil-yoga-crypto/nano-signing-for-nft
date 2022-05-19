function toU8Arrayfn(hexStr) {
    const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return fromHexString(hexStr);
}


function toHexfn(strOrU8Array) { // buffer is an ArrayBuffer
    let U8Array;
    if (typeof strOrU8Array === 'string' || strOrU8Array instanceof String)
        U8Array = Uint8Array.from(Array.from(strOrU8Array).map(letter => letter.charCodeAt(0)));
    else {
        U8Array = strOrU8Array; 
    }

    let buffer = U8Array.buffer;
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}


export function toU8Array(hexStr){
    return toU8Arrayfn(hexStr);
}

export function toHex(bufferOrStr){
    return toHexfn(bufferOrStr);
}

