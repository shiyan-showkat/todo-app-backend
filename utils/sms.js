export const sendSMS = async (phone, otp) => {
  try {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: "YOUR_MSG91_AUTH_KEY",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: "YOUR_TEMPLATE_ID",
        short_url: "0",
        recipients: [
          {
            mobiles: `91${phone}`,
            var1: otp,
          },
        ],
      }),
    });

    const data = await res.json();
    console.log("SMS response:", data);

    return data;
  } catch (err) {
    console.log("SMS error:", err.message);
  }
};
