const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ausgeflippte@gmail.com',
        subject: 'Welcome to join us!',
        text: `Hello ${name}, how are you today? `,
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ausgeflippte@gmail.com',
        subject: 'Sorry to see you go.',
        text: `Bye ${name} hope to see you back soon!`,
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail,
}
