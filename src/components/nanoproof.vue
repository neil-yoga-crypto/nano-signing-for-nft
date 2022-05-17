<script lang="ts">
import * as nanocurrency from 'nanocurrency';
import { tools } from 'nanocurrency-web'

import { defineComponent } from "vue";

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
        async verifyChallenge(newValue,o){
            console.log('TRIGGERE verifyChallange');
            const publicKey = JSON.parse(localStorage.getItem('wallet')).publicKey;
            const signature = newValue;
            const data = this.$data.challenge;
            const match = tools.verify(publicKey, signature, data);
            console.log({publicKey:publicKey,match:match});
            this.$data.verified = match;
        },
        async challenge(newValue,o){
            const privateKey = JSON.parse(localStorage.getItem('wallet')).secretKey;
            const signed = tools.sign(privateKey, newValue);
            console.log({signed:signed});
            this.$data.response = signed;
        }
    },

    
    data() {
        return { wallet:localStorage.getItem('wallet'), 'challenge':'?','response':'?','verifyChallenge':'?','verified':false};
    },
    async mounted() {
        if(!localStorage.getItem('wallet')) {
            this.$data.wallet = await this.createWallet();
        }
    },
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


<h3 style="color:#ddd;margin-top:120px;">Generated Wallet (localStorage)</h3>
<b

 style="cursor:pointer;background: rgb(32, 156, 233) none repeat scroll 0% 0%; margin: 16px 4px 4px; padding: 16px 24px; border-radius: 5px; color: white; display: block; word-break: break-all;">{{wallet}}</b>

</template>


<style>
.verified {
    background:green!important;
}
.simpleSuccessPopup {
    position:fixed;
    left:16px;
    top:16px;
    background:green;
    color:white;
    -webkit-border-radius:9px;
    -moz-border-radius:9px;
    border-radius:9px;
    padding:12px;
  animation: cssAnimation 0s 5s forwards;
  opacity: 1; 
}

@keyframes cssAnimation {
  to   { opacity: 0; }
}
</style>
