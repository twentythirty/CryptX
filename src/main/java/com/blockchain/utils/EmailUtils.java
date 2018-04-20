package com.blockchain.utils;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class EmailUtils {
	public static final void sendMail(String receiver,String subject , String msg) {
        //Sender's E-Mail and Password.
        final String senderEmail = "zeeshan@syncrasytech.com";
        final String senderPassword = "11061994";
        System.out.println("email and password set");
        // Defining the gmail host
        String host = "smtp.gmail.com";
        System.out.println("host set");
        // Creating Properties object
        Properties props = new Properties();
        System.out.println("properties");
        
        // Defining properties
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
	props.put("mail.smtp.host", host);
	props.put("mail.smtp.port", "587");
        
        Session mailSession = Session.getInstance(props, new javax.mail.Authenticator() {
        @Override
        protected PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication(senderEmail, senderPassword);
        }
    });
        try {
        Message message = new MimeMessage(mailSession);
			message.setFrom(new InternetAddress(senderEmail));
			message.setRecipients(Message.RecipientType.TO,
				InternetAddress.parse(receiver));
			message.setSubject(subject);
			message.setText(msg);

			Transport.send(message);

			System.out.println("Done");

    } catch (MessagingException mex) {
        mex.printStackTrace();
    }
}
}
