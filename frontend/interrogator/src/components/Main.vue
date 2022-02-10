<template>
  <v-card class="" elevation="" max-width="">
    <v-card-text>
      <v-card
        v-for="item in containers"
        :key="item._id"
        color="light-blue"
        class="black--text"
      >
        <div class="headline"></div>
        <div>{{ item.hostname }}</div>
        <v-card-text>
          {{ item.counter }}
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions>
      <v-btn
        text
        :color="pingEnabled ? 'green' : 'gray'"
        v-on:click="
          () => {
            pingEnabled = !pingEnabled;
            ping();
          }
        "
        :disabled="!pingEnabled"
      >
        START PING
      </v-btn>
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
        STOP PING
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
const axios = require("axios").default;
export default {
  name: "Main",
  data: () => ({
    pingFloodInterval: undefined,
    pingEnabled: true,
    pingStopEnabled: false,
    containers: [],
  }),
  methods: {
    ping: function () {
      if (this.pingFloodInterval) {
        return;
      }
      this.pingStopEnabled = true;
      this.pingFloodInterval = setInterval(() => {
        axios.get("http://172.20.66.91:80/ping").then((response) => {
          this.addContainer(response?.data[0]);
        });
      }, 36);
    },
    stopPing: function () {
      if (this.pingFloodInterval == undefined) {
        return;
      }
      clearInterval(this.pingFloodInterval);
      this.pingFloodInterval = undefined;
      this.pingEnabled = true;
    },
    addContainer: function ({ _id, hostname, counter }) {
      let containerInArray = function (container) {
        return container._id == _id;
      }.bind(this);
      let existing = this.containers.filter(containerInArray);

      if (existing.length == 1) {
        existing[0].counter = counter;
      } else {
        this.containers.push({ _id, hostname, counter });
      }
    },
  },
};
</script>
