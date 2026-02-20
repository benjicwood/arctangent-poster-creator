<template>
  <div class="side-bar">
    <div style="background-color: white">
      <p>Thursday headliners</p>
    </div>
  </div>
</template>

<script>
// import { defineComponent } from '@vue/composition-api'

export default {
  name: "SidePanel",
  data() {
    return {
      showBar: false,
    };
  },
  methods: {
    // addConfirmed() {
    //   this.bandPosition.fridayHeadliner = 'qotsa'
    //   this.bandPosition.saturdayHeadliner = 'fob'
    //   this.bandPosition.sundayHeadliner = 'a7x'
    //   console.log('hello')
    // },
  },
};
</script>

<style scoped lang="scss">
// .show-bar {
//     visibility: hidden;
// }
@media screen and (max-width: 992px) {
  .side-bar {
    display: none;
  }
}

.side-bar {
  font-family: "Nunito", sans-serif;
  font-weight: bold;
  width: 25%;
  margin: 0 auto;
}
.email-box {
  background-color: white;
  text-align: center;
  //   width: 330px;
  padding-top: 5px;
}
.input-box {
  display: flex;
  flex-direction: column;
  input,
  textarea {
    width: 80%;
    margin: auto;
  }
}
.send-button {
  background-color: #ff5f5f29 !important;
  color: #ff5f5f !important;
  border: 2px solid #ff5f5f14 !important;
  border-radius: 100px !important;
  padding: 5px 10px;
  margin-top: 5px;
}
</style>
