import type { JobPosition } from "./database"

export interface ResumeAnalysis {
  score: number
  skillsMatch: number
  experienceMatch: number
  keywordMatch: number
  educationMatch: number
  strengths: string[]
  improvements: string[]
  details: {
    foundSkills: string[]
    missingSkills: string[]
    experienceYears: number
    relevantExperience: boolean
    educationMatch: boolean
    certifications: string[]
    matchedKeywords: string[]
    missedKeywords: string[]
    experienceLevel: string
    industryMatch: boolean
    aiInsights: string[]
  }
}

export async function analyzeResume(resumeText: string, jobPosition: JobPosition): Promise<ResumeAnalysis> {
  try {
    // First perform basic analysis using our existing methods
    const basicAnalysis = performBasicAnalysis(resumeText, jobPosition)

    // Then enhance with Perplexity AI analysis
    const aiAnalysis = await performPerplexityAnalysis(resumeText, jobPosition)

    // Combine the analyses, with AI analysis taking precedence where available
    return {
      ...basicAnalysis,
      ...aiAnalysis,
      details: {
        ...basicAnalysis.details,
        ...aiAnalysis.details,
        aiInsights: aiAnalysis.details.aiInsights,
      },
      strengths: [...aiAnalysis.strengths],
      improvements: [...aiAnalysis.improvements],
    }
  } catch (error) {
    console.error("Error in Perplexity AI analysis, falling back to basic analysis:", error)
    // Fall back to basic analysis if AI fails
    return performBasicAnalysis(resumeText, jobPosition)
  }
}

async function performPerplexityAnalysis(resumeText: string, jobPosition: JobPosition): Promise<ResumeAnalysis> {
  try {
    // Prepare the prompt for Perplexity AI
    const prompt = `
You are an expert HR professional and resume analyzer. Analyze the following resume against the specific job requirements and provide a detailed assessment.

JOB POSITION DETAILS:
- Title: ${jobPosition.title}
- Description: ${jobPosition.description}
- Requirements: ${jobPosition.requirements}
- Required Skills: ${jobPosition.skills_required.join(", ")}
- Experience Required: ${jobPosition.experience_required}

CANDIDATE RESUME:
${resumeText}

Please analyze this resume thoroughly and provide a detailed assessment in the following JSON format:

{
  "score": [Overall match score from 0-100 based on how well the resume fits the job],
  "skillsMatch": [Skills match percentage from 0-100],
  "experienceMatch": [Experience match percentage from 0-100],
  "keywordMatch": [Keyword relevance percentage from 0-100],
  "educationMatch": [Education match percentage from 0-100],
  "strengths": [Array of 4-6 specific strengths found in the resume that match the job],
  "improvements": [Array of 4-6 specific areas for improvement or missing elements],
  "details": {
    "foundSkills": [Array of specific technical and soft skills found in the resume],
    "missingSkills": [Array of required skills not clearly demonstrated in the resume],
    "experienceYears": [Estimated years of relevant professional experience],
    "relevantExperience": [true/false - does the experience align with job requirements],
    "educationMatch": [true/false - does education background support the role],
    "certifications": [Array of professional certifications or credentials mentioned],
    "matchedKeywords": [Array of important job-related keywords found in resume],
    "missedKeywords": [Array of important job keywords missing from resume],
    "experienceLevel": [String: "Entry Level", "Junior", "Mid Level", "Senior", or "Lead/Principal"],
    "industryMatch": [true/false - does candidate have relevant industry experience],
    "aiInsights": [Array of 4-6 specific, actionable insights about the candidate's fit for this role]
  }
}

Focus on:
1. Technical skills alignment with job requirements
2. Relevant work experience and achievements
3. Education and certifications relevance
4. Industry knowledge and domain expertise
5. Leadership and soft skills demonstration
6. Career progression and growth potential

Provide honest, constructive feedback that would help both the employer and candidate understand the fit.
`

    // Call the Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "system",
            content:
              "You are an expert HR professional specializing in resume analysis and candidate assessment. Provide detailed, accurate, and constructive feedback.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log("Perplexity AI Response:", aiResponse)

    // Extract the JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Perplexity AI response")
    }

    const analysisResult = JSON.parse(jsonMatch[0])

    // Ensure all required fields are present with defaults
    return {
      score: Math.min(Math.max(analysisResult.score || 0, 0), 100),
      skillsMatch: Math.min(Math.max(analysisResult.skillsMatch || 0, 0), 100),
      experienceMatch: Math.min(Math.max(analysisResult.experienceMatch || 0, 0), 100),
      keywordMatch: Math.min(Math.max(analysisResult.keywordMatch || 0, 0), 100),
      educationMatch: Math.min(Math.max(analysisResult.educationMatch || 0, 0), 100),
      strengths: Array.isArray(analysisResult.strengths) ? analysisResult.strengths : [],
      improvements: Array.isArray(analysisResult.improvements) ? analysisResult.improvements : [],
      details: {
        foundSkills: Array.isArray(analysisResult.details?.foundSkills) ? analysisResult.details.foundSkills : [],
        missingSkills: Array.isArray(analysisResult.details?.missingSkills) ? analysisResult.details.missingSkills : [],
        experienceYears: Math.max(analysisResult.details?.experienceYears || 0, 0),
        relevantExperience: Boolean(analysisResult.details?.relevantExperience),
        educationMatch: Boolean(analysisResult.details?.educationMatch),
        certifications: Array.isArray(analysisResult.details?.certifications)
          ? analysisResult.details.certifications
          : [],
        matchedKeywords: Array.isArray(analysisResult.details?.matchedKeywords)
          ? analysisResult.details.matchedKeywords
          : [],
        missedKeywords: Array.isArray(analysisResult.details?.missedKeywords)
          ? analysisResult.details.missedKeywords
          : [],
        experienceLevel: analysisResult.details?.experienceLevel || "Unknown",
        industryMatch: Boolean(analysisResult.details?.industryMatch),
        aiInsights: Array.isArray(analysisResult.details?.aiInsights) ? analysisResult.details.aiInsights : [],
      },
    }
  } catch (error) {
    console.error("Perplexity AI analysis error:", error)
    throw error
  }
}

