import nacl from 'tweetnacl';
import * as convert from './tools';
import { tools } from 'nanocurrency-web';


function verifyfn(domain,token) {
    let pieces = token.split('.'); //[0]=timestamp, [1]=algo, [2]=publicKeyHex, [3]=signatureHex
    let maxDistanceInSeconds = 90; // tokens are valid for 1.5 minute
    let serverTimeNow = +new Date();
    let validToken = verifyTimestamp(pieces[0],serverTimeNow, maxDistanceInSeconds);
    if(!validToken) return {"verify":false,"error":"Token expired"};

    let challengeStr = (pieces[0] + domain);
    let publicKeyHex = pieces[2];
    let publicKey = convert.toU8Array(publicKeyHex);
    let signatureHex = pieces[3];

    const validSignature = tools.verify(publicKeyHex, signatureHex, challengeStr);
    return {"verify":validSignature};
}

// super simple timestamp expiration verifier
function verifyTimestamp(timestamp, timestamp2, maxDistanceInSeconds) {
    let distance = (timestamp/1000)-(timestamp2/1000); // division by 1000 to convert epoch to seconds
    if(distance < 0) {
        distance = distance * -1; // make it positive 
    }
  
    return distance < maxDistanceInSeconds;
}

export function verify(domain,token){
    return verifyfn(domain,token);
}
