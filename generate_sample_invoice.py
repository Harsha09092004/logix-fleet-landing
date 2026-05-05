#!/usr/bin/env python3
"""
Generate sample invoice images for OCR testing
"""

from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime, timedelta

def create_sample_invoice(filename="sample_invoice.png"):
    """Create a realistic invoice image for OCR testing"""
    
    # Create image
    width, height = 800, 1000
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a decent font, fall back to default
    try:
        title_font = ImageFont.truetype("arial.ttf", 32)
        header_font = ImageFont.truetype("arial.ttf", 18)
        body_font = ImageFont.truetype("arial.ttf", 14)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    y_pos = 20
    
    # Header - Company Name
    draw.text((50, y_pos), "FREIGHTFLOW LOGISTICS", font=title_font, fill='black')
    y_pos += 50
    
    # Company Details
    draw.text((50, y_pos), "TCI EXPRESS LIMITED", font=header_font, fill='black')
    y_pos += 30
    draw.text((50, y_pos), "Head Office: Delhi | Phone: 011-XXXX-XXXX", font=body_font, fill='black')
    y_pos += 25
    draw.text((50, y_pos), "Email: invoices@tciexpress.in | GSTIN: 07AABCT1234H1Z0", font=body_font, fill='black')
    y_pos += 40
    
    # Draw line
    draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
    y_pos += 20
    
    # Invoice Details
    draw.text((50, y_pos), "INVOICE", font=header_font, fill='black')
    draw.text((550, y_pos), f"Date: {datetime.now().strftime('%d-%m-%Y')}", font=body_font, fill='black')
    y_pos += 30
    
    draw.text((50, y_pos), f"Invoice No: INV-2026-00145", font=body_font, fill='black')
    draw.text((550, y_pos), f"Due Date: {(datetime.now() + timedelta(days=30)).strftime('%d-%m-%Y')}", font=body_font, fill='black')
    y_pos += 30
    
    draw.text((50, y_pos), f"Bill No: FFL-20260504-001", font=body_font, fill='black')
    y_pos += 40
    
    # Bill To / Ship To
    draw.text((50, y_pos), "BILL TO:", font=header_font, fill='black')
    draw.text((400, y_pos), "SHIP TO:", font=header_font, fill='black')
    y_pos += 25
    
    draw.text((50, y_pos), "Reliance Industries Ltd", font=body_font, fill='black')
    draw.text((400, y_pos), "Reliance Industries Ltd", font=body_font, fill='black')
    y_pos += 20
    
    draw.text((50, y_pos), "JAMNAGAR REFINERY", font=body_font, fill='black')
    draw.text((400, y_pos), "VADODARA WAREHOUSE", font=body_font, fill='black')
    y_pos += 20
    
    draw.text((50, y_pos), "Jamnagar, Gujarat 361004", font=body_font, fill='black')
    draw.text((400, y_pos), "Vadodara, Gujarat 390023", font=body_font, fill='black')
    y_pos += 40
    
    # Table Header
    draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
    y_pos += 5
    draw.text((50, y_pos), "Description", font=header_font, fill='black')
    draw.text((350, y_pos), "HSN Code", font=header_font, fill='black')
    draw.text((480, y_pos), "Qty", font=header_font, fill='black')
    draw.text((550, y_pos), "Rate", font=header_font, fill='black')
    draw.text((650, y_pos), "Amount", font=header_font, fill='black')
    y_pos += 25
    draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
    y_pos += 15
    
    # Line Items
    items = [
        ("Full Truck Load (FTL) - JAMNAGAR to VADODARA", "9971", "1", "45000", "45000"),
        ("GST (18%)", "9971", "", "", "8100"),
        ("Service Tax", "9971", "", "", "1200"),
    ]
    
    for item, hsn, qty, rate, amount in items:
        draw.text((50, y_pos), item, font=body_font, fill='black')
        draw.text((350, y_pos), hsn, font=body_font, fill='black')
        draw.text((480, y_pos), qty, font=body_font, fill='black')
        draw.text((550, y_pos), rate, font=body_font, fill='black')
        draw.text((650, y_pos), amount, font=body_font, fill='black')
        y_pos += 25
    
    # Draw line
    y_pos += 10
    draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
    y_pos += 15
    
    # Total
    draw.text((550, y_pos), "TOTAL AMOUNT:", font=header_font, fill='black')
    draw.text((650, y_pos), "₹54,300", font=header_font, fill='black')
    y_pos += 40
    
    # Additional Info
    draw.text((50, y_pos), "Vehicle Number: DL-01-AB-1234", font=body_font, fill='black')
    y_pos += 25
    draw.text((50, y_pos), "Route: Delhi → Vadodara (1200 KM)", font=body_font, fill='black')
    y_pos += 25
    draw.text((50, y_pos), "Transport Mode: Full Truck Load (FTL)", font=body_font, fill='black')
    y_pos += 25
    draw.text((50, y_pos), "Delivery Time: 3 Days", font=body_font, fill='black')
    y_pos += 40
    
    # Footer
    draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
    y_pos += 10
    draw.text((50, y_pos), "Bank Details: HDFC Bank | A/c: 1234567890 | IFSC: HDFC0001234", font=small_font, fill='black')
    y_pos += 20
    draw.text((50, y_pos), "Terms & Conditions: Payment due within 30 days | Liability limited to invoice amount", font=small_font, fill='black')
    
    # Save
    output_path = f"backend/{filename}"
    image.save(output_path)
    print(f"✅ Sample invoice created: {output_path}")
    return output_path

if __name__ == "__main__":
    create_sample_invoice("sample_invoice.png")
    print("\n📸 You can now upload this invoice via the OCR page!")
    print("📍 File location: backend/sample_invoice.png")