// Our existing analysis as a fallback
function performBasicAnalysis(resumeText: string, jobPosition: JobPosition): ResumeAnalysis {
  const resumeLower = resumeText.toLowerCase()
  const jobDescLower = (jobPosition.description + " " + jobPosition.requirements).toLowerCase()

  // Enhanced skill extraction and matching
  const skillsAnalysis = analyzeSkills(resumeLower, jobPosition.skills_required)

  // Enhanced experience analysis
  const experienceAnalysis = analyzeExperience(resumeText, jobPosition.experience_required)

  // Enhanced keyword matching
  const keywordAnalysis = analyzeKeywords(resumeLower, jobDescLower, jobPosition)

  // Education and certification analysis
  const educationAnalysis = analyzeEducation(resumeLower)

  // Calculate weighted scores
  const skillsMatch = skillsAnalysis.matchPercentage
  const experienceMatch = experienceAnalysis.matchPercentage
  const keywordMatch = keywordAnalysis.matchPercentage
  const educationMatch = educationAnalysis.matchPercentage

  // Calculate overall score with proper weighting
  const score = Math.round(
    skillsMatch * 0.35 + // 35% for skills
      experienceMatch * 0.25 + // 25% for experience
      keywordMatch * 0.25 + // 25% for keywords
      educationMatch * 0.15, // 15% for education
  )

  // Generate detailed strengths and improvements
  const { strengths, improvements } = generateFeedback({
    skillsAnalysis,
    experienceAnalysis,
    keywordAnalysis,
    educationAnalysis,
    jobPosition,
  })

  return {
    score,
    skillsMatch,
    experienceMatch,
    keywordMatch,
    educationMatch,
    strengths,
    improvements,
    details: {
      foundSkills: skillsAnalysis.foundSkills,
      missingSkills: skillsAnalysis.missingSkills,
      experienceYears: experienceAnalysis.years,
      relevantExperience: experienceAnalysis.isRelevant,
      educationMatch: educationAnalysis.hasRelevantEducation,
      certifications: educationAnalysis.certifications,
      matchedKeywords: keywordAnalysis.matchedKeywords,
      missedKeywords: keywordAnalysis.missedKeywords,
      experienceLevel: experienceAnalysis.level,
      industryMatch: keywordAnalysis.industryMatch,
      aiInsights: [],
    },
  }
}

