import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

export function sendEmail(email, { type, data }) {
  const subject = {
    'reset-password': 'Reset your password',
  }[type];

  const message = {
    'reset-password': `Click <a href="${data.link}">here</a> to reset your password.`,
  }[type];

  mg.messages
    .create(process.env.MAILGUN_DOMAIN, {
      from: 'Everytask <noreply@everytask.com>',
      to: [email],
      subject,
      html: message,
    })
    .then((msg) => {
      console.log(msg); // logs response data
    }) // logs response data
    .catch((err) => console.log(err)); // logs any error
}
