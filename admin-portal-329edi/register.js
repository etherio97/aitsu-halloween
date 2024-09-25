requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      email: "",
      name: "",
      student_id: "",
      school: "",
      intake_year: "",
      intake_month: "",
      program: "",
      dietary_preference: "",
      is_walked_in: true,
      is_registered: false,
      is_loading: false,
    },
    methods: {
      onRegister() {
        let registrant = {
          email: this.email,
          name: this.name,
          student_id: this.student_id.toLowerCase(),
          school: this.school,
          intake_year: parseInt(this.intake_year),
          intake_month: this.intake_month,
          program: this.program,
          dietary_preference: this.dietary_preference,
          is_walked_in: !!this.is_walked_in,
          email: this.email,
          had_dinner: 0,
          had_drink: 0,
          is_attend: false,
          amount_paid: 100,
          checked_in: 0,
          registered_at: Date.now(),
        };
        let ref = database.ref("v0").child("registered");
        this.is_loading = true;
        ref.push(registrant).then((snap) => {
          var id = snap.key;
          var url = new URL(`${location.protocol}//${location.host}`);
          url.searchParams.append("id", id);
          this.is_registered = true;
          setTimeout(() => {
            generate(url.toString());
          }, 200);
        });
      },
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
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
});