function analyzeSkills(resumeText: string, requiredSkills: string[]) {
  const foundSkills: string[] = []
  const missingSkills: string[] = []

  requiredSkills.forEach((skill) => {
    const skillVariations = generateSkillVariations(skill)
    const isFound = skillVariations.some((variation) => resumeText.includes(variation.toLowerCase()))

    if (isFound) {
      foundSkills.push(skill)
    } else {
      missingSkills.push(skill)
    }
  })

  const matchPercentage = requiredSkills.length > 0 ? Math.round((foundSkills.length / requiredSkills.length) * 100) : 0

  return { foundSkills, missingSkills, matchPercentage }
}

function generateSkillVariations(skill: string): string[] {
  const variations = [skill]
  const skillLower = skill.toLowerCase()

  // Add common variations
  const commonVariations: { [key: string]: string[] } = {
    javascript: ["js", "javascript", "java script", "ecmascript"],
    typescript: ["ts", "typescript", "type script"],
    react: ["react.js", "reactjs", "react js"],
    "node.js": ["nodejs", "node js", "node"],
    python: ["python3", "py"],
    java: ["java se", "java ee", "openjdk"],
    "c++": ["cpp", "c plus plus"],
    "c#": ["csharp", "c sharp"],
    sql: ["mysql", "postgresql", "sqlite", "mssql"],
    aws: ["amazon web services", "amazon aws"],
    docker: ["containerization", "containers"],
    kubernetes: ["k8s", "container orchestration"],
  }

  if (commonVariations[skillLower]) {
    variations.push(...commonVariations[skillLower])
  }

  return variations
}

function analyzeExperience(resumeText: string, requiredExperience: string) {
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
    /(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)/gi,
    /experience[:\s]*(\d+)\+?\s*years?/gi,
    /(\d+)\+?\s*years?\s*in/gi,
  ]

  let maxYears = 0
  let totalMatches = 0

  experiencePatterns.forEach((pattern) => {
    const matches = resumeText.matchAll(pattern)
    for (const match of matches) {
      const years = Number.parseInt(match[1])
      if (!isNaN(years)) {
        maxYears = Math.max(maxYears, years)
        totalMatches++
      }
    }
  })

  // If no explicit years found, try to infer from job history
  if (maxYears === 0) {
    maxYears = inferExperienceFromJobHistory(resumeText)
  }

  const requiredYears = extractRequiredYears(requiredExperience)
  const isRelevant = maxYears >= requiredYears * 0.8 // Allow 20% flexibility

  let matchPercentage = 0
  if (requiredYears > 0) {
    matchPercentage = Math.min(Math.round((maxYears / requiredYears) * 100), 100)
  } else {
    matchPercentage = maxYears > 0 ? 80 : 40 // Default scoring when no specific requirement
  }

  const level = determineExperienceLevel(maxYears)

  return { years: maxYears, isRelevant, matchPercentage, level }
}

