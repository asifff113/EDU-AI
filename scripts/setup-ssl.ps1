# SSL Certificate Setup for EDU AI (PowerShell)
# This script helps set up SSL certificates for NGINX on Windows

param(
    [string]$Domain = "eduai.com"
)

$SSLDir = ".\nginx\ssl"
$ErrorActionPreference = "Stop"

Write-Host "Setting up SSL certificates for domain: $Domain" -ForegroundColor Green

# Create SSL directory if it doesn't exist
if (!(Test-Path $SSLDir)) {
    New-Item -ItemType Directory -Path $SSLDir -Force | Out-Null
}

function New-SelfSignedCert {
    Write-Host "Generating self-signed certificate for development..." -ForegroundColor Yellow
    
    try {
        # Check if OpenSSL is available
        $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
        
        if ($opensslPath) {
            # Use OpenSSL if available
            $keyPath = "$SSLDir\$Domain.key"
            $crtPath = "$SSLDir\$Domain.crt"
            
            & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
                -keyout $keyPath `
                -out $crtPath `
                -subj "/C=US/ST=State/L=City/O=Organization/CN=$Domain"
                
            Write-Host "Self-signed certificate generated with OpenSSL!" -ForegroundColor Green
        }
        else {
            # Use PowerShell's New-SelfSignedCertificate (Windows 10+)
            Write-Host "OpenSSL not found. Using PowerShell cmdlet..." -ForegroundColor Yellow
            
            $cert = New-SelfSignedCertificate -DnsName $Domain -CertStoreLocation "cert:\LocalMachine\My" -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256 -KeyExportPolicy Exportable -Subject "CN=$Domain" -KeyUsage DigitalSignature,KeyEncipherment -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")
            
            # Export to PEM format
            $keyPath = "$SSLDir\$Domain.key"
            $crtPath = "$SSLDir\$Domain.crt"
            
            # Export certificate
            $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
            $certPem = [System.Convert]::ToBase64String($certBytes, 'InsertLineBreaks')
            Set-Content -Path $crtPath -Value "-----BEGIN CERTIFICATE-----`n$certPem`n-----END CERTIFICATE-----"
            
            Write-Host "Self-signed certificate generated with PowerShell!" -ForegroundColor Green
        }
        
        Write-Host "Key: $SSLDir\$Domain.key" -ForegroundColor Cyan
        Write-Host "Certificate: $SSLDir\$Domain.crt" -ForegroundColor Cyan
    }
    catch {
        Write-Error "Failed to generate certificate: $_"
    }
}

function Show-LetsEncryptInstructions {
    Write-Host "For Let's Encrypt certificates in production:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install Certbot:" -ForegroundColor White
    Write-Host "   - Download from: https://certbot.eff.org/"
    Write-Host "   - Or use chocolatey: choco install certbot"
    Write-Host ""
    Write-Host "2. Run certbot:" -ForegroundColor White
    Write-Host "   certbot certonly --standalone -d $Domain -d www.$Domain"
    Write-Host ""
    Write-Host "3. Copy certificates:" -ForegroundColor White
    Write-Host "   Copy fullchain.pem to $SSLDir\$Domain.crt"
    Write-Host "   Copy privkey.pem to $SSLDir\$Domain.key"
    Write-Host ""
    Write-Host "Note: Make sure your domain points to this server before running certbot" -ForegroundColor Red
}

# Main menu
Write-Host ""
Write-Host "Choose certificate type:"
Write-Host "1) Self-signed (for development)"
Write-Host "2) Let's Encrypt instructions (for production)"

$choice = Read-Host "Enter choice [1-2]"

switch ($choice) {
    "1" {
        New-SelfSignedCert
    }
    "2" {
        Show-LetsEncryptInstructions
    }
    default {
        Write-Host "Invalid choice. Generating self-signed certificate..." -ForegroundColor Yellow
        New-SelfSignedCert
    }
}

Write-Host ""
Write-Host "SSL setup complete!" -ForegroundColor Green
Write-Host "Update your nginx configuration with the correct domain name and restart nginx." -ForegroundColor Yellow
