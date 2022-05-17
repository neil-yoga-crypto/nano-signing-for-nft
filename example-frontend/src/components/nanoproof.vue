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
      
      	// Signs given challenge with privateKey from localStorage
      	signChallenge(challenge) {
            const privateKey = JSON.parse(localStorage.getItem('wallet')).secretKey;
            const signed = tools.sign(privateKey, challenge);
            console.log({signed:signed});
            return signed;
        }
    },
    data() {
        return { wallet:localStorage.getItem('wallet'), 'challenge':'?','response':'?','verifyChallenge':'?','verified':false,ws:''};
    },
    async mounted() {
        if(!localStorage.getItem('wallet')) {
            this.$data.wallet = await this.createWallet();
        }
      	
        // to run new thread
        try {
            // connect to <host>/ws to communicate with the backend
            this.$data.ws = new WebSocket(`ws://localhost:9000/ws`);
            let ws = this.$data.ws; 
            console.log('DEBUG connecting websocket',ws);

              
          this.$data.ws.onmessage = (e) => {
            console.log('DEBUG onmessage e',e);
        let message = e.data?.toString();
        if (!message) return; // Ignore empty messages
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.error(e);
            return;
        }
        switch (message.type) {
            case "open":
                // request challenge
                  this.$data.ws.send(
                      JSON.stringify({
                          type:'challenge'
                      })
                  );
                break;
            // to receive challenge
            case "challenge":
                console.log("received challenge",message);
                const signed = this.signChallenge(message.challenge);
                const publicKey = JSON.parse(localStorage.getItem('wallet')).publicKey;

                // sending 
                this.$data.ws.send(JSON.stringify({"type":"message",'type':'verify',"publicKey":publicKey,"signed":signed}));
                break;
            // to receive redirect
            case "redirect":
                console.log("received redirect",message);
                setTimeout(()=> {
                  window.location.href = message.url;
                },3000);
                break;
            default:
                console.log("WS: Unknown reponse");
                break;
            }
        }

        } catch(err) {
            console.error('ws error',(err));
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