function inferExperienceFromJobHistory(resumeText: string): number {
  // Look for date patterns to infer experience
  const datePatterns = [
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi,
    /\d{1,2}\/\d{4}/g,
    /\d{4}\s*-\s*\d{4}/g,
    /\d{4}\s*to\s*\d{4}/gi,
    /\d{4}\s*-\s*present/gi,
  ]

  const dates: number[] = []
  datePatterns.forEach((pattern) => {
    const matches = resumeText.matchAll(pattern)
    for (const match of matches) {
      const yearMatch = match[0].match(/\d{4}/)
      if (yearMatch) {
        dates.push(Number.parseInt(yearMatch[0]))
      }
    }
  })

  if (dates.length >= 2) {
    const minYear = Math.min(...dates)
    const maxYear = Math.max(...dates)
    const currentYear = new Date().getFullYear()

    // Use the span from earliest to latest date, or to current year
    return Math.max(maxYear, currentYear) - minYear
  }

  return 0
}

function extractRequiredYears(experienceReq: string): number {
  const patterns = [/(\d+)\+?\s*years?/gi, /(\d+)\+?\s*yrs?/gi]

  for (const pattern of patterns) {
    const match = experienceReq.match(pattern)
    if (match) {
      return Number.parseInt(match[1])
    }
  }

  // Default mapping for common terms
  const experienceLower = experienceReq.toLowerCase()
  if (experienceLower.includes("entry") || experienceLower.includes("junior")) return 1
  if (experienceLower.includes("mid") || experienceLower.includes("intermediate")) return 3
  if (experienceLower.includes("senior")) return 5
  if (experienceLower.includes("lead") || experienceLower.includes("principal")) return 7

  return 2 // Default
}

function determineExperienceLevel(years: number): string {
  if (years <= 1) return "Entry Level"
  if (years <= 3) return "Junior"
  if (years <= 5) return "Mid Level"
  if (years <= 8) return "Senior"
  return "Lead/Principal"
}

function analyzeKeywords(resumeText: string, jobDescription: string, jobPosition: JobPosition) {
  // Extract important keywords from job description
  const jobKeywords = extractImportantKeywords(jobDescription)
  const industryKeywords = getIndustryKeywords(jobPosition.title)

  const allKeywords = [...jobKeywords, ...industryKeywords]
  const matchedKeywords: string[] = []
  const missedKeywords: string[] = []

  allKeywords.forEach((keyword) => {
    if (resumeText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    } else {
      missedKeywords.push(keyword)
    }
  })

  const matchPercentage = allKeywords.length > 0 ? Math.round((matchedKeywords.length / allKeywords.length) * 100) : 0

  const industryMatch = industryKeywords.some((keyword) => resumeText.includes(keyword.toLowerCase()))

  return { matchedKeywords, missedKeywords, matchPercentage, industryMatch }
}

function extractImportantKeywords(text: string): string[] {
  // Remove common words and extract meaningful terms
  const commonWords = new Set([
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "we",
    "you",
    "they",
    "them",
    "their",
    "our",
    "your",
    "his",
    "her",
    "its",
    "who",
    "what",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "now",
    "work",
    "working",
    "experience",
    "ability",
    "skills",
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word))

  // Count frequency and return most common meaningful words
  const wordCount = new Map<string, number>()
  words.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word)
}

function getIndustryKeywords(jobTitle: string): string[] {
  const titleLower = jobTitle.toLowerCase()

  const industryKeywords: { [key: string]: string[] } = {
    developer: ["development", "programming", "coding", "software", "application"],
    engineer: ["engineering", "technical", "system", "architecture", "design"],
    qa: ["testing", "quality", "automation", "bug", "defect", "test cases"],
    data: ["analytics", "database", "sql", "analysis", "reporting"],
    manager: ["management", "leadership", "team", "project", "coordination"],
    designer: ["design", "ui", "ux", "user interface", "user experience", "visual"],
  }

  const keywords: string[] = []
  Object.entries(industryKeywords).forEach(([key, values]) => {
    if (titleLower.includes(key)) {
      keywords.push(...values)
    }
  })

  return keywords
}

