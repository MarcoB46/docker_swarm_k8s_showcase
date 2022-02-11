<template>
  <v-card class="" elevation="" max-width="">
    <v-card-text>
      <v-card v-for="item in containers" :key="item._id">
        <div class="headline">
          {{ item.hostname }}
        </div>

        <v-card-text>
          {{ item.counter }}
          <v-spacer></v-spacer>
          <v-progress-linear
            :buffer-value="counterSum"
            color="success"
            stream
            :value="item.counter"
          ></v-progress-linear>
          <v-spacer></v-spacer>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>

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
    </v-card-actions>
  </v-card>
</template>

<script>
const axios = require("axios").default;
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
        axios.get("http://172.23.102.164:80/ping").then((response) => {
          this.addContainer(response?.data[0]);
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
      this.counterSum = 0;
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
      this.counterSum = 0;
      this.containers.forEach(
        (container) => (this.counterSum += container.counter)
      );
    },
  },
};
</script>
