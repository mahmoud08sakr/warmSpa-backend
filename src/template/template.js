import dotenv from "dotenv";
import { config } from "../utilts/config.js";
dotenv.config();

export const sendTemplate = (userData, order) => {
    let confirmationHtml;
    return confirmationHtml = `
        <!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<style type="text/css">
    body { background-color: #88BDBF; margin: 0px; }
</style>
<body style="margin:0px;">
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
        <tr>
            <td>
                <table border="0" width="100%">
                    <tr>
                        <td>
                            <h1>
                                <img width="100px" href="https://front-ten-zeta-78.vercel.app/#/home"
                                    src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/Logo_Eng-_Color_imtte2.png" />
                            </h1>
                        </td>
                        <td>
                            <p style="text-align: right;"><a href="https://front-ten-zeta-78.vercel.app/#/home"
                                    target="_blank" style="text-decoration: none;">View In Website</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table border="0" cellpadding="0" cellspacing="0"
                    style="text-align:center;width:100%;background-color: #fff;">
                    <tr>
                        <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                            <img width="" height="" src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/5tires_qz8xaq.png">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h1 style="padding-top:25px; color:#630E2B">Thank You, ${userData.name}, for Your Order!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2 style="padding-top:25px; color:#630E2B">Your Order Number: ${order._id}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>We appreciate your purchase and are excited to get your order ready. Please click on the button to check the order in the site.</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                <a href="${config.clientUrl}/order/${order._id}"
                                    style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B;">Go to your order</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                    <tr>
                        <td>
                            <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div style="margin-top:20px;">
                                <a href="${config.facebookLink}" style="text-decoration: none;"><span class="twit"
                                        style="padding:10px 9px;color:#fff;border-radius:50%;">
                                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png"
                                            width="50px" height="50px"></span></a>
                                <a href="${config.instagramLink}" style="text-decoration: none;"><span class="twit"
                                        style="padding:10px 9px;color:#fff;border-radius:50%;">
                                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png"
                                            width="50px" height="50px"></span></a>
                                <a href="${config.twitterLink}" style="text-decoration: none;"><span class="twit"
                                        style="padding:10px 9px;color:#fff;border-radius:50%;">
                                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png"
                                            width="50px" height="50px"></span></a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

export const invoiceTemplate = (userData, order) => {
    let invoiceHtml = '';
    return invoiceHtml = `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<style type="text/css">
    body { background-color: #88BDBF; margin: 0px; }
</style>
<body style="margin:0px;">
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
        <tr>
            <td>
                <table border="0" width="100%">
                    <tr>
                        <td>
                            <h1>
                                <img width="100px" href="https://front-ten-zeta-78.vercel.app/#/home"
                                    src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/Logo_Eng-_Color_imtte2.png" />
                            </h1>
                        </td>
                        <td>
                            <p style="text-align: right;"><a href="https://front-ten-zeta-78.vercel.app/#/home"
                                    target="_blank" style="text-decoration: none;">View In Website</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table border="0" cellpadding="0" cellspacing="0"
                    style="text-align:center;width:100%;background-color: #fff;">
                    <tr>
                        <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                            <img width="" height="" src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/5tires_qz8xaq.png">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h1 style="padding-top:25px; color:#630E2B">Your Invoice, ${userData.name}!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2 style="padding-top:25px; color:#630E2B">Order Number: ${order._id}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>Please find your invoice attached for your recent order. Thank you for your purchase!</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                <a href="${config.clientUrl}/order/${order._id}"
                                    style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B;">View Order Details</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                    <tr>
                        <td>
                            <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div style="margin-top:20px;">
                                <a href="${config.facebookLink}" style="text-decoration: none;"><span class="twit"
                                        style="padding:10px 9px;color:#fff;border-radius:50%;">
                                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png"
                                            width="50px" height="50px"></span></a>
                                <a href="${config.instagramLink}" style="text-decoration: none;"><span class="twit"
                                        style="padding:10px 9px;color:#fff;border-radius:50%;">
                                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png"
                                            width="50px" height="50px"></span></a>
                                <a href="${config.twitterLink}" style="text-decoration: none;"><span class="twit"
                                        style="padding:10px 9px;color:#fff;border-radius:50%;">
                                        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png"
                                            width="50px" height="50px"></span></a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}


export const sendOrderMail = (userData, orderId) => {
    let html = ''
    return html = `<!DOCTYPE html>
    <html>
    
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <style type="text/css">
        body {
            background-color: #88BDBF;
            margin: 0px;
        }
    </style>
    
    <body style="margin:0px;">
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
            <tr>
                <td>
                    <table border="0" width="100%">
                        <tr>
                            <td>
                                <h1>
                                    <img width="100px" href="https://front-ten-zeta-78.vercel.app/#/home"
                                        src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/Logo_Eng-_Color_imtte2.png" />
                                </h1>
                            </td>
                            <td>
                                <p style="text-align: right;"><a href="https://front-ten-zeta-78.vercel.app/#/home"
                                        target="_blank" style="text-decoration: none;">View In Website</a></p>
                            </td>
    
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table border="0" cellpadding="0" cellspacing="0"
                        style="text-align:center;width:100%;background-color: #fff;">
                        <tr>
                            <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                                <img width="" height="" src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/5tires_qz8xaq.png">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style="padding-top:25px; color:#630E2B">Thank You, ${userData.name}, for Your Order!</h1>
                            </td>
    
                        </tr>
                        <tr>
                            <td>
                                <h2 style="padding-top:25px; color:#630E2B">Your Order Number: ${orderId}</h1>
                            </td>
    
                        </tr>
                        <tr>
                            <td>
                                <p>We appreciate your purchase and are excited to get your order ready. Please click on the button to check the order in the site.</p>
                            </td>
    
                        </tr>
                        <tr>
                            <td>
                                <p style="padding:0px 100px;">
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div>
                                    <a href="${config.clientUrl}/order/${orderId}"
                                        style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Go to your order</a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                        <tr>
                            <td>
                                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="margin-top:20px;">
    
                                    <a href="${config.facebookLink}" style="text-decoration: none;"><span class="twit"
                                            style="padding:10px 9px;color:#fff;border-radius:50%;">
                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png"
                                                width="50px" height="50px"></span></a>

                                    <a href="${config.instagramLink}" style="text-decoration: none;"><span class="twit"
                                            style="padding:10px 9px;color:#fff;border-radius:50%;">
                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png"
                                                width="50px" height="50px"></span>
                                    </a>
    
                                    <a href="${config.twitterLink}" style="text-decoration: none;"><span class="twit"
                                            style="padding:10px 9px;;color:#fff;border-radius:50%;">
                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png"
                                                width="50px" height="50px"></span>
                                    </a>
    
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`
}


export const ActiveMailTemplate = (confirmationLink) => {
    let html = ''
    return html = `<!DOCTYPE html>
                    <html>
                    <head>
                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                    <style type="text/css">
                    body{background-color: #88BDBF;margin: 0px;}
                    </style>
                    <body style="margin:0px;"> 
                    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                    <tr>
                    <td>
                    <table border="0" width="100%">
                    <tr>
                    <td>
                    <a href="www.google.com"  target="_blank" style="display: none;">www.google.com</a > 
                    <h1>
                        <img width="100px" src="https://imgs.search.brave.com/sQKQlbEGmcJQ7Y3fwrRxzhodH-cHHOxvGE2-_FOYExc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM3/NDg3NjMxOC9waG90/by9jbG9zZS11cC1v/Zi1tZWNoYW5pYy1p/bi10aXJlLXNlcnZp/Y2Utd29ya3Nob3At/Y2hhbmdpbmctdGly/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9MUpxTEhEcEZY/OVVrT0dramYxZV83/STFVcXY3U0szN1Js/X1c3NDdVYUZacz0"/>
                    </h1>
                    </td>
                    <td>
                    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
                    </td>
            
                    </tr>
                    </table>
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                    <tr>
                    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <p style="padding:0px 100px;">
                    </p>
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <div> 
                    <a href="${confirmationLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
                    </div>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                    <tr>
                    <td>
                    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <div style="margin-top:20px;">
    
                    <a href="${config.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                    
                    <a href="${config.instagramLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                    </a>
                    
                    <a href="${config.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                    </a>
    
                    </div>
                    </td>
                    </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                    </body>
                    </html>
        `;
}


export const cartCronHtml = (cart) => {
    let html = ''
    return html = `<!DOCTYPE html>
                    <html>
                    <head>
                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
                    </head>
                    <style type="text/css">
                        body { background-color: #88BDBF; margin: 0px; }
                    </style>
                    <body style="margin:0px;">
                        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                            <tr>
                                <td>
                                    <table border="0" width="100%">
                                        <tr>
                                            <td>
                                                <h1>
                                                    <a href="https://front-ten-zeta-78.vercel.app/#/home">
                                                        <img width="100px" src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/Logo_Eng-_Color_imtte2.png" alt="Logo" />
                                                    </a>
                                                </h1>
                                            </td>
                                            <td>
                                                <p style="text-align: right;">
                                                    <a href="https://front-ten-zeta-78.vercel.app/#/home" target="_blank" style="text-decoration: none;">View In Website</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                                        <tr>
                                            <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                                                <img src="https://res.cloudinary.com/dtsp5pztt/image/upload/v1751699279/5tires_qz8xaq.png" alt="Banner">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <h1 style="padding-top:25px; color:#630E2B">Hey ${cart.user.name ? cart.user.name : 'Sir'} , Your Cart Is Waiting!</h1>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <h2 style="padding-top:25px; color:#630E2B">Cart ID: ${cart._id}</h2>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p style="padding: 0 20px;">You left some great items in your cart! Don’t miss out—complete your purchase now before they’re gone.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div>
                                                    <a href="${config.clientUrl}/cart/${cart._id}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B;text-decoration: none;">Return unlocked to Your Cart</a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                                        <tr>
                                            <td>
                                                <h3 style="margin-top:10px; color:#000">Stay in Touch</h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style="margin-top:20px;">
                                                    <a href="${config.facebookLink}" style="text-decoration: none;">
                                                        <span style="padding:10px 9px;color:#fff;border-radius:50%;">
                                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" height="50px" alt="Facebook">
                                                        </span>
                                                    </a>
                                                    <a href="${config.instagramLink}" style="text-decoration: none;">
                                                        <span style="padding:10px 9px;color:#fff;border-radius:50%;">
                                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" height="50px" alt="Instagram">
                                                        </span>
                                                    </a>
                                                    <a href="${config.twitterLink}" style="text-decoration: none;">
                                                        <span style="padding:10px 9px;color:#fff;border-radius:50%;">
                                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" height="50px" alt="Twitter">
                                                        </span>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `
}


export const resetpasswordTemplate = (userData, OTP) => {
    let resetHtml = '';
    return resetHtml = `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<style type="text/css">
    body { background-color: #88BDBF; margin: 0px; }
</style>
<body style="margin:0px;">
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #88BDBF;">
        <tr>
            <td style="background-color:#88BDBF;height:100px;font-size:50px;color:#fff;">
                <img src="" alt="Banner">
            </td>
        </tr>
        <tr>
            <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                    <tr>
                        <td>
                            <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;">
                                <tr>
                                    <td>
                                        <h2 style="padding-top:25px; color:#630E2B">Reset Password</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p style="padding: 0 20px;">Hi ${userData.name},</p>
                                    </td>
                                </tr>
                                     <tr>
                                    <td>
                                        <p style="padding: 0 20px;">your OTP is ${OTP},</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p style="padding: 0 20px;">To reset your password, please click the link below:</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B;text-decoration: none;">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
}