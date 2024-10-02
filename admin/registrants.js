requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      registrant: {},
      registrants: [],
      share_qr: false,
    },
    methods: {
      onShareQR(registrant) {
        this.share_qr = true;
        this.registrant = registrant;
        setTimeout(() => {
          var url = new URL(`${location.protocol}//${location.host}`);
          url.searchParams.append("id", registrant.id);
          generate(url.toString());
        }, 200);
      },
      exportExcel() {
        const data = this.registrants.map((user) => ({
          ID: user.id,
          "Student ID": user.student_id,
          Name: user.name,
          "Participation Type": user.type,
          "Amount Paid": user.amount_paid,
          "Email Address": user.email,
          "Dietary Preference": user.dietary_preference,
          Attendance: user.is_attend ? "Yes" : "No",
          "Registration Type": user.is_walked_in ? "Walk In" : "Registered",
          Dinner: user.had_dinner ? "Yes" : "No",
          Drinks: user.had_drink,
          "Check In Time": user.checked_in
            ? moment(user.checked_in).format("DD/MM/YYYY HH:MM:SS")
            : "",
          "Register Time": moment(user.registered_at).format(
            "DD/MM/YYYY HH:MM:SS"
          ),
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        const s2ab = (s) => {
          const buf = new ArrayBuffer(s.length);
          const view = new Uint8Array(buf);
          for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xff;
          }
          return buf;
        };

        XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

        const wbout = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "binary",
        });

        const blob = new Blob([s2ab(wbout)], {
          type: "application/octet-stream",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download =
          "Beats and Breaks Party - Participant Lists - " +
          moment().format("DD-MM-YYYY-HH-MM") +
          ".xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onCloseQR() {
        this.share_qr = false;
      },
      checkWalkin(registrant) {
        return registrant.is_walked_in ? " (Walk-in)" : "";
      },
    },
    mounted() {
      let registeredRef = database.ref("v0").child("registered");
      registeredRef.on("value", (snap) => {
        let registrants = Object.entries(snap.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        this.registrants = registrants;
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
