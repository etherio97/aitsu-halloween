requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      config: { fee: 0, max_drink: 0 },
      student_id: "",
      lists: [],
      is_loading: false,
      is_found: false,
      share_qr: false,
    },
    methods: {
      onSearch() {
        let sid = this.student_id.toLowerCase();
        if (!sid.includes("st")) sid = "st" + sid;
        let ref = database.ref("v0").child("registered");
        let studentRef = ref.orderByChild("student_id").equalTo(sid);
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
      onCheckIn({ id, amount_paid }) {
        if (!confirm("Are you sure do you mark as check in?")) return;
        let ref = database.ref("v0").child("registered").child(id);
        if (amount_paid <= this.config.fee) {
          amount_paid = this.config.fee;
        }
        ref
          .update({
            amount_paid,
            is_attend: true,
            checked_in: Date.now(),
          })
          .then(() => {
            this.onShareQR({ id });
            this.onSearch();
          });
      },
      onUndoCheckIn({ id, amount_paid }) {
        var newAmount = prompt(
          "Do you want to update paid amount?",
          amount_paid
        );
        if (!newAmount) return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .update({
            amount_paid,
            is_attend: false,
            checked_in: 0,
          })
          .then(() => {
            this.onSearch();
          });
      },
      onShareQR({ id }) {
        this.share_qr = true;
        setTimeout(() => {
          var url = new URL(`${location.protocol}//${location.host}`);
          url.searchParams.append("id", id);
          generate(url.toString());
        }, 200);
      },
      onCloseQR() {
        this.share_qr = false;
      },
      onDelete({ id }) {
        if (!confirm("Are you sure do you want to delete?")) return;
        let ref = database.ref("v0").child("registered").child(id);
        ref.remove().then(() => this.onSearch());
      },
      toDate(input) {
        return input ? moment(input).format("DD/MM/YYYY HH:MM:SS") : "-";
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
