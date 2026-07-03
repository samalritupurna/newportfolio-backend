from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_resume():
    c = canvas.Canvas("resume.pdf", pagesize=letter)
    width, height = letter

    # Set up some basic formatting
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "Ritupurna Samal")

    c.setFont("Helvetica-Oblique", 14)
    c.setFillColorRGB(0.3, 0.3, 0.3)
    c.drawString(50, height - 75, "Web Developer & AI/ML Enthusiast")

    c.setFont("Helvetica", 10)
    c.setFillColorRGB(0, 0, 0)
    c.drawString(50, height - 100, "Bhubaneswar, Odisha | 8144187710 | samalritupurna201@gmail.com")
    
    # Draw a line
    c.setStrokeColorRGB(0.9, 0.24, 0.55) # Pink color
    c.setLineWidth(2)
    c.line(50, height - 110, width - 50, height - 110)

    # Summary
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 140, "Professional Summary")
    
    c.setFont("Helvetica", 11)
    summary_lines = [
        "Motivated computer applications graduate with a strong passion for software development,",
        "artificial intelligence, and machine learning. Eager to build a successful career in the",
        "tech industry by applying foundational programming knowledge, rapidly adapting to",
        "emerging technologies, and contributing to innovative and meaningful software solutions."
    ]
    y = height - 160
    for line in summary_lines:
        c.drawString(50, y, line)
        y -= 15

    # Experience
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y - 20, "Experience")
    
    y -= 45
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Junior Developer Intern (AI/ML)")
    c.setFont("Helvetica-Oblique", 11)
    c.drawString(50, y - 15, "Infophy Technology Pvt. Ltd. | Bhubaneswar | Current")
    
    c.setFont("Helvetica", 11)
    y -= 35
    c.drawString(60, y, "- Gaining hands-on, practical experience at a dynamic technology startup.")
    y -= 15
    c.drawString(60, y, "- Exploring and contributing to innovative solutions within the AI/ML domain.")
    y -= 15
    c.drawString(60, y, "- Applying foundational programming concepts to develop intelligent software.")

    # Education
    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Education")

    y -= 25
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Master of Computer Applications (MCA)")
    c.setFont("Helvetica-Oblique", 11)
    c.drawString(50, y - 15, "GITA Autonomous College | Bhubaneswar | Currently Pursuing")

    c.setFont("Helvetica", 11)
    y -= 35
    c.drawString(60, y, "- Focusing on advanced computing, software engineering, and application architecture.")

    y -= 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Bachelor of Computer Applications (BCA)")
    c.setFont("Helvetica-Oblique", 11)
    c.drawString(50, y - 15, "NC Autonomous College | Jajpur | 2022 - 2025")

    c.setFont("Helvetica", 11)
    y -= 35
    c.drawString(60, y, "- CGPA: 8.87")
    y -= 15
    c.drawString(60, y, "- Completed core modules in programming systems, databases, and mathematics.")

    # Technical Skills
    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Technical Skills")

    c.setFont("Helvetica", 11)
    y -= 25
    c.drawString(60, y, "- Programming Languages: Java, C, Python, C++ (Basic Knowledge)")
    y -= 15
    c.drawString(60, y, "- Frontend Development: HTML (Basic Knowledge)")
    y -= 15
    c.drawString(60, y, "- Backend Development: Database Management (Basic Knowledge)")

    c.save()

if __name__ == "__main__":
    create_resume()
