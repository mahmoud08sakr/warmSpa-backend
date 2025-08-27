import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { AppError } from "../errorHandling/AppError.js";
dotenv.config();
console.log(process.env.EMAIL , process.env.GOOGLE_APP_PASSWORD);

export const sendEmail = async (to, html, attachment, subject) => {
    if (attachment == "undefined") {
        console.log("ana gowa el sendEmail");
        
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.GOOGLE_APP_PASSWORD,
                },
            });
            const mailOptions = {
                from: ` <${process.env.EMAIL}>`,
                to: to,
                subject: subject || "Email Confirmation",
                text: "Please confirm your email by clicking the button below.",
                html: html,
            };
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.log(error);
            throw new AppError(error, 500);
        }
    } else {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.GOOGLE_APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: ` <${process.env.EMAIL}>`,
                to: to,
                subject: subject,
                text: "Please confirm your email by clicking the button below.",
                html: html,
                attachments: [
                    {
                        filename: attachment.attachments.filename,
                        content: attachment.attachments.content,
                        contentType: attachment.attachments.contentType
                    }
                ],
            };
            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw new AppError(error);
        }

    }
}


