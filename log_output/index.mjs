import crypto from "crypto";

const randomString = crypto.randomBytes(8).toString("hex");

const outputString = () => {
  console.log(new Date().toISOString(), randomString);
};

setInterval(outputString, 5000);
