using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using VaccinationManager.Services.Interfaces;
using VaccinationManager.Settings;

namespace VaccinationManager.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendOtpEmailAsync(string email, string otp)
        {
            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(
                    _emailSettings.FromName,
                    _emailSettings.FromEmail));

            message.To.Add(MailboxAddress.Parse(email));

            message.Subject = "Vaccination Manager - OTP Verification";

            message.Body = new TextPart("html")
            {
                Text = $@"
                    <h2>Email Verification</h2>
                    <p>Your OTP code is:</p>
                    <h1>{otp}</h1>
                    <p>This OTP will expire in 5 minutes.</p>
                "
            };

            using var smtp = new SmtpClient();
            smtp.CheckCertificateRevocation = false;

            await smtp.ConnectAsync(
                _emailSettings.Host,
                _emailSettings.Port,
                SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                _emailSettings.Username,
                _emailSettings.Password);

            await smtp.SendAsync(message);

            await smtp.DisconnectAsync(true);
        }
    }
}