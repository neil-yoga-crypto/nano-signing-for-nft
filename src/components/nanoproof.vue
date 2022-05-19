<script lang="ts">
import * as nanocurrency from 'nanocurrency';
import { tools } from 'nanocurrency-web';

import { verify } from '../lib/verify-nano-seed-ed25519';
import { toHex,toU8Array } from '../lib/tools';
import { defineComponent } from "vue";

function generateToken(timestamp,algo,publicKeyHex, signatureHex) {
    return timestamp + '.' + algo + '.' + publicKeyHex.toLowerCase() + '.' + signatureHex;
}

export default defineComponent({
    methods: {
        async createWallet() {
            const seed = await nanocurrency.generateSeed();
            const secretKey = await nanocurrency.deriveSecretKey(seed, 0);
            const publicKey = await nanocurrency.derivePublicKey(secretKey);
            const address = await nanocurrency.deriveAddress(publicKey);
            const wallet = {seed:seed,secretKey:secretKey,publicKey:publicKey,address:address.replace('xrb_','nano_')};
            console.log(wallet);
            localStorage.setItem('wallet',JSON.stringify(wallet));
            return new Promise((resolve)=>resolve(wallet));

        },
    },
    watch: {
        async challenge(newValue,o){
            let domain = newValue;
            let algorithm = 'ed25519-blake2'; // algorithm identifier
            let serverTime = +new Date(); // timestamp, ex. from GET/use UTC
            let publicKeyHex = JSON.parse(localStorage.getItem('wallet')).publicKey;
            let privateKeyHex = JSON.parse(localStorage.getItem('wallet')).secretKey;
            let challengeStr = (serverTime + domain);
            let privateKey = toU8Array(privateKeyHex);
            let signatureHex = tools.sign(privateKeyHex, challengeStr); 
            let token = generateToken(serverTime,algorithm,publicKeyHex, signatureHex);
            this.$data.response = token;
            console.log("token", token);
        },
        async verifyChallenge(newValue,o){
            let token = newValue;
            let domain = this.$data.challenge;
            this.$data.pubKeyFromToken = tools.publicKeyToAddress(token.split('.')[2]);
            let valid = verify(domain, token);
            console.log("valid", valid);
            this.$data.verified = valid.verify;
        }
    },
    data() {
        return { wallet:localStorage.getItem('wallet'), 'challenge':'?','response':'?','verifyChallenge':'?','verified':false,'pubKeyFromToken':''};
    },
    async mounted() {
        if(!localStorage.getItem('wallet')) {
            this.$data.wallet = await this.createWallet();
        }
    }
});
</script>

<template>
    <h3 style="color:#ddd">Enter Proof of Ownership Challenge</h3>
    <textarea v-model="challenge"></textarea>
    <h3 style="color:#ddd">Signed Version</h3>
    <b style="cursor: pointer; background: rgb(32, 156, 233) none repeat scroll 0% 0%; margin: 16px 4px 4px; padding: 16px 24px; border-radius: 5px; color: white; display: block; word-break: break-all;">
    {{response}}
    </b>

    <h3 style="color:#ddd">Verify Challenge ({{verified}})</h3>
    <p style="color:white;">Copy signed reponse in the box below to verify (should turn green)</p>
    <textarea style="background:#db3d2d;" :class="{'verified':verified===true}" v-model="verifyChallenge"></textarea>
    <p style="color:white;" v-if="verified && pubKeyFromToken">Nano Address: {{pubKeyFromToken}}</p>

    <h3 style="color:#ddd;margin-top:120px;">Generated Wallet (localStorage)</h3>
    <b

    style="cursor:pointer;background: rgb(32, 156, 233) none repeat scroll 0% 0%; margin: 16px 4px 4px; padding: 16px 24px; border-radius: 5px; color: white; display: block; word-break: break-all;">{{wallet}}</b>

</template>

<style>
.verified {
    background:green!important;
}
</style>
