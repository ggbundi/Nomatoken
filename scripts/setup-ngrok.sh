#!/bin/bash

# NomaToken M-Pesa ngrok Setup Script
# This script helps set up ngrok for M-Pesa callback testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if ngrok is installed
check_ngrok_installation() {
    log_header "Checking ngrok Installation"
    
    if command -v ngrok &> /dev/null; then
        log_success "ngrok is installed"
        ngrok version
        return 0
    else
        log_warning "ngrok is not installed"
        return 1
    fi
}

# Install ngrok
install_ngrok() {
    log_header "Installing ngrok"
    
    # Check if npm is available
    if command -v npm &> /dev/null; then
        log_info "Installing ngrok via npm..."
        npm install -g ngrok
        log_success "ngrok installed via npm"
    else
        log_info "npm not found. Installing ngrok via package manager..."
        
        # Detect OS and install accordingly
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
            echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
            sudo apt update && sudo apt install ngrok
            log_success "ngrok installed via apt"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install ngrok/ngrok/ngrok
                log_success "ngrok installed via Homebrew"
            else
                log_error "Homebrew not found. Please install ngrok manually from https://ngrok.com/download"
                exit 1
            fi
        else
            log_error "Unsupported OS. Please install ngrok manually from https://ngrok.com/download"
            exit 1
        fi
    fi
}

# Check if development server is running
check_dev_server() {
    log_header "Checking Development Server"
    
    if curl -s http://localhost:3000/api/mpesa/payment/callback > /dev/null; then
        log_success "Development server is running on port 3000"
        return 0
    else
        log_warning "Development server is not running on port 3000"
        log_info "Please start your development server with: npm run dev"
        return 1
    fi
}

# Start ngrok tunnel
start_ngrok() {
    log_header "Starting ngrok Tunnel"
    
    log_info "Starting ngrok tunnel for port 3000..."
    log_info "This will create a secure tunnel to your local development server"
    log_warning "Keep this terminal window open while testing M-Pesa integration"
    
    echo ""
    log_info "After ngrok starts:"
    log_info "1. Copy the HTTPS forwarding URL (e.g., https://abc123.ngrok.io)"
    log_info "2. Update your .env.local file with: MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/payment/callback"
    log_info "3. Update the callback URL in your Safaricom Developer Dashboard"
    log_info "4. Run 'npm run test:mpesa' to test the integration"
    
    echo ""
    log_info "Press Ctrl+C to stop ngrok when you're done testing"
    echo ""
    
    # Start ngrok
    ngrok http 3000
}

# Main execution
main() {
    log_header "NomaToken M-Pesa ngrok Setup"
    
    # Check if ngrok is installed
    if ! check_ngrok_installation; then
        read -p "Would you like to install ngrok? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_ngrok
        else
            log_error "ngrok is required for M-Pesa callback testing"
            exit 1
        fi
    fi
    
    # Check development server
    if ! check_dev_server; then
        log_warning "Please start your development server first:"
        log_info "npm run dev"
        echo ""
        read -p "Press Enter when your development server is running..."
        
        if ! check_dev_server; then
            log_error "Development server is still not accessible"
            exit 1
        fi
    fi
    
    # Start ngrok
    start_ngrok
}

# Run main function
main "$@"
