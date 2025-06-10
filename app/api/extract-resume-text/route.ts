import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size)

    let extractedText = ""

    // Handle different file types
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      extractedText = await file.text()
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      extractedText = await extractPDFText(file)
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      extractedText = await extractDOCXText(file)
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Clean and validate extracted text
    extractedText = extractedText.trim()

    if (extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from the file. Please ensure the file contains readable text." },
        { status: 400 },
      )
    }

    console.log("Successfully extracted text, length:", extractedText.length)

    return NextResponse.json({
      success: true,
      text: extractedText,
      length: extractedText.length,
    })
  } catch (error) {
    console.error("Error extracting text from file:", error)
    return NextResponse.json({ error: "Failed to extract text from file" }, { status: 500 })
  }
}

async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string for text extraction
    let pdfContent = ""
    for (let i = 0; i < uint8Array.length; i++) {
      pdfContent += String.fromCharCode(uint8Array[i])
    }

    // Extract text using multiple methods
    let extractedText = ""

    // Method 1: Extract text between BT and ET markers (text objects)
    const textObjectRegex = /BT\s*(.*?)\s*ET/gs
    const textObjects = pdfContent.match(textObjectRegex) || []

    textObjects.forEach((textObj) => {
      // Extract text from Tj and TJ operators
      const tjMatches = textObj.match(/$$(.*?)$$\s*Tj/g) || []
      const tjArrayMatches = textObj.match(/\[(.*?)\]\s*TJ/g) || []

      tjMatches.forEach((match) => {
        const text = match.match(/$$(.*?)$$/)?.[1]
        if (text) {
          extractedText += text + " "
        }
      })

      tjArrayMatches.forEach((match) => {
        const arrayContent = match.match(/\[(.*?)\]/)?.[1]
        if (arrayContent) {
          const textParts = arrayContent.match(/$$(.*?)$$/g) || []
          textParts.forEach((part) => {
            const text = part.replace(/[()]/g, "")
            extractedText += text + " "
          })
        }
      })
    })

    // Method 2: Extract readable ASCII text
    if (extractedText.length < 100) {
      let readableText = ""
      let inWord = false
      let currentWord = ""

      for (let i = 0; i < uint8Array.length; i++) {
        const char = uint8Array[i]

        if (char >= 32 && char <= 126) {
          // Printable ASCII
          currentWord += String.fromCharCode(char)
          inWord = true
        } else if (inWord && (char === 10 || char === 13 || char === 32)) {
          // End of word
          if (currentWord.length > 2 && /^[a-zA-Z0-9@._-]+$/.test(currentWord)) {
            readableText += currentWord + " "
          }
          currentWord = ""
          inWord = false
        } else {
          // Non-printable character
          if (inWord && currentWord.length > 2) {
            if (/^[a-zA-Z0-9@._-]+$/.test(currentWord)) {
              readableText += currentWord + " "
            }
          }
          currentWord = ""
          inWord = false
        }
      }

      // Add final word if exists
      if (currentWord.length > 2 && /^[a-zA-Z0-9@._-]+$/.test(currentWord)) {
        readableText += currentWord + " "
      }

      if (readableText.length > extractedText.length) {
        extractedText = readableText
      }
    }

    // Method 3: Look for common resume patterns
    if (extractedText.length < 100) {
      const patterns = [
        /(?:name|contact|email|phone|address|experience|education|skills|summary|objective)[\s:]+([a-zA-Z0-9\s@._-]+)/gi,
        /([a-zA-Z]{3,}\s+[a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})?)/g, // Names
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, // Emails
        /(\d{3}[-.]?\d{3}[-.]?\d{4})/g, // Phone numbers
      ]

      patterns.forEach((pattern) => {
        const matches = pdfContent.match(pattern) || []
        matches.forEach((match) => {
          if (match.length > 3) {
            extractedText += match + " "
          }
        })
      })
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/[^\w\s@._-]/g, " ")
      .replace(/\b\w{1,2}\b/g, "") // Remove very short words
      .trim()

    return extractedText
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Could not extract text from PDF file")
  }
}

async function extractDOCXText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to string
    let content = ""
    for (let i = 0; i < uint8Array.length; i++) {
      if (uint8Array[i] >= 32 && uint8Array[i] <= 126) {
        content += String.fromCharCode(uint8Array[i])
      } else if (uint8Array[i] === 10 || uint8Array[i] === 13) {
        content += " "
      }
    }

    let extractedText = ""

    // Method 1: Extract from Word XML text elements
    const textMatches = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
    textMatches.forEach((match) => {
      const text = match.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, "")
      if (text.trim().length > 0) {
        extractedText += text + " "
      }
    })

    // Method 2: Extract from other XML text patterns
    const otherPatterns = [/<text[^>]*>([^<]+)<\/text>/g, /<p[^>]*>([^<]+)<\/p>/g, />([A-Za-z][A-Za-z0-9\s.,@-]{5,})</g]

    otherPatterns.forEach((pattern) => {
      const matches = content.match(pattern) || []
      matches.forEach((match) => {
        const text = match.replace(/<[^>]*>/g, "").replace(/^>/, "")
        if (text.length > 5 && !extractedText.includes(text)) {
          extractedText += text + " "
        }
      })
    })

    // Method 3: Extract readable sequences
    if (extractedText.length < 100) {
      const readableSequences = content.match(/[A-Za-z][A-Za-z0-9\s.,@-]{10,}/g) || []
      readableSequences.forEach((seq) => {
        if (!extractedText.includes(seq)) {
          extractedText += seq + " "
        }
      })
    }

    // Clean up
    extractedText = extractedText.replace(/\s+/g, " ").trim()

    return extractedText
  } catch (error) {
    console.error("DOCX extraction error:", error)
    throw new Error("Could not extract text from DOCX file")
  }
}
