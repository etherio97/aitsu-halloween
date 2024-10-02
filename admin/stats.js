requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      config: {},
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
          let total_revenue = 0,
            total_walked = 0,
            total_registered = 0,
            total_attend = 0,
            total_participant = 0,
            total_performer = 0,
            total_volunteer = 0,
            registered_chicken = 0,
            registered_pork = 0,
            registered_vege = 0,
            walked_chicken = 0,
            walked_pork = 0,
            walked_vege = 0;
          for (let item of data) {
            if (item.is_attend) {
              total_attend++;
            }
            if (item.is_walked_in) {
              total_walked++;
            } else {
              total_registered++;
            }
            switch (item.type) {
              case "Volunteer":
                total_volunteer++;
                break;
              case "Performer":
                total_performer++;
                break;
              default:
                total_participant++;
            }
            switch (item.dietary_preference) {
              case "Chicken Dinner Box":
                if (item.is_walked_in) {
                  walked_chicken++;
                } else {
                  registered_chicken++;
                }
                break;
              case "Pork Dinner Box":
                if (item.is_walked_in) {
                  walked_pork++;
                } else {
                  registered_pork++;
                }
                break;
              case "Vegetarian Dinner Box":
                if (item.is_walked_in) {
                  walked_vege++;
                } else {
                  registered_vege++;
                }
                break;
            }
            total_revenue += parseInt(item.amount_paid) || 0;
          }
          let ref = database.ref("v0").child("config");
          ref
            .update({
              total_revenue,
              total_registered,
              total_walked,
              total_attend,
              total_participant,
              total_performer,
              total_volunteer,
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
      ref.on("value", (snap) => {
        try {
          this.config = snap.val();
        } catch (e) {
          location.reload();
        }
      });
    },
  });
});
