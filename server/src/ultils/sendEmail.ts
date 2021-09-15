import nodemailer from 'nodemailer'

// async..await is not allowed in global scope, must use a wrapper
export const sendMail = async (to: string, subject: string, html: string) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'qknuetkp64wo6kq5@ethereal.email', // generated ethereal user
            pass: 'w1N1nRKTa58ZzggbSS', // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false // avoid Nodejs self signed certificated
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        html // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}