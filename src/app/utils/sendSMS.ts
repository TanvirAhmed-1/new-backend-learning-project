import axios from "axios";

export const sendSMS = async (phone: string, message: string) => {
  // 👉 এখানে তোমার SMS provider API বসাবে

  const response = await axios.post("https://sms-provider.com/api/send", {
    to: phone,
    message,
  });

  return response.data;
};