from fpdf import FPDF
import re

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Sarker.shop - Complete Features List', border=False, align='C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

def safe_text(text):
    # Strip emojis and non-latin characters for fpdf core fonts
    # Convert to ASCII and back, ignoring errors
    return text.encode('ascii', 'ignore').decode('ascii').strip()

def convert_md_to_pdf(input_file, output_file):
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(5)
            continue
        
        # Heading 1
        if line.startswith('# '):
            text = safe_text(line[2:])
            pdf.set_font('helvetica', 'B', 16)
            pdf.set_text_color(31, 73, 125)
            pdf.cell(0, 10, text, ln=True)
            pdf.set_text_color(0, 0, 0)
            pdf.ln(2)
        
        # Heading 2
        elif line.startswith('## '):
            text = safe_text(line[3:])
            pdf.set_font('helvetica', 'B', 14)
            pdf.set_text_color(0, 102, 204)
            pdf.cell(0, 10, text, ln=True)
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
            
        # Heading 3
        elif line.startswith('### '):
            text = safe_text(line[4:])
            pdf.set_font('helvetica', 'B', 12)
            pdf.cell(0, 10, text, ln=True)
            pdf.ln(1)
            
        # Horizontal Rule
        elif line.startswith('---'):
            pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 190, pdf.get_y())
            pdf.ln(5)
            
        # Bullet Points
        elif line.startswith('- '):
            text = line[2:].strip()
            # Handle bold text in bullets
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
            text = safe_text(text)
            
            pdf.set_font('helvetica', '', 11)
            pdf.set_x(15)
            # Use '*' instead of '•' to avoid encoding issues
            pdf.multi_cell(0, 7, f'* {text}', ln=True)
            
        # Regular Text
        else:
            # Handle bold text
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
            text = safe_text(text)
            
            if not text: continue
            
            pdf.set_font('helvetica', '', 11)
            pdf.multi_cell(0, 7, text, ln=True)

    pdf.output(output_file)
    print(f"Successfully converted {input_file} to {output_file}")

if __name__ == "__main__":
    convert_md_to_pdf('features.md', 'features.pdf')
