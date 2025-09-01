#!/bin/bash

# SSL Certificate Setup for EDU AI
# This script helps set up SSL certificates for NGINX

DOMAIN="${1:-eduai.com}"
SSL_DIR="./nginx/ssl"

echo "Setting up SSL certificates for domain: $DOMAIN"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Option 1: Self-signed certificate for development
generate_self_signed() {
    echo "Generating self-signed certificate for development..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $SSL_DIR/$DOMAIN.key \
        -out $SSL_DIR/$DOMAIN.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    
    echo "Self-signed certificate generated!"
    echo "Key: $SSL_DIR/$DOMAIN.key"
    echo "Certificate: $SSL_DIR/$DOMAIN.crt"
}

# Option 2: Let's Encrypt certificate for production
generate_letsencrypt() {
    echo "Setting up Let's Encrypt certificate..."
    echo "Note: Make sure your domain points to this server before running certbot"
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y certbot
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install certbot
        else
            echo "Please install certbot manually for your OS"
            exit 1
        fi
    fi
    
    # Generate certificate
    sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN
    
    # Copy certificates to nginx directory
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/$DOMAIN.crt
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/$DOMAIN.key
    sudo chown $USER:$USER $SSL_DIR/$DOMAIN.*
    
    echo "Let's Encrypt certificate set up!"
}

# Main menu
echo "Choose certificate type:"
echo "1) Self-signed (for development)"
echo "2) Let's Encrypt (for production)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        generate_self_signed
        ;;
    2)
        generate_letsencrypt
        ;;
    *)
        echo "Invalid choice. Generating self-signed certificate..."
        generate_self_signed
        ;;
esac

echo ""
echo "SSL setup complete!"
echo "Update your nginx configuration with the correct domain name and restart nginx."
