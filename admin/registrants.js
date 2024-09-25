requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      registrants: [],
    },
    methods: {},
    mounted() {
      let registeredRef = database.ref("v0").child("registered");
      registeredRef.get().then((snap) => {
        let registrants = Object.entries(snap.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        this.registrants = registrants;
      });
    },
  });
});
