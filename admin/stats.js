requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      config: { fee: 0, max_drink: 0 },
      is_recalculating: false,
    },
    methods: {
      recalculate() {
        let ref = database.ref("v0").child("registered");
        this.is_recalculating = true;
        ref.get().then((snap) => {
          let data = Object.entries(snap.val()).map(([id, data]) => ({
            id,
            ...data,
          }));
          let registered_chicken = 0,
            registered_pork = 0,
            registered_vege = 0,
            walked_chicken = 0,
            walked_pork = 0,
            walked_vege = 0;
          for (let item of data) {
            switch (item.dietary_preference) {
              case "Chicken Dinner Box":
                if (item.is_walked_in) {
                  registered_chicken++;
                } else {
                  walked_chicken++;
                }
                break;
              case "Pork Dinner Box":
                if (item.is_walked_in) {
                  registered_pork++;
                } else {
                  walked_pork++;
                }
                break;
              case "Vegetarian Dinner Box":
                if (item.is_walked_in) {
                  registered_vege++;
                } else {
                  walked_vege++;
                }
                break;
            }
          }
          let ref = database.ref("v0").child("config");
          ref
            .update({
              registered_chicken,
              registered_pork,
              registered_vege,
              walked_chicken,
              walked_pork,
              walked_vege,
            })
            .then(() => {
              this.is_recalculating = false;
            });
        });
      },
    },
    mounted() {
      let ref = database.ref("v0").child("config");
      ref.get().then((snap) => {
        this.config = snap.val();
      });
    },
  });
});
