<template>
  <v-card class="" elevation="" max-width="">
    <v-card-text>
      <v-layout row wrap>
        <v-flex xs12>
          
          <v-card v-for="item in containers" :key="item._id" color="light-blue" class="black--text" >
            <v-container fluid grid-list-lg>
              <v-layout row>
                <v-flex xs7>
                  <div>
                    <div class="headline"></div>
                    <div>{{item.hostname}}</div>
                  </div>
                </v-flex>
                <v-flex xs5>
                  <v-card-text>
                    {{item.counter}}
                  </v-card-text>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-btn text :color="pingEnabled ? 'green' : 'gray'" v-on:click="()=>{pingEnabled = !pingEnabled; ping();}" :disabled="!pingEnabled"> START PING </v-btn>
      <v-btn text :color="pingStopEnabled ? 'red' : 'gray'" v-on:click="()=>{pingStopEnabled = !pingStopEnabled; stopPing();}" :disabled="!pingStopEnabled" > STOP PING </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
const axios = require('axios').default;
export default {
  name: "Main",
  data: () => ({
    pingFloodInterval: undefined,
    pingEnabled: true,
    pingStopEnabled: false,
    containers:[]
  }),
  methods: {
    ping: function() {
      if (this.pingFloodInterval) {
        return;
      }
      this.pingStopEnabled = true;
      this.pingFloodInterval = setInterval(() => {
        axios.get("http://localhost:80/ping").then((response)=> {
          this.addContainer(response?.data[0]);
        });
      }, 100);
    },
    stopPing: function () {
      if (this.pingFloodInterval == undefined) {
        return;
      }
      clearInterval(this.pingFloodInterval);
      this.pingFloodInterval = undefined;
      this.pingEnabled = true;
    },
    addContainer: function ({_id, hostname, counter}) {
      let containerInArray = function(container){
        
        return container._id == _id;
      }.bind(this);
      let existing = this.containers.filter(containerInArray);
      console.warn(existing, _id, hostname, counter);
    
      if (existing.length == 1) {
        existing[0].counter++;
      } else {
        this.containers.push({_id, hostname, counter});
      }
    }
  }
  
};
</script>