function analyzeEducation(resumeText: string) {
  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "doctorate",
    "degree",
    "university",
    "college",
    "computer science",
    "engineering",
    "information technology",
    "software engineering",
    "bsc",
    "msc",
    "btech",
    "mtech",
    "be",
    "me",
    "bs",
    "ms",
  ]

  const certificationKeywords = [
    "certified",
    "certification",
    "certificate",
    "aws",
    "google",
    "microsoft",
    "oracle",
    "cisco",
    "comptia",
    "pmp",
    "scrum master",
    "agile",
    "itil",
  ]

  const hasRelevantEducation = educationKeywords.some((keyword) => resumeText.includes(keyword.toLowerCase()))

  const certifications = certificationKeywords.filter((keyword) => resumeText.includes(keyword.toLowerCase()))

  const matchPercentage = hasRelevantEducation
    ? certifications.length > 0
      ? 90
      : 70
    : certifications.length > 0
      ? 60
      : 30

  return { hasRelevantEducation, certifications, matchPercentage }
}

function generateFeedback({
  skillsAnalysis,
  experienceAnalysis,
  keywordAnalysis,
  educationAnalysis,
  jobPosition,
}: any) {
  const strengths: string[] = []
  const improvements: string[] = []

  // Skills feedback
  if (skillsAnalysis.matchPercentage >= 80) {
    strengths.push(
      `Excellent technical skills match (${skillsAnalysis.foundSkills.length}/${skillsAnalysis.foundSkills.length + skillsAnalysis.missingSkills.length} required skills found)`,
    )
  } else if (skillsAnalysis.matchPercentage >= 60) {
    strengths.push(`Good technical skills foundation with ${skillsAnalysis.foundSkills.length} relevant skills`)
    improvements.push(`Consider developing: ${skillsAnalysis.missingSkills.slice(0, 3).join(", ")}`)
  } else {
    improvements.push(`Significant skills gap - focus on: ${skillsAnalysis.missingSkills.slice(0, 5).join(", ")}`)
  }

  // Experience feedback
  if (experienceAnalysis.matchPercentage >= 80) {
    strengths.push(`Strong experience level (${experienceAnalysis.years} years) matching job requirements`)
  } else if (experienceAnalysis.years > 0) {
    if (experienceAnalysis.years < 2) {
      improvements.push(
        "Consider highlighting relevant projects, internships, or coursework to demonstrate practical experience",
      )
    } else {
      improvements.push("Emphasize specific achievements and impact in previous roles")
    }
  } else {
    improvements.push("Include more details about your professional experience and accomplishments")
  }

  // Keywords and industry match
  if (keywordAnalysis.matchPercentage >= 70) {
    strengths.push("Resume language aligns well with job requirements")
  } else {
    improvements.push("Incorporate more industry-specific terminology from the job description")
  }

  if (keywordAnalysis.industryMatch) {
    strengths.push("Demonstrates relevant industry knowledge")
  }

  // Education feedback
  if (educationAnalysis.hasRelevantEducation) {
    strengths.push("Educational background supports the role requirements")
  }

  if (educationAnalysis.certifications.length > 0) {
    strengths.push(
      `Professional certifications enhance candidacy: ${educationAnalysis.certifications.slice(0, 3).join(", ")}`,
    )
  } else {
    improvements.push("Consider obtaining relevant professional certifications")
  }

  // Specific improvements based on job role
  const jobTitleLower = jobPosition.title.toLowerCase()
  if (jobTitleLower.includes("senior") && experienceAnalysis.years < 5) {
    improvements.push("For senior roles, highlight leadership experience and mentoring capabilities")
  }

  if (jobTitleLower.includes("qa") && !keywordAnalysis.matchedKeywords.some((k) => k.includes("test"))) {
    improvements.push("Emphasize testing methodologies, automation tools, and quality assurance processes")
  }

  return { strengths, improvements }
}
