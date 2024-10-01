requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      config: { fee: 0 },
      student_id: "",
      email: "",
      lists: [],
      is_loading: false,
      is_found: false,
      share_qr: false,
      registrant: {},
      search_type: "",
    },
    methods: {
      inputEvent(event) {
        this.search_type = event;
        if (event === "email") {
          this.student_id = "";
        } else {
          this.email = "";
        }
      },
      onSearch() {
        let input, studentRef;
        let ref = database.ref("v0").child("registered");
        if (this.search_type == "email") {
          input = this.email;
          studentRef = ref.orderByChild("email").equalTo(input);
        } else {
          input = this.student_id.toLowerCase();
          if (!input.includes("st")) input = "st" + input;
          studentRef = ref.orderByChild("student_id").equalTo(input);
        }
        this.is_loading = true;
        studentRef.get().then((snap) => {
          this.is_loading = false;
          let data = snap.val();
          if (!data) {
            this.lists = [];
            this.is_found = false;
            return;
          }
          this.is_found = true;
          this.lists = Object.entries(data).map(([id, data]) => ({
            id,
            ...data,
          }));
        });
      },
      onCheckIn({ id }) {
        if (!confirm("Are you sure do you mark as check in?")) return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .update({
            is_attend: true,
            checked_in: Date.now(),
          })
          .then(async () => {
            database
              .ref("v0")
              .child("config")
              .update({
                total_attend: firebase.database.ServerValue.increment(1),
              });
            this.onShareQR({ id });
            this.onSearch();
          });
      },
      onShareQR(registrant) {
        this.share_qr = true;
        this.registrant = registrant;
        setTimeout(() => {
          var url = new URL(`${location.protocol}//${location.host}`);
          url.searchParams.append("id", registrant.id);
          generate(url.toString());
        }, 200);
      },
      onCloseQR() {
        this.share_qr = false;
      },
      onDelete({
        id,
        is_attend,
        dietary_preference,
        is_walked_in,
        amount_paid,
      }) {
        if (!confirm("Are you sure do you want to delete?")) return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .remove()
          .then(() => this.onSearch())
          .then(() => {
            let newConfig = {
              total_revenue: firebase.database.ServerValue.increment(
                -amount_paid
              ),
            };
            if (is_attend) {
              newConfig.total_attend =
                firebase.database.ServerValue.increment(-1);
            }
            if (is_walked_in) {
              newConfig.total_walked =
                firebase.database.ServerValue.increment(-1);
              switch (dietary_preference) {
                case "Chicken Dinner Box":
                  newConfig.walked_chicken =
                    firebase.database.ServerValue.increment(-1);
                  break;
                case "Pork Dinner Box":
                  newConfig.walked_pork =
                    firebase.database.ServerValue.increment(-1);
                  break;
                case "Vegetarian Dinner Box":
                  newConfig.walked_vege =
                    firebase.database.ServerValue.increment(-1);
                  break;
              }
            } else {
              newConfig.total_registered =
                firebase.database.ServerValue.increment(-1);
              switch (dietary_preference) {
                case "Chicken Dinner Box":
                  newConfig.registered_chicken =
                    firebase.database.ServerValue.increment(-1);
                  break;
                case "Pork Dinner Box":
                  newConfig.registered_pork =
                    firebase.database.ServerValue.increment(-1);
                  break;
                case "Vegetarian Dinner Box":
                  newConfig.registered_vege =
                    firebase.database.ServerValue.increment(-1);
                  break;
              }
            }
            database.ref("v0").child("config").update(newConfig);
          });
      },
      toDate(input) {
        return input ? moment(input).format("DD/MM/YYYY HH:MM:SS") : "-";
      },
      checkWalkin(registrant) {
        return registrant.is_walked_in ? " (Walk-in)" : "";
      },
    },
    computed: {
      isDisabled() {
        if (this.is_loading) return true;
        if (!this.email && !this.student_id) return true;
        return false;
      },
    },
    mounted() {
      let ref = database.ref("v0").child("config");
      ref.get().then((snap) => {
        this.config = snap.val();
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
