<template>
  <div>
    <v-virtual-scroll 
      item-height="100px"
      height="800px"
      :items="containers"
    >
      <template v-slot:default="{ item }">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title :class="item.textColor">{{ item.hostname }}</v-list-item-title>
            <v-spacer></v-spacer>
          </v-list-item-content>        
        </v-list-item>
        <v-progress-linear
          color="success"
          stream
          :value="(item.counter/counterSum) * 100"
          height="25"
        >
          <template v-slot:default="{ value }">
            <strong>{{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>
        <v-spacer></v-spacer>
      </template>
    </v-virtual-scroll>

    <v-footer height="100px" dark padless fixed class="teal darken-4 white--text text-center">
      <v-layout row wrap justify-center >
        <v-spacer></v-spacer>
          <v-btn
            text
            :color="pingEnabled ? 'blue lighten-3' : 'gray'"
            v-on:click="
              () => {
                pingEnabled = !pingEnabled;
                ping();
              }
            "
            :disabled="!pingEnabled"
          >
            <v-icon dark left> mdi-lan-connect </v-icon>
            START PING
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn
            text
            :color="pingStopEnabled ? 'red' : 'gray'"
            v-on:click="
              () => {
                pingStopEnabled = !pingStopEnabled;
                stopPing();
              }
            "
            :disabled="!pingStopEnabled"
          >
            <v-icon dark left> mdi-lan-disconnect </v-icon>
            STOP PING
          </v-btn>

          <v-spacer></v-spacer>

          <v-slider
            label="delta intervall"
            v-model="pingIntervalDuration"
            color="primary"
            track-color="secondary"
            thumb-color="primary"
            thumb-label
            min="1"
            max="200"
          ></v-slider>

          <v-spacer></v-spacer>

          totale chiamate : {{ counterSum }}

          <v-spacer></v-spacer>

          <v-btn
            text
            color="warning"
            v-on:click="
              () => {
                killRandomContainer();
              }
            "
            tile
          >
            <v-icon dark left> mdi-skull-scan </v-icon>
            STOP A CONTAINER
          </v-btn>
          <v-spacer></v-spacer>
      </v-layout>
    </v-footer>
  </div>
</template>

<script>
const axios = require("axios").default;
axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
export default {
  name: "Main",
  data: () => ({
    counterSum: 0,
    pingFloodInterval: undefined,
    pingEnabled: true,
    pingStopEnabled: false,
    containers: [],
    pingIntervalDuration: 200,
  }),
  methods: {
    ping: function () {
      if (this.pingFloodInterval) {
        return;
      }
      this.pingStopEnabled = true;
      this.pingFloodInterval = setInterval(() => {
        axios.get("/server/ping").then((response) => {
          if (response.data?.status) {
            this.addContainer({hostname: response.data.hostname, status: response.data.status})
          } else {
            this.addContainer(response?.data[0]); 
          }
        });
      }, this.pingIntervalDuration);
    },
    stopPing: function () {
      if (this.pingFloodInterval == undefined) {
        return;
      }
      clearInterval(this.pingFloodInterval);
      this.pingFloodInterval = undefined;
      this.pingEnabled = true;
    },
    addContainer: function ({ _id = undefined, hostname, counter = undefined, status = undefined}) {
      let containerInArray = function (container) {
        if (status !== undefined) {
          return container.hostname == hostname;
        } else {
          return container._id == _id || container.hostname == hostname;
        }
      }.bind(this);
      let existing = this.containers.filter(containerInArray);

      let textColor = this.getHeadlineColor(status);
      if (existing.length == 1) {
        existing[0].counter = counter || 0;
        existing[0].status = status;
        existing[0].textColor = textColor;
        existing[0]._id = _id;
        existing[0].hostname = hostname;
      } else {
        this.containers.push({ _id, hostname, counter, status, textColor});
      }

      this.counterSum = 0;
      this.containers.forEach(
        (container) => (this.counterSum += container.counter)
      );
    },
    killRandomContainer: function () {
      axios.get("/server/kill").then((res) => {
        let containerInArray = function (container) {
          return container.hostname == res.data.hostname;
        }.bind(this);
        let existing = this.containers.filter(containerInArray);
        let textColor = this.getHeadlineColor(res.data.status);
        if (existing.length > 0) {
          let deactivate = function (container) {
            if (container.hostname == res.data.hostname) {
              container.status = res.data.status;
              container.textColor = textColor;
            }
          };
          this.containers.map(deactivate, this);
        } else {
          // se il container non è mai stato interrogato prima si inserisce nella lista
          this.containers.push({ _id: undefined, hostname: res.data.hostname, counter: 0, status: res.data.status, textColor: textColor});
        }      
      });
    },
    getHeadlineColor: function (status = undefined) {
      switch (status) {
        case 'pending':
          return 'yellow--text'
        case 'killed':
          return 'red--text';
        default:
          return 'white--text';
      }
    }
  },
};
</script>
