requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      email: "",
      name: "",
      student_id: "",
      dietary_preference: "",
      amount_paid: 0,
      type: "Participant",
      is_walked_in: true,
      is_registered: false,
      is_loading: false,
      remaining: { chicken: 0, vege: 0 },
      registrant: {},
    },
    methods: {
      onRegister() {
        let registrant = {
          email: this.email,
          name: this.name,
          student_id: this.student_id.toLowerCase(),
          dietary_preference: this.dietary_preference,
          email: this.email,
          had_dinner: 0,
          is_walked_in: !!this.is_walked_in,
          is_attend: !!this.is_walked_in,
          amount_paid: parseInt(this.amount_paid),
          type: this.type,
          checked_in: this.is_walked_in ? Date.now() : 0,
          registered_at: Date.now(),
        };
        if (!registrant.student_id.includes("st")) {
          registrant.student_id = "st" + registrant.student_id;
        }
        let ref = database.ref("v0").child("registered");
        this.is_loading = true;
        ref.push(registrant).then(async (snap) => {
          let newConfig = {
            total_revenue: firebase.database.ServerValue.increment(
              registrant.amount_paid
            ),
          };
          if (registrant.is_walked_in) {
            newConfig.total_attend = firebase.database.ServerValue.increment(1);
            newConfig.total_walked = firebase.database.ServerValue.increment(1);
          } else {
            newConfig.total_registered =
              firebase.database.ServerValue.increment(1);
          }
          switch (this.type) {
            case "Volunteer":
              newConfig.total_volunteer =
                firebase.database.ServerValue.increment(1);
              break;
            case "Performer":
              newConfig.total_performer =
                firebase.database.ServerValue.increment(1);
              break;
            default:
              newConfig.total_participant =
                firebase.database.ServerValue.increment(1);
              break;
          }
          switch (this.dietary_preference) {
            case "Chicken":
              if (registrant.is_walked_in) {
                newConfig.walked_chicken =
                  firebase.database.ServerValue.increment(1);
              } else {
                newConfig.registered_chicken =
                  firebase.database.ServerValue.increment(1);
              }
              break;
            case "Vegetarian":
              if (registrant.is_walked_in) {
                newConfig.walked_vege =
                  firebase.database.ServerValue.increment(1);
              } else {
                newConfig.registered_vege =
                  firebase.database.ServerValue.increment(1);
              }
              break;
          }
          await database.ref("v0").child("config").update(newConfig);
          var id = snap.key;
          var url = new URL(`${location.protocol}//${location.host}`);
          url.searchParams.append("id", id);
          this.is_registered = true;
          this.registrant = registrant;
          setTimeout(() => {
            generate(url.toString());
          }, 200);
        });
      },
      checkWalkin(registrant) {
        return registrant.is_walked_in ? " (Walk-in)" : "";
      },
    },
    mounted() {
      let ref = database.ref("v0").child("config");
      ref.get().then((snap) => {
        let config = snap.val();
        this.amount_paid = config.fee;
        this.remaining.chicken =
          config.total_chicken -
          (config.registered_chicken + config.walked_chicken);
        this.remaining.vege =
          config.total_vege - (config.registered_vege + config.walked_vege);
      });
    },
  });

  function generate(user_input) {
    let qr_code_element = document.querySelector(".qr-code");

    qr_code_element.style = "";

    new QRCode(qr_code_element, {
      logo: "./assets/logo.png",
      text: user_input,
      width: 350,
      height: 350,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L,
    });
  }
});
